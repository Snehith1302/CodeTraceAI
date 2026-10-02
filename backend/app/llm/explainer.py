import logging
from typing import Dict, Any, List, Tuple, Optional
from anthropic import Anthropic, APIError
from app.config import settings
from app.llm.prompts import SYSTEM_PROMPT, build_impact_prompt

logger = logging.getLogger(__name__)

def generate_impact_explanation(
    target_function_id: str,
    target_function: Dict[str, Any],
    dependents: List[Dict[str, Any]],
    total_dependents: int,
    api_key_override: Optional[str] = None,
    model_override: Optional[str] = None,
) -> Tuple[Optional[str], str]:
    """
    Calls the Anthropic Claude API to generate a plain-English explanation of static impact analysis.
    
    Returns:
        (explanation_text, status_message)
        where status_message is one of:
        - "success"
        - "missing_api_key"
        - "api_error"
    """
    api_key = api_key_override if api_key_override is not None else settings.ANTHROPIC_API_KEY
    model = model_override if model_override is not None else (settings.ANTHROPIC_MODEL or "claude-3-5-sonnet-20241022")

    if not api_key or not str(api_key).strip():
        logger.info("ANTHROPIC_API_KEY is missing or empty.")
        return (
            None,
            "AI explanation unavailable (ANTHROPIC_API_KEY is not configured). Deterministic impact analysis is active."
        )

    user_prompt = build_impact_prompt(
        target_function_id=target_function_id,
        target_function=target_function,
        dependents=dependents,
        total_dependents=total_dependents,
    )

    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model,
            max_tokens=400,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_prompt}
            ],
        )

        explanation = ""
        if response.content:
            for block in response.content:
                if hasattr(block, "text"):
                    explanation += block.text

        explanation = explanation.strip()
        if not explanation:
            return (None, "AI explanation response was empty.")

        return (explanation, "success")

    except APIError as e:
        logger.error(f"Anthropic API error: {e}")
        err_msg = getattr(e, "message", "") or str(e)
        err_str = (str(e) + " " + str(err_msg)).lower()
        if any(kw in err_str for kw in ["credit", "billing", "balance", "quota", "payment", "402", "insufficient"]):
            status_msg = "AI explanation temporarily unavailable. Deterministic impact analysis is still active."
        else:
            status_msg = "AI explanation unavailable (Anthropic API error). Deterministic impact analysis is active."
        return (None, status_msg)
    except Exception as e:
        logger.error(f"Unexpected error in LLM explanation service: {e}")
        err_str = str(e).lower()
        if any(kw in err_str for kw in ["credit", "billing", "balance", "quota", "payment", "402", "insufficient"]):
            status_msg = "AI explanation temporarily unavailable. Deterministic impact analysis is still active."
        else:
            status_msg = "AI explanation unavailable. Deterministic impact analysis is active."
        return (None, status_msg)
