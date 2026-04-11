"""
main.py
=======
FastAPI application entry point for the Banking AI Support Agent.

Run with:
    uvicorn backend.app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from backend.app.core.config import settings
from backend.app.api.routes import chat, voice, auth, health

# ─── App Instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Universal Banking AI Customer Support Agent with multi-bank support "
        "for Indian banks, voice input, and regional language support."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(chat.router, prefix="/api/v1/chat")
app.include_router(voice.router, prefix="/api/v1/voice")

# ─── Startup / Shutdown Events ────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting up...")
    logger.info(f"   Groq Model  : {settings.GROQ_MODEL}")
    logger.info(f"   Whisper     : {settings.WHISPER_MODEL}")
    logger.info(f"   Database    : {settings.DATABASE_URL}")
    logger.info("   API Docs    : http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Banking AI Support Agent shut down.")


# ─── Root ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }
