from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging

from backend.logging_config import setup_logging
from backend.config import settings
from backend.database import engine, Base
from backend.routers import transitions, tasks, webhooks, skills_api
from backend.orchestrator import orchestrator

# Setup Logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Transition OS Backend")

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
            "detail": str(exc)
        }
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
            content={"status": "NOT_READY", "reasons": ["Orchestrator not loaded"]}
        )
    return {"status": "READY"}

# --- Core Clawdbot Routes ---

@app.post("/workflows", status_code=201)
async def create_workflow(request: WorkflowRequest):
    logger.info(f"Received create_workflow request: {request}")
    result = orchestrator.onboard_advisor(
        {"advisor_id": request.advisor_id, "workflow_type": request.workflow_type, **(request.metadata or {})}
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

# --- Existing Routers ---
# Keeping these to ensure we don't break existing functionality outside of the specific Clawdbot scope
app.include_router(transitions.router, prefix=settings.API_V1_STR, tags=["transitions"])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=["tasks"])
app.include_router(webhooks.router, prefix=settings.API_V1_STR, tags=["webhooks"])
app.include_router(skills_api.router, prefix=settings.API_V1_STR, tags=["skills"])
