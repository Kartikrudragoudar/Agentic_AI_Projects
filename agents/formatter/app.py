from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import requests
from dotenv import load_dotenv


LOGGER = logging.getLogger("formatter")
IST = ZoneInfo("Asia/Kolkata")


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def data_dir() -> Path:
    configured = os.getenv("DATA_DIR")
    if configured:
        return Path(configured)
    return Path("/data") if Path("/data").exists() else project_root() / "data"


def output_dir() -> Path:
    configured = os.getenv("OUTPUT_DIR")
    if configured:
        return Path(configured)
    return Path("/output") if Path("/output").exists() else project_root() / "output"


def now() -> datetime:
    return datetime.now(IST)


def read_json(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def numeric(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def fmt_number(value: Any, decimals: int = 2) -> str:
    number = numeric(value)
    if number == 0 and value in (None, ""):
        return "N/A"
    formatted = f"{number:,.{decimals}f}"
    return formatted.rstrip("0").rstrip(".") if decimals > 0 else formatted


def fmt_change(value: Any) -> str:
    return f"{numeric(value):+.2f}%"


def iter_ranked_symbols(scores: dict[str, Any]) -> list[str]:
    return sorted(scores, key=lambda symbol: scores[symbol].get("rank", 9999))


def asset_lookup(fetched: dict[str, Any], symbol: str) -> dict[str, Any]:
    for group in ("stocks", "crypto", "indices"):
        if symbol in fetched.get(group, {}):
            return fetched[group][symbol]
    return {}


def render_indices(fetched: dict[str, Any]) -> list[str]:
    lines = ["## Indices", "", "| Index | Level | Change |", "| --- | ---: | ---: |"]
    for symbol, data in fetched.get("indices", {}).items():
        lines.append(f"| {data.get('name', symbol)} | {fmt_number(data.get('price'))} | {fmt_change(data.get('pct_change'))} |")
    if len(lines) == 4:
        lines.append("| No index data | N/A | N/A |")
    return lines


def render_asset(symbol: str, asset: dict[str, Any], score: dict[str, Any], sentiment: dict[str, Any]) -> list[str]:
    name = asset.get("name", symbol)
    is_crypto = "price_inr" in asset or "price_usd" in asset
    if is_crypto:
        price = f"INR {fmt_number(asset.get('price_inr'), 0)}"
        if asset.get("price_usd") is not None:
            price += f" (${fmt_number(asset.get('price_usd'), 0)})"
        change = fmt_change(asset.get("pct_change_24h"))
    else:
        currency = asset.get("currency", "INR")
        price = f"{currency} {fmt_number(asset.get('price'))}"
        change = fmt_change(asset.get("pct_change"))

    lines = [
        f"### {symbol} - {name}",
        "",
        f"Price: {price} | Change: {change} | Score: {score.get('score', 0)}/100",
        f"Sentiment: {sentiment.get('sentiment', 'Neutral')} ({sentiment.get('confidence', 0)}% confidence)",
    ]
    if sentiment.get("reason"):
        lines.append(f"Reason: {sentiment['reason']}")

    headlines = [item.get("title", "") for item in asset.get("news", []) if item.get("title")]
    if headlines:
        lines.extend(["", "Headlines:"])
        lines.extend(f"- {headline}" for headline in headlines[:3])
    return lines


def render_top_picks(fetched: dict[str, Any], sentiment: dict[str, Any], scored: dict[str, Any]) -> list[str]:
    scores = scored.get("scores", {})
    lines = ["## Top Picks", ""]
    top_symbols = [symbol for symbol in iter_ranked_symbols(scores) if scores[symbol].get("highlight")]
    if not top_symbols:
        top_symbols = iter_ranked_symbols(scores)[:5]

    if not top_symbols:
        return lines + ["No scored assets available."]

    for symbol in top_symbols:
        lines.extend(render_asset(symbol, asset_lookup(fetched, symbol), scores[symbol], sentiment.get("results", {}).get(symbol, {})))
        lines.append("")
    return lines


def render_alerts(scored: dict[str, Any]) -> list[str]:
    lines = ["## Alerts", ""]
    alerts: list[str] = []
    for symbol in iter_ranked_symbols(scored.get("scores", {})):
        for alert in scored["scores"][symbol].get("alerts", []):
            alerts.append(f"- {symbol}: {alert}")
    if alerts:
        lines.extend(alerts)
    else:
        lines.append("No active alerts.")
    return lines


def render_brief(fetched: dict[str, Any], sentiment: dict[str, Any], scored: dict[str, Any]) -> str:
    generated = now()
    lines = [
        "# Morning Market Brief",
        "",
        f"**Date:** {generated.strftime('%A, %d %B %Y')}",
        f"**Generated:** {generated.strftime('%H:%M')} IST",
        "",
        f"## Market Mood: {scored.get('overall_market_mood', 'Unknown')}",
        "",
    ]
    lines.extend(render_indices(fetched))
    lines.extend(["", "---", ""])
    lines.extend(render_top_picks(fetched, sentiment, scored))
    lines.extend(["---", ""])
    lines.extend(render_alerts(scored))
    lines.extend(["", "_Brief generated by Stock Morning Brief Agent_", ""])
    return "\n".join(lines)


def write_outputs(content: str, data_path: Path, output_path: Path) -> None:
    output_path.mkdir(parents=True, exist_ok=True)
    data_path.mkdir(parents=True, exist_ok=True)
    (output_path / "morning_brief.md").write_text(content, encoding="utf-8")
    archive_dir = data_path / "briefs"
    archive_dir.mkdir(parents=True, exist_ok=True)
    (archive_dir / f"{now().date().isoformat()}.md").write_text(content, encoding="utf-8")


def send_telegram(content: str) -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id or chat_id == "your_chat_id":
        LOGGER.info("Telegram delivery skipped; TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    chunks = [content[index : index + 3900] for index in range(0, len(content), 3900)]
    for chunk in chunks:
        response = requests.post(url, json={"chat_id": chat_id, "text": chunk}, timeout=20)
        if response.status_code != 200:
            LOGGER.error("Telegram API Error: %s", response.text)
        response.raise_for_status()


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    target_data_dir = data_dir()
    target_output_dir = output_dir()
    fetched = read_json(target_data_dir / "fetched.json", {"stocks": {}, "crypto": {}, "indices": {}})
    sentiment = read_json(target_data_dir / "sentiment.json", {"results": {}})
    scored = read_json(target_data_dir / "scored.json", {"overall_market_mood": "Unknown", "scores": {}})

    content = render_brief(fetched, sentiment, scored)
    write_outputs(content, target_data_dir, target_output_dir)
    send_telegram(content)
    LOGGER.info("Wrote morning brief")


if __name__ == "__main__":
    main()
