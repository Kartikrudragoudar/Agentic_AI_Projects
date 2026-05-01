from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv("DATA_DIR", PROJECT_ROOT / "data"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", PROJECT_ROOT / "output"))

app = FastAPI(
    title="Stock & Crypto Morning Brief API",
    description="Serves generated market data, sentiment, scores, alerts and morning briefs.",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_json_file(path: Path, fallback: dict[str, Any] | None = None) -> dict[str, Any]:
    if not path.exists():
        if fallback is not None:
            return fallback
        raise HTTPException(status_code=404, detail=f"{path.name} has not been generated yet")

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"{path.name} contains invalid JSON") from exc


def read_text_file(path: Path) -> str:
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{path.name} has not been generated yet")
    return path.read_text(encoding="utf-8")


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "stock-crypto-morning-brief-api",
        "checked_at": datetime.now().isoformat(),
        "data_dir": str(DATA_DIR),
        "output_dir": str(OUTPUT_DIR),
    }


@app.get("/api/brief/today")
def get_today_brief() -> dict[str, Any]:
    brief_path = OUTPUT_DIR / "morning_brief.md"
    content = read_text_file(brief_path)
    return {
        "date": datetime.now().date().isoformat(),
        "path": str(brief_path),
        "content": content,
    }


@app.get("/api/watchlist/prices")
def get_prices() -> dict[str, Any]:
    return read_json_file(DATA_DIR / "fetched.json", {"fetched_at": None, "stocks": {}, "crypto": {}, "indices": {}})


@app.get("/api/watchlist/sentiment")
def get_sentiment() -> dict[str, Any]:
    return read_json_file(DATA_DIR / "sentiment.json", {"analysed_at": None, "results": {}})


@app.get("/api/watchlist/scores")
def get_scores() -> dict[str, Any]:
    return read_json_file(
        DATA_DIR / "scored.json",
        {"scored_at": None, "overall_market_mood": "Unknown", "scores": {}},
    )


@app.get("/api/alerts")
def get_alerts() -> dict[str, Any]:
    scored = get_scores()
    alerts: list[dict[str, Any]] = []

    for symbol, score_data in scored.get("scores", {}).items():
        for index, message in enumerate(score_data.get("alerts", []), start=1):
            alerts.append(
                {
                    "id": f"{symbol}-{index}",
                    "symbol": symbol,
                    "title": f"{symbol}: {message}",
                    "type": "volume" if "volume" in message.lower() else "price",
                    "timestamp": scored.get("scored_at"),
                }
            )

    return {
        "generated_at": scored.get("scored_at"),
        "count": len(alerts),
        "alerts": alerts,
    }


@app.get("/api/dashboard")
def get_dashboard() -> dict[str, Any]:
    return {
        "prices": get_prices(),
        "sentiment": get_sentiment(),
        "scores": get_scores(),
        "alerts": get_alerts(),
    }
