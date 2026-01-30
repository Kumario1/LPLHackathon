from fastapi import FastAPI
from backend.config import settings
from backend.routers import transitions, tasks, webhooks

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Include Routers
app.include_router(transitions.router, prefix=settings.API_V1_STR, tags=["transitions"])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=["tasks"])
app.include_router(webhooks.router, prefix=settings.API_V1_STR, tags=["webhooks"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
