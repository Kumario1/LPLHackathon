import os
from typing import List


def _split_origins(value: str) -> List[str]:
    if not value:
        return ["*"]
    parts = [v.strip() for v in value.split(",") if v.strip()]
    return parts or ["*"]


BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY")

# Comma-separated origins, or "*" for all (dev default)
OPENCLAW_ALLOWED_ORIGINS = _split_origins(
    os.getenv("OPENCLAW_ALLOWED_ORIGINS", "*")
)

# Server configs (used by docs / optional uvicorn run)
OPENCLAW_HOST = os.getenv("OPENCLAW_HOST", "0.0.0.0")
OPENCLAW_PORT = int(os.getenv("OPENCLAW_PORT", "18789"))
CLAWDBOT_HOST = os.getenv("CLAWDBOT_HOST", "0.0.0.0")
CLAWDBOT_PORT = int(os.getenv("CLAWDBOT_PORT", "8080"))

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
