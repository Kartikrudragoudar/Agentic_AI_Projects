from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo
from dotenv import load_dotenv


LOGGER = logging.getLogger("scorer")
IST = ZoneInfo("Asia/Kolkata")

SECTOR_HINTS = {
    "RELIANCE": "energy",
    "TCS": "technology",
    "INFY": "technology",
    "WIPRO": "technology",
    "HDFCBANK": "finance",
    "NVDA": "technology",
    "GOOGL": "technology",
    "MSFT": "technology",
    "AAPL": "technology",
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


def numeric(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def pct_change(asset: dict[str, Any]) -> float:
    return numeric(asset.get("pct_change", asset.get("pct_change_24h", 0)))


def sentiment_points(sentiment: dict[str, Any]) -> int:
    label = sentiment.get("sentiment", "Neutral")
    confidence = numeric(sentiment.get("confidence", 0))
    if label == "Bullish":
        return round(25 + (confidence / 100) * 15)
    if label == "Bearish":
        return round((confidence / 100) * 9)
    return round(10 + (confidence / 100) * 14)


def momentum_points(change: float) -> int:
    if change >= 3:
        return 30
    if change >= 1:
        return 22
    if change >= 0:
        return 15
    if change >= -1:
        return 8
    return 0


def volume_ratio(asset: dict[str, Any]) -> float | None:
    volume = numeric(asset.get("volume"))
    avg_volume = numeric(asset.get("avg_volume"))
    if volume <= 0 or avg_volume <= 0:
        return None
    return volume / avg_volume


def volume_points(asset: dict[str, Any]) -> int:
    ratio = volume_ratio(asset)
    if ratio is None:
        return 5
    if ratio >= 2.5:
        return 15
    if ratio >= 1.5:
        return 10
    return 5


def normalize_sector(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.lower()
    if "tech" in lowered or "communication" in lowered:
        return "technology"
    if "financial" in lowered or "bank" in lowered:
        return "finance"
    if "energy" in lowered or "oil" in lowered:
        return "energy"
    return lowered


def sector_for(symbol: str, asset: dict[str, Any]) -> str | None:
    explicit = normalize_sector(asset.get("sector"))
    if explicit:
        return explicit
    cleaned = symbol.replace(".NS", "").replace(".BO", "").upper()
    return SECTOR_HINTS.get(cleaned)


def sector_points(symbol: str, asset: dict[str, Any], preferences: dict[str, Any]) -> int:
    preferred = {str(item).lower() for item in preferences.get("preferred_sectors", [])}
    sector = sector_for(symbol, asset)
    return 15 if sector and sector in preferred else 5


def alerts_for(symbol: str, asset: dict[str, Any], preferences: dict[str, Any]) -> list[str]:
    alerts: list[str] = []
    change = pct_change(asset)
    price_threshold = numeric(preferences.get("alert_on_price_change_pct", 3.0), 3.0)
    if abs(change) >= price_threshold:
        alerts.append(f"Price changed {change:+.2f}%")

    ratio = volume_ratio(asset)
    volume_threshold = numeric(preferences.get("volume_spike_multiplier", 2.5), 2.5)
    if preferences.get("alert_on_volume_spike", True) and ratio is not None and ratio >= volume_threshold:
        alerts.append(f"Volume {ratio:.1f}x above average")

    price = numeric(asset.get("price", asset.get("price_usd")))
    high_52 = numeric(asset.get("week_52_high"))
    low_52 = numeric(asset.get("week_52_low"))
    if price and high_52 and price >= high_52:
        alerts.append("Price is at or above the 52-week high")
    if price and low_52 and price <= low_52:
        alerts.append("Price is at or below the 52-week low")

    return alerts


def iter_assets(fetched: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    assets: list[tuple[str, dict[str, Any]]] = []
    for group in ("stocks", "crypto", "indices"):
        for symbol, data in fetched.get(group, {}).items():
            assets.append((symbol, data))
    return assets


def market_mood(scores: list[int]) -> str:
    if not scores:
        return "Unknown"
    average = sum(scores) / len(scores)
    if average >= 70:
        return "Constructive"
    if average >= 50:
        return "Cautious"
    return "Defensive"


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    target_dir = data_dir()
    fetched = read_json(target_dir / "fetched.json", {"stocks": {}, "crypto": {}, "indices": {}})
    sentiment = read_json(target_dir / "sentiment.json", {"results": {}})
    watchlist = read_json(target_dir / "watchlist.json", {"preferences": {}})
    preferences = watchlist.get("preferences", {})
    minimum_highlight = numeric(preferences.get("minimum_score_to_highlight", 70), 70)

    ranked: list[tuple[str, dict[str, Any]]] = []
    for symbol, asset in iter_assets(fetched):
        sentiment_data = sentiment.get("results", {}).get(symbol, {})
        score = (
            sentiment_points(sentiment_data)
            + momentum_points(pct_change(asset))
            + volume_points(asset)
            + sector_points(symbol, asset, preferences)
        )
        ranked.append(
            (
                symbol,
                {
                    "score": max(0, min(100, score)),
                    "rank": 0,
                    "highlight": score >= minimum_highlight,
                    "alerts": alerts_for(symbol, asset, preferences),
                },
            )
        )

    ranked.sort(key=lambda item: item[1]["score"], reverse=True)
    scores: dict[str, Any] = {}
    for rank, (symbol, data) in enumerate(ranked, start=1):
        data["rank"] = rank
        scores[symbol] = data

    payload = {
        "scored_at": now_ist(),
        "overall_market_mood": market_mood([item["score"] for item in scores.values()]),
        "scores": scores,
    }
    write_json(target_dir / "scored.json", payload)
    LOGGER.info("Wrote scores for %s assets", len(scores))


if __name__ == "__main__":
    main()
