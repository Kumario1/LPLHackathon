from __future__ import annotations

import re
from typing import Any, Dict, Tuple

from openclaw.backend_client import BackendClient


async def generate_response(message: str, backend: BackendClient) -> Tuple[str, Dict[str, Any]]:
    """
    Minimal intent handler for OpenClaw.
    Returns (response_text, data_dict).
    """
    text = (message or "").strip()
    lower = text.lower()
    data: Dict[str, Any] = {}

    if not text:
        return "Send a message and I can fetch transition data for you.", data

    if any(key in lower for key in ["health", "status", "uptime"]):
        health = await backend.health()
        data["health"] = health
        return f"Backend is {health.get('status', 'UNKNOWN')}.", data

    if any(key in lower for key in ["household", "households", "transition", "dashboard"]):
        transitions = await backend.list_transitions()
        data["households"] = transitions[:10]
        total = len(transitions)
        names = ", ".join([h.get("name", "Unknown") for h in transitions[:5]])
        if names:
            return f"I found {total} households. Top 5: {names}.", data
        return f"I found {total} households.", data

    # Simple "complete task <id>" handler
    match = re.search(r"task\s*(\d+)", lower)
    if match and "complete" in lower:
        task_id = match.group(1)
        result = await backend.complete_task(task_id)
        data["task"] = result
        return f"Task {task_id} marked COMPLETED.", data

    return (
        "I can help with transitions, households, or task completion. "
        "Try: 'show households' or 'complete task 12'.",
        data,
    )
