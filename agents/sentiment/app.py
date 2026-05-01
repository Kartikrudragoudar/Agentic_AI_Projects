from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from groq import Groq
from dotenv import load_dotenv


LOGGER = logging.getLogger("sentiment")
IST = ZoneInfo("Asia/Kolkata")
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_RETRIES = 3

SYSTEM_PROMPT = """You are a financial market analyst. Given stock/crypto price data and recent news headlines, respond ONLY with valid JSON in this format:
{
  "sentiment": "Bullish" or "Bearish" or "Neutral",
  "confidence": 0-100,
  "reason": "One sentence explaining the sentiment"
}
Base your analysis on price movement and news tone. Be concise."""


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


def pct_change_for(asset: dict[str, Any]) -> float:
    value = asset.get("pct_change", asset.get("pct_change_24h", 0))
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def fallback_sentiment(asset: dict[str, Any], reason: str = "LLM sentiment analysis unavailable") -> dict[str, Any]:
    change = pct_change_for(asset)
    if change >= 1:
        sentiment = "Bullish"
        confidence = min(70, 50 + int(abs(change) * 5))
    elif change <= -1:
        sentiment = "Bearish"
        confidence = min(70, 50 + int(abs(change) * 5))
    else:
        sentiment = "Neutral"
        confidence = 45
    return {"sentiment": sentiment, "confidence": confidence, "reason": reason}


def iter_assets(fetched: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    assets: list[tuple[str, dict[str, Any]]] = []
    for group in ("stocks", "crypto", "indices"):
        for symbol, data in fetched.get(group, {}).items():
            assets.append((symbol, data))
    return assets


def user_prompt(symbol: str, asset: dict[str, Any]) -> str:
    headlines = [item.get("title", "") for item in asset.get("news", []) if item.get("title")]
    headline_text = "\n".join(f"- {headline}" for headline in headlines[:3]) or "- No relevant headlines found"
    return (
        f"Ticker: {symbol} ({asset.get('name', symbol)})\n"
        f"Price change: {pct_change_for(asset):+.2f}%\n"
        f"News headlines:\n{headline_text}\n"
        "Analyse market sentiment."
    )


def parse_llm_json(content: str) -> dict[str, Any]:
    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in LLM response")
    parsed = json.loads(content[start : end + 1])
    sentiment = parsed.get("sentiment", "Neutral")
    if sentiment not in {"Bullish", "Bearish", "Neutral"}:
        sentiment = "Neutral"
    confidence = max(0, min(100, int(parsed.get("confidence", 0))))
    reason = str(parsed.get("reason", "No reason provided")).strip()
    return {"sentiment": sentiment, "confidence": confidence, "reason": reason}


def analyse_with_groq(client: Groq | None, symbol: str, asset: dict[str, Any]) -> dict[str, Any]:
    if not client:
        return fallback_sentiment(asset, "Groq client not available")

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt(symbol, asset)},
                ],
                temperature=0.2,
                max_tokens=200,
            )
            content = response.choices[0].message.content.strip()
            return parse_llm_json(content)
        except Exception as exc:  # noqa: BLE001
            if attempt == MAX_RETRIES:
                LOGGER.warning("Sentiment failed for %s after %s attempts: %s", symbol, attempt, exc)
                return fallback_sentiment(asset)
            delay = 2**attempt
            LOGGER.info("Retrying %s after %ss: %s", symbol, delay, exc)
            time.sleep(delay)
    return fallback_sentiment(asset)


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    target_dir = data_dir()
    fetched = read_json(target_dir / "fetched.json", {"stocks": {}, "crypto": {}, "indices": {}})
    api_key = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=api_key) if api_key else None

    if not client:
        LOGGER.warning("GROQ_API_KEY is not set; using rule-based fallback sentiment")

    results: dict[str, Any] = {}
    for symbol, asset in iter_assets(fetched):
        results[symbol] = analyse_with_groq(client, symbol, asset)

    write_json(target_dir / "sentiment.json", {"analysed_at": now_ist(), "results": results})
    LOGGER.info("Wrote sentiment for %s assets", len(results))


if __name__ == "__main__":
    main()
