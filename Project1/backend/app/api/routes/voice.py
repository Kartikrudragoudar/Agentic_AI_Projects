"""
voice.py
========
Voice API routes:
  POST /api/v1/voice/transcribe/  — Accept audio file, return transcribed + translated text
  POST /api/v1/voice/translate/   — Accept text + langs, return translated text
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, status
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from backend.app.services.voice.whisper_service import (
    transcribe_audio_bytes,
    whisper_lang_to_indictrans,
)
from backend.app.services.voice.translation_service import (
    translate,
    translate_to_english,
    SUPPORTED_LANGUAGES,
)

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class TranscribeResponse(BaseModel):
    original_text: str
    translated_text: str
    detected_language: str
    detected_language_code: str
    indictrans_code: str


class TranslateRequest(BaseModel):
    text: str
    source_lang: str   # IndicTrans2 code, e.g. 'hin_Deva'
    target_lang: str   # IndicTrans2 code, e.g. 'eng_Latn'


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/transcribe/", response_model=TranscribeResponse, tags=["Voice"])
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file from browser (WebM/WAV/MP3/OGG)"),
    target_language: Optional[str] = Form("eng_Latn", description="IndicTrans2 target language code"),
):
    """
    Transcribe an audio file using Whisper and translate to English (or other target).

    Flow:
      1. Receive audio blob (from browser MediaRecorder).
      2. Whisper transcribes audio → detects language automatically.
      3. IndicTrans2 translates transcribed text to target language.
      4. Return original + translated text + language info.

    Args:
        audio: Uploaded audio file.
        target_language: IndicTrans2 code of the desired output language.

    Returns:
        TranscribeResponse with transcription and translation.
    """
    # Validate file type
    allowed_types = {"audio/webm", "audio/wav", "audio/mpeg", "audio/ogg", "audio/mp4", "application/octet-stream"}
    if audio.content_type and audio.content_type not in allowed_types:
        logger.warning(f"Unexpected audio content type: {audio.content_type}")

    # Determine file suffix
    filename = audio.filename or "audio.webm"
    suffix = "." + filename.rsplit(".", 1)[-1] if "." in filename else ".webm"

    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty audio file received.",
            )

        logger.info(f"Received audio: {len(audio_bytes)} bytes, suffix: {suffix}")

        # Transcribe with Whisper
        from backend.app.core.config import settings
        result = await transcribe_audio_bytes(audio_bytes, suffix=suffix, model_name=settings.WHISPER_MODEL)

        original_text = result["text"]
        detected_lang_code = result["language"]  # e.g. 'hi', 'ta', 'en'
        indictrans_code = whisper_lang_to_indictrans(detected_lang_code)  # e.g. 'hin_Deva'

        # Translate to target language (default: English)
        translated_text = translate(
            original_text,
            source_lang=indictrans_code,
            target_lang=target_language or "eng_Latn",
        )

        # Get display name for detected language
        from backend.app.services.voice.translation_service import LANGUAGE_CODE_TO_NAME
        detected_lang_name = LANGUAGE_CODE_TO_NAME.get(indictrans_code, detected_lang_code)

        logger.info(f"Transcription+translation complete. Detected: {detected_lang_name}")

        return TranscribeResponse(
            original_text=original_text,
            translated_text=translated_text,
            detected_language=detected_lang_name,
            detected_language_code=detected_lang_code,
            indictrans_code=indictrans_code,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}",
        )


@router.post("/translate/", response_model=TranslateResponse, tags=["Voice"])
async def translate_text(body: TranslateRequest):
    """
    Translate text between two languages using IndicTrans2.

    Args:
        body: TranslateRequest with text, source_lang, target_lang (IndicTrans2 codes).

    Returns:
        TranslateResponse with original and translated text.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty.",
        )

    if body.source_lang not in SUPPORTED_LANGUAGES.values() and body.source_lang != "eng_Latn":
        logger.warning(f"Unknown source_lang: {body.source_lang}. Attempting translation anyway.")

    try:
        translated = translate(
            body.text,
            source_lang=body.source_lang,
            target_lang=body.target_lang,
        )
        return TranslateResponse(
            original_text=body.text,
            translated_text=translated,
            source_lang=body.source_lang,
            target_lang=body.target_lang,
        )
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}",
        )
