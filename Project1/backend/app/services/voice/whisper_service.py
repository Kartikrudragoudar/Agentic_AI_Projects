"""
whisper_service.py
==================
Speech-to-Text using OpenAI Whisper (local, offline, free).
Supports all Indian languages natively:
  Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada,
  Malayalam, Punjabi, Odia and more.
"""

import os
import tempfile
from typing import Optional

from loguru import logger

# Whisper model is loaded lazily on first use to avoid startup delay
_whisper_model = None


def _get_model(model_name: str = "base"):
    """
    Lazily load and cache the Whisper model.

    Args:
        model_name: Whisper model size (tiny/base/small/medium/large).
                    'base' (~74 MB) is recommended for fast inference.

    Returns:
        Loaded Whisper model instance.
    """
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper  # type: ignore
            logger.info(f"Loading Whisper model: {model_name}")
            _whisper_model = whisper.load_model(model_name)
            logger.info("Whisper model loaded successfully.")
        except ImportError:
            logger.error("openai-whisper is not installed. Run: uv pip install openai-whisper")
            raise
    return _whisper_model


def transcribe(audio_file_path: str, model_name: str = "base") -> dict:
    """
    Transcribe an audio file using OpenAI Whisper.

    Whisper automatically detects the spoken language, so no language
    hint is needed for Indian language support.

    Args:
        audio_file_path: Absolute path to the audio file (WAV/MP3/OGG/WebM).
        model_name: Whisper model size to use.

    Returns:
        dict with keys:
            - text (str): Transcribed text.
            - language (str): Detected language code (e.g. 'hi', 'ta', 'en').
            - language_probability (float): Confidence score.
    """
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

    model = _get_model(model_name)
    
    # Pre-check for ffmpeg (Whisper dependency)
    import subprocess
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.error("ffmpeg is not installed. Whisper requires ffmpeg for audio processing.")
        raise RuntimeError("ffmpeg not found on system. Please install ffmpeg (e.g., 'sudo apt install ffmpeg').")

    logger.info(f"Transcribing audio file: {audio_file_path}")

    # Whisper's transcribe() returns segments with timestamps + detected_language
    result = model.transcribe(audio_file_path)

    transcribed_text = result.get("text", "").strip()
    detected_lang = result.get("language", "en")

    logger.info(f"Transcription complete. Language: {detected_lang}, Text: {transcribed_text[:80]}...")

    return {
        "text": transcribed_text,
        "language": detected_lang,
        "language_probability": 1.0,  # Whisper doesn't expose per-segment confidence directly
    }


async def transcribe_audio_bytes(audio_bytes: bytes, suffix: str = ".webm", model_name: str = "base") -> dict:
    """
    Transcribe audio from raw bytes (e.g. from an HTTP upload).

    Saves bytes to a temporary file, transcribes, then cleans up.

    Args:
        audio_bytes: Raw audio data.
        suffix: File extension hint for the temp file (e.g. '.webm', '.wav').
        model_name: Whisper model size.

    Returns:
        Same dict as transcribe().
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        return transcribe(tmp_path, model_name)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            logger.debug(f"Removed temp audio file: {tmp_path}")


# ─── Language Code Mapping (Whisper → IndicTrans2) ───────────────────────────

WHISPER_TO_INDICTRANS: dict = {
    "hi": "hin_Deva",   # Hindi
    "ta": "tam_Taml",   # Tamil
    "te": "tel_Telu",   # Telugu
    "bn": "ben_Beng",   # Bengali
    "mr": "mar_Deva",   # Marathi
    "gu": "guj_Gujr",   # Gujarati
    "kn": "kan_Knda",   # Kannada
    "ml": "mal_Mlym",   # Malayalam
    "pa": "pan_Guru",   # Punjabi
    "or": "ory_Orya",   # Odia
    "en": "eng_Latn",   # English
    "ur": "urd_Arab",   # Urdu
    "as": "asm_Beng",   # Assamese
}


def whisper_lang_to_indictrans(whisper_lang: str) -> str:
    """
    Convert Whisper's detected language code to IndicTrans2 format.

    Args:
        whisper_lang: Whisper language code (e.g. 'hi', 'ta').

    Returns:
        IndicTrans2 language code (e.g. 'hin_Deva').
    """
    return WHISPER_TO_INDICTRANS.get(whisper_lang, "eng_Latn")
