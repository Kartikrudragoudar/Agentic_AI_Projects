"""
chat.py
=======
Chat API route:
  POST /api/v1/chat/  — Send a message and receive an AI response
"""

import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from loguru import logger

from backend.app.services.ai.agent import get_agent
from backend.app.services.voice.translation_service import (
    translate_to_english,
    translate_from_english,
    get_language_code,
)

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    selected_bank: Optional[str] = None
    language_code: str = "eng_Latn"   # IndicTrans2 language code


class CalculatorResult(BaseModel):
    emi: Optional[float] = None
    total_payment: Optional[float] = None
    total_interest: Optional[float] = None
    maturity_amount: Optional[float] = None
    interest_earned: Optional[float] = None
    principal: Optional[float] = None
    annual_rate: Optional[float] = None
    tenure_months: Optional[int] = None
    tenure_years: Optional[float] = None
    compounding: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    bank: Optional[str]
    service: Optional[str]
    escalate: bool
    calculator_result: Optional[dict]
    language_code: str


# ─── Route ────────────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse, tags=["Chat"])
async def chat(body: ChatRequest):
    """
    Main chat endpoint.

    Flow:
      1. Generate/reuse session_id.
      2. If language is not English, translate user message → English.
      3. Pass English message to BankingSupportAgent.
      4. If language is not English, translate AI response → user language.
      5. Return response with metadata.

    Args:
        body: ChatRequest with message, optional session_id, bank, language_code.

    Returns:
        ChatResponse with AI response and metadata.
    """
    if not body.message or not body.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    # Ensure session_id
    session_id = body.session_id or str(uuid.uuid4())
    language_code = body.language_code or "eng_Latn"

    # Step 1: Translate user message to English (if needed)
    english_message = body.message
    if language_code != "eng_Latn":
        try:
            english_message = translate_to_english(body.message, source_lang=language_code)
            logger.info(f"Translated user message [{language_code}→eng_Latn]: {english_message[:80]}")
        except Exception as e:
            logger.warning(f"Translation to English failed: {e}. Using original message.")

    # Step 2: Run agent
    agent = get_agent()
    result = agent.chat(
        message=english_message,
        session_id=session_id,
        selected_bank=body.selected_bank,
        language_code=language_code,
    )

    # Step 3: Translate response back to user language (if needed)
    response_text = result["response"]
    if language_code != "eng_Latn":
        try:
            response_text = translate_from_english(response_text, target_lang=language_code)
            logger.info(f"Translated response [eng_Latn→{language_code}]: {response_text[:80]}")
        except Exception as e:
            logger.warning(f"Translation from English failed: {e}. Using English response.")

    logger.info(f"Chat response sent for session {session_id}")

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        bank=result.get("bank"),
        service=result.get("service"),
        escalate=result.get("escalate", False),
        calculator_result=result.get("calculator_result"),
        language_code=language_code,
    )
