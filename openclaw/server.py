from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openclaw.agent import generate_response
from openclaw.backend_client import BackendClient
from openclaw.config import (
    BACKEND_URL,
    CLAWDBOT_HOST,
    CLAWDBOT_PORT,
    LOG_LEVEL,
    OPENCLAW_ALLOWED_ORIGINS,
    OPENCLAW_HOST,
    OPENCLAW_PORT,
)

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger("openclaw")

app = FastAPI(title="OpenClaw Gateway")

if "*" in OPENCLAW_ALLOWED_ORIGINS:
    allow_origins = ["*"]
else:
    allow_origins = OPENCLAW_ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend = BackendClient()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    context: Dict[str, Any] = {}


class TaskCompleteRequest(BaseModel):
    note: Optional[str] = ""


@app.get("/health")
async def health():
    try:
        backend_health = await backend.health()
    except Exception as exc:  # pragma: no cover - surface upstream error
        logger.warning("Backend health check failed: %s", exc)
        backend_health = {"status": "DOWN", "error": str(exc)}
    return {
        "status": "OK",
        "backend": backend_health,
        "backend_url": BACKEND_URL,
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    response_text, data = await generate_response(request.message, backend)
    return {
        "response": response_text,
        "data": data,
        "session_id": request.session_id,
        "source": "openclaw",
    }


@app.post("/workflows/create")
async def create_workflow(payload: Dict[str, Any]):
    return await backend.create_workflow(payload)


@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    return await backend.get_workflow(workflow_id)


@app.get("/households")
async def list_households(advisor_id: Optional[str] = None, status: Optional[str] = None):
    params: Dict[str, Any] = {}
    if advisor_id:
        params["advisor_id"] = advisor_id
    if status:
        params["status"] = status
    return await backend.list_transitions(params=params or None)


@app.get("/households/{household_id}")
async def get_household(household_id: str):
    return await backend.get_transition(household_id)


@app.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, request: TaskCompleteRequest):
    return await backend.complete_task(task_id, note=request.note or "")


@app.post("/documents/validate")
async def validate_document(payload: Dict[str, Any]):
    return await backend.validate_document(payload)


@app.get("/households/{household_id}/meeting-pack")
async def meeting_pack(household_id: str):
    return await backend.get_meeting_pack(household_id)


@app.get("/predictions/eta/{workflow_id}")
async def get_eta(workflow_id: str):
    return await backend.get_eta(workflow_id)


@app.websocket("/")
async def websocket_root(ws: WebSocket):
    await ws.accept()
    logger.info("WebSocket connected")
    try:
        while True:
            raw = await ws.receive_text()
            try:
                try:
                    message = json.loads(raw)
                except json.JSONDecodeError:
                    message = {"type": "message", "content": raw}

                content = (
                    message.get("content", "")
                    if isinstance(message, dict)
                    else str(message)
                )
                response_text, data = await generate_response(content, backend)
                payload = {
                    "type": "assistant",
                    "content": response_text,
                    "data": data,
                }
                await ws.send_text(json.dumps(payload))
            except Exception as exc:  # pragma: no cover
                logger.exception("WebSocket message error: %s", exc)
                await ws.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "content": "OpenClaw error",
                            "detail": str(exc),
                        }
                    )
                )
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting OpenClaw Gateway on %s:%s", OPENCLAW_HOST, OPENCLAW_PORT)
    logger.info("Also usable as Clawdbot API on %s:%s", CLAWDBOT_HOST, CLAWDBOT_PORT)
    uvicorn.run("openclaw.server:app", host=OPENCLAW_HOST, port=OPENCLAW_PORT, reload=False)
