from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import feedparser
import requests
import yfinance as yf
from dotenv import load_dotenv


LOGGER = logging.getLogger("fetcher")
IST = ZoneInfo("Asia/Kolkata")

NEWS_FEEDS = {
    "Moneycontrol": "https://www.moneycontrol.com/rss/latestnews.xml",
    "Economic Times": "https://economictimes.indiatimes.com/markets/rss.cms",
    "Livemint": "https://www.livemint.com/rss/markets",
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
}


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def data_dir() -> Path:
    configured = os.getenv("DATA_DIR")
    if configured:
        return Path(configured)
    return Path("/data") if Path("/data").exists() else project_root() / "data"


def now_ist() -> str:
    return datetime.now(IST).isoformat()


def read_json(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def pct_change(price: float | None, previous_close: float | None) -> float | None:
    if price is None or previous_close in (None, 0):
        return None
    return round(((price - previous_close) / previous_close) * 100, 2)


def number(value: Any) -> float | int | None:
    if value is None:
        return None
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    if numeric.is_integer():
        return int(numeric)
    return round(numeric, 2)


def fetch_news_entries() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for source, url in NEWS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
        except Exception as exc:  # noqa: BLE001
            LOGGER.warning("Failed to parse %s: %s", source, exc)
            continue

        for item in feed.entries[:40]:
            title = getattr(item, "title", "").strip()
            link = getattr(item, "link", "").strip()
            if title:
                entries.append({"title": title, "source": source, "url": link})
    return entries


def news_for_symbol(symbol: str, name: str, entries: list[dict[str, str]], limit: int = 3) -> list[dict[str, str]]:
    cleaned_symbol = symbol.replace(".NS", "").replace(".BO", "").replace("^", "")
    keywords = {cleaned_symbol.lower()}
    keywords.update(part.lower() for part in name.replace("&", " ").split() if len(part) > 2)

    matches: list[dict[str, str]] = []
    for entry in entries:
        title = entry["title"].lower()
        if any(keyword in title for keyword in keywords):
            matches.append(entry)
        if len(matches) >= limit:
            break
    return matches


def fast_info_value(info: Any, key: str) -> Any:
    try:
        return getattr(info, key)
    except Exception:  # noqa: BLE001
        pass
    try:
        return info.get(key)
    except Exception:  # noqa: BLE001
        return None


def fetch_yfinance_symbol(symbol: str, entries: list[dict[str, str]]) -> dict[str, Any] | None:
    ticker = yf.Ticker(symbol)
    info = ticker.fast_info

    price = number(fast_info_value(info, "last_price"))
    previous_close = number(fast_info_value(info, "previous_close"))
    name = symbol
    sector = None
    avg_volume = number(fast_info_value(info, "three_month_average_volume"))

    try:
        metadata = ticker.get_info()
        name = metadata.get("longName") or metadata.get("shortName") or symbol
        sector = metadata.get("sector")
        avg_volume = avg_volume or number(metadata.get("averageVolume"))
    except Exception as exc:  # noqa: BLE001
        LOGGER.info("Metadata unavailable for %s: %s", symbol, exc)

    return {
        "name": name,
        "price": price,
        "currency": fast_info_value(info, "currency") or ("INR" if symbol.endswith(".NS") else "USD"),
        "pct_change": pct_change(float(price), float(previous_close)) if price and previous_close else None,
        "volume": number(fast_info_value(info, "last_volume")),
        "avg_volume": avg_volume,
        "day_high": number(fast_info_value(info, "day_high")),
        "day_low": number(fast_info_value(info, "day_low")),
        "week_52_high": number(fast_info_value(info, "year_high")),
        "week_52_low": number(fast_info_value(info, "year_low")),
        "sector": sector,
        "news": news_for_symbol(symbol, name, entries),
    }


def fetch_stocks(symbols: list[str], entries: list[dict[str, str]]) -> dict[str, Any]:
    stocks: dict[str, Any] = {}
    for symbol in symbols:
        try:
            data = fetch_yfinance_symbol(symbol, entries)
            if data:
                stocks[symbol] = data
        except Exception as exc:  # noqa: BLE001
            LOGGER.warning("Failed to fetch %s: %s", symbol, exc)
    return stocks


def fetch_crypto(ids: list[str], entries: list[dict[str, str]]) -> dict[str, Any]:
    if not ids:
        return {}

    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": ",".join(ids),
        "vs_currencies": "inr,usd",
        "include_24hr_change": "true",
        "include_market_cap": "true",
    }

    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
        raw = response.json()
    except Exception as exc:  # noqa: BLE001
        LOGGER.warning("Failed to fetch crypto prices: %s", exc)
        return {}

    crypto: dict[str, Any] = {}
    for coin_id in ids:
        data = raw.get(coin_id, {})
        display_name = coin_id.replace("-", " ").title()
        crypto[coin_id] = {
            "name": display_name,
            "price_inr": number(data.get("inr")),
            "price_usd": number(data.get("usd")),
            "pct_change_24h": number(data.get("usd_24h_change")),
            "market_cap_usd": number(data.get("usd_market_cap")),
            "news": news_for_symbol(coin_id, display_name, entries),
        }
    return crypto


def market_open_minutes(now: datetime) -> int:
    open_time = now.replace(hour=9, minute=15, second=0, microsecond=0)
    return round((open_time - now).total_seconds() / 60)


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    target_dir = data_dir()
    watchlist = read_json(target_dir / "watchlist.json", {"stocks": {}, "crypto": [], "indices": []})
    entries = fetch_news_entries()

    stock_symbols = watchlist.get("stocks", {}).get("indian", []) + watchlist.get("stocks", {}).get("us", [])
    index_symbols = watchlist.get("indices", [])

    payload = {
        "fetched_at": now_ist(),
        "market_open_minutes": market_open_minutes(datetime.now(IST)),
        "stocks": fetch_stocks(stock_symbols, entries),
        "crypto": fetch_crypto(watchlist.get("crypto", []), entries),
        "indices": fetch_stocks(index_symbols, entries),
    }

    write_json(target_dir / "fetched.json", payload)
    LOGGER.info(
        "Wrote fetched data: %s stocks, %s crypto assets, %s indices",
        len(payload["stocks"]),
        len(payload["crypto"]),
        len(payload["indices"]),
    )


if __name__ == "__main__":
    main()
