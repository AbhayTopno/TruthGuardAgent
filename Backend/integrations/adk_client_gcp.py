# integrations/adk_client.py
import os
import time
import logging
from typing import Dict, Any, Optional
import requests


log = logging.getLogger("adk")

# Vertex AI Reasoning Engine endpoint (from your curl)
REASONING_ENGINE_URL = os.getenv("REASONING_ENGINE_URL", "https://us-central1-aiplatform.googleapis.com/v1/projects/your-project/locations/us-central1/reasoningEngines/your-engine:asyncStreamQuery")

APP_NAME = os.getenv("ADK_APP_NAME", "news_info_verification_v2")
HTTP_TIMEOUT = float(os.getenv("ADK_TIMEOUT_SEC", "300"))

class ADKError(Exception):
    pass


# Legacy compatibility placeholders (no longer used)
def _create_session(user_id: str) -> str:
    # Vertex Agent doesn’t need sessions
    return "vertex-session"


def _get_or_create_session(user_id: str) -> str:
    return "vertex-session"


def _run(session_id: str, user_id: str, text: str) -> Dict[str, Any]:
    """
    Runs a query against the deployed Vertex AI Reasoning Engine.
    Uses GCP access token from gcp_token_manager.
    """
    t0 = time.time()
    token = os.getenv("GCP_ACCESS_TOKEN")
    if not token:
        raise ADKError("Missing GCP access token")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    payload = {
        "class_method": "async_stream_query",
        "input": {
            "user_id": user_id,
            "message": text,
        },
    }

    try:
        # Use streaming for better response handling
        r = requests.post(
            REASONING_ENGINE_URL,
            headers=headers,
            json=payload,
            stream=True,
            timeout=HTTP_TIMEOUT,
        )
        r.raise_for_status()
    except requests.Timeout:
        log.error("ADK timeout user=%s", user_id)
        raise ADKError("timeout")
    except requests.RequestException as e:
        body = getattr(e.response, "text", "")
        log.error(
            "ADK http_error user=%s err=%s body=%s",
            user_id,
            e,
            (body or "")[:300],
        )
        raise ADKError("http_error")

    dt = time.time() - t0
    log.info("Vertex run ok user=%s dt=%.2fs", user_id, dt)

    # Parse streamed JSON responses and extract text parts
    import json
    text_parts = []
    
    for line in r.iter_lines(decode_unicode=True):
        if line and line.strip():
            log.debug(f"Received line: {line[:100]}")
            
            try:
                # Each line is a complete JSON object
                data = json.loads(line)
                
                # Extract text from parts if available
                content = data.get("content", {})
                parts = content.get("parts", [])
                
                for part in parts:
                    if "text" in part:
                        text_parts.append(part["text"])
                        
            except json.JSONDecodeError:
                log.debug(f"Could not parse JSON line: {line[:100]}")
                continue
    
    # Combine all text parts, prefer the last one (final response)
    response_text = text_parts[-1] if text_parts else ""
    
    log.debug(f"Extracted final text: {response_text[:200]}")

    return {"logs": [{"content": {"parts": [{"text": response_text}]}}]}


def call_adk(query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    user = metadata.get("user") or {}
    user_id: Optional[str] = (
        user.get("wa_from") or user.get("id") or "anonymous"
    )

    try:
        sid = _get_or_create_session(user_id)
        data = _run(sid, user_id, query)
    except ADKError:
        raise
    except Exception as e:
        log.error("ADK error user=%s err=%s", user_id, e)
        raise ADKError("unexpected")

    logs = data.get("logs", [])
    if not logs:
        log.error("ADK no logs found user=%s data=%s", user_id, str(data)[:500])
        raise ADKError("missing logs in response")

    try:
        final_text = logs[-1]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as e:
        log.error(
            "ADK missing final text user=%s err=%s last_log=%s",
            user_id,
            e,
            str(logs[-1])[:500],
        )
        raise ADKError("missing final text in response")

    verdict = (
        "verified"
        if "legitimate" in (final_text or "").lower()
        or "verdict: true" in (final_text or "").lower()
        else "unverified"
    )
    confidence = (
        1.0
        if "confidence: 1.0" in (final_text or "").lower()
        else 0.5
    )

    return {
        "verdict": verdict,
        "confidence": confidence,
        "evidence": [],
        "raw_final": final_text,
    }


def warmup():
    """Legacy placeholder — no-op for Vertex."""
    try:
        _create_session("warmup-user")
    except Exception:
        pass
