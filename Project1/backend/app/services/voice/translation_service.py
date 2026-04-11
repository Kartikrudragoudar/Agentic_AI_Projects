"""
translation_service.py
======================
Translation using IndicTrans2 (AI4Bharat) — local, offline, free.
Supports 22 Indian languages + English.

Translation pipeline:
  User audio → Whisper (transcribe) → IndicTrans2 (to English)
             → LangGraph Agent → IndicTrans2 (to user language)
             → Response displayed in chat

NOTE: IndicTrans2 requires the AI4Bharat model to be downloaded separately.
      See: https://github.com/AI4Bharat/IndicTrans2
      For production, you may also use a hosted API.
      A fallback 'no-op' translator is provided for development.
"""

from typing import Optional
from loguru import logger

# ─── Supported Languages (IndicBART supports 11 + English) ───────────────────

SUPPORTED_LANGUAGES: dict = {
    "English": "en_XX",
    "Hindi": "hi_IN",
    "Tamil": "ta_IN",
    "Telugu": "te_IN",
    "Bengali": "bn_IN",
    "Marathi": "mr_IN",
    "Gujarati": "gu_IN",
    "Kannada": "kn_IN",
    "Malayalam": "ml_IN",
    "Punjabi": "pa_IN",
    "Odia": "or_IN",
    "Assamese": "as_IN",
}

# Reverse mapping: code → name
LANGUAGE_CODE_TO_NAME: dict = {v: k for k, v in SUPPORTED_LANGUAGES.items()}


# ─── IndicBART Pipeline (lazy-loaded) ────────────────────────────────────────

_indicbart_pipeline = None


def _get_pipeline():
    """
    Lazily load the IndicBART translation pipeline.
    
    IndicBART is a unified model for all directions, so we only need one.
    Size: ~900 MB (FP32) / ~450 MB (FP16).
    """
    global _indicbart_pipeline
    if _indicbart_pipeline is not None:
        return _indicbart_pipeline

    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer  # type: ignore
        import torch  # type: ignore

        model_name = "ai4bharat/IndicBART"

        logger.info(f"Loading IndicBART model: {model_name}")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name, do_lower_case=False, use_fast=False, keep_accents=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)

        _indicbart_pipeline = {
            "tokenizer": tokenizer,
            "model": model,
            "device": device,
        }
        logger.info("IndicBART model loaded successfully.")
        return _indicbart_pipeline
        
    except Exception as e:
        logger.error(f"Failed to load IndicBART: {e}")
        logger.warning("Translation will use no-op fallback.")
        return None


def translate(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source language to target language using IndicBART.
    
    Language codes for IndicBART are like 'hi', 'ta', etc.
    We map our internal 'hi_IN' to the model's expected '[hi]' token.
    """
    if source_lang == target_lang:
        return text

    pipeline = _get_pipeline()

    if pipeline is None:
        logger.debug(f"No-op fallback: [{source_lang}] → [{target_lang}]")
        return text

    try:
        import torch  # type: ignore
        tokenizer = pipeline["tokenizer"]
        model = pipeline["model"]
        device = pipeline["device"]

        # IndicBART language tags are like [hi], [ta], [en], etc.
        # Mapping hi_IN -> [hi], en_XX -> [en]
        src_tag = f"[{source_lang.split('_')[0]}]"
        tgt_tag = f"[{target_lang.split('_')[0]}]"

        # Append source tag to text
        input_text = f"{text} </s> {src_tag}"
        
        # Tokenize
        encoded = tokenizer(input_text, return_tensors="pt").to(device)
        
        # Generate
        generated_tokens = model.generate(
            input_ids=encoded["input_ids"],
            attention_mask=encoded["attention_mask"],
            decoder_start_token_id=tokenizer._convert_token_to_id(tgt_tag),
            max_length=256,
            num_beams=5,
        )

        # Decode
        result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

        logger.info(f"Translated [{source_lang}→{target_lang}]: {text[:40]} → {result[:40]}")
        return result

    except Exception as e:
        logger.error(f"Translation failed: {e}. Returning original text.")
        return text


def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text to English from any supported Indian language.

    Args:
        text: Text in the source language.
        source_lang: IndicTrans2 code of the source language.

    Returns:
        English text.
    """
    return translate(text, source_lang=source_lang, target_lang="eng_Latn")


def translate_from_english(text: str, target_lang: str) -> str:
    """
    Translate English text to the specified Indian language.

    Args:
        text: English text.
        target_lang: IndicTrans2 code of the target language.

    Returns:
        Translated text in the target language.
    """
    return translate(text, source_lang="eng_Latn", target_lang=target_lang)


def get_language_code(language_name: str) -> str:
    """
    Get IndicTrans2 language code from a language display name.

    Args:
        language_name: e.g. 'Hindi', 'Tamil'.

    Returns:
        IndicTrans2 code (e.g. 'hin_Deva'). Defaults to 'eng_Latn'.
    """
    return SUPPORTED_LANGUAGES.get(language_name, "eng_Latn")
