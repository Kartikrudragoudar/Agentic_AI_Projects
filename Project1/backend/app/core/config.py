from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # ─── Groq LLM ────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    # ─── Hugging Face ────────────────────────────────────────────────
    HF_TOKEN: Optional[str] = None

    # ─── Whisper ─────────────────────────────────────────────────────
    WHISPER_MODEL: str = "base"

    # ─── Database ────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./banking_agent.db"

    # ─── Redis ───────────────────────────────────────────────────────
    REDIS_URL: Optional[str] = "redis://localhost:6379"

    # ─── Security ────────────────────────────────────────────────────
    SECRET_KEY: str = "change_this_to_a_long_random_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ─── App Meta ────────────────────────────────────────────────────
    APP_NAME: str = "Banking AI Support Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


# Singleton for easy import
settings = get_settings()
