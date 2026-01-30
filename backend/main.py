from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

# Ensure logging config is loaded
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

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Global Exception Handling ---

@app.exception_handler(NotImplementedError)
async def not_implemented_handler(request: Request, exc: NotImplementedError):
    return JSONResponse(
        status_code=501,
        content={
            "status": "NOT_IMPLEMENTED",
            "message": str(exc),
            "detail": "This skill is not yet implemented in the backend."
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "message": "Internal Server Error",
            "detail": str(exc) # Use caution in PROD
        }
    )

# --- Health Checks ---

@app.get("/health/live")
def health_live():
    return {"status": "UP", "version": "1.0.0"}

@app.get("/health/ready")
def health_ready():
    # Check if orchestrator is loaded
    if not orchestrator:
        return JSONResponse(status_code=503, content={"status": "NOT_READY", "reason": "Orchestrator null"})
    return {"status": "READY"}

@app.get("/health")
def health_check():
    """Legacy health check"""
    return {"status": "ok"}

# Include Routers
app.include_router(transitions.router, prefix=settings.API_V1_STR, tags=["transitions"])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=["tasks"])
app.include_router(webhooks.router, prefix=settings.API_V1_STR, tags=["webhooks"])
app.include_router(skills_api.router, prefix=settings.API_V1_STR, tags=["skills"])
