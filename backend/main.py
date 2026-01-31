import logging
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.config import settings
from backend.database import Base, engine
from backend.logging_config import setup_logging
from backend.orchestrator import orchestrator
from backend.routers import tasks, transitions, webhooks

# Setup Logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Transition OS Backend")

origins = [o.strip() for o in settings.CORS_ALLOW_ORIGINS.split(",") if o.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Schemas (inline for simplicity as per prompt style, or imported) ---
class WorkflowRequest(BaseModel):
    workflow_type: str
    advisor_id: str
    metadata: Optional[Dict[str, Any]] = None


# --- Global Exception Handling ---


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "message": "Internal Server Error",
            "detail": str(exc),
        },
    )


# --- Health Checks ---


@app.get("/health/live")
def health_live():
    return {"status": "UP", "version": "1.0.0"}


@app.get("/health/ready")
def health_ready():
    if not orchestrator:
        return JSONResponse(
            status_code=503,
            content={"status": "NOT_READY", "reasons": ["Orchestrator not loaded"]},
        )
    return {"status": "READY"}


# --- Core Clawdbot Routes ---


@app.post("/workflows", status_code=201)
async def create_workflow(request: WorkflowRequest):
    logger.info(f"Received create_workflow request: {request}")
    result = orchestrator.onboard_advisor(
        {
            "advisor_id": request.advisor_id,
            "workflow_type": request.workflow_type,
            **(request.metadata or {}),
        }
    )
    return result


@app.get("/workflows/{workflow_id}")
async def get_workflow_dashboard(workflow_id: str):
    return orchestrator.get_dashboard(workflow_id)


@app.post("/documents/validate")
async def validate_document(payload: Dict[str, Any]):
    return orchestrator.validate_document(payload)


@app.get("/predictions/eta/{workflow_id}")
async def get_eta_prediction(workflow_id: str):
    return orchestrator.get_eta_prediction(workflow_id)


@app.post("/entity/match")
async def run_entity_match(payload: Dict[str, Any]):
    return orchestrator.run_entity_match(payload)


@app.post("/communications/draft")
async def draft_communication(payload: Dict[str, Any]):
    return orchestrator.draft_communication(payload)


@app.get("/households/{household_id}/meeting-pack")
async def get_meeting_pack(household_id: int):
    return orchestrator.generate_meeting_pack(household_id)


# --- Existing Routers ---
# Keeping these to ensure we don't break existing functionality outside of the specific Clawdbot scope
app.include_router(transitions.router, prefix=settings.API_V1_STR, tags=["transitions"])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=["tasks"])
app.include_router(webhooks.router, prefix=settings.API_V1_STR, tags=["webhooks"])
