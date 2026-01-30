from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime
import json

from backend.database import get_db
from backend.models import AuditEvent

router = APIRouter()

@router.post("/webhooks/{source}")
async def receive_webhook(source: str, request: Request, db: Session = Depends(get_db)):
    """
    Ingests webhooks from external sources (e.g. DocuSign, ACAT provider)
    and logs them as audit events.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {"raw_body": (await request.body()).decode()}

    print(f"Received webhook from {source}: {payload}")

    audit = AuditEvent(
        event_type=f"WEBHOOK_RECEIVED_{source.upper()}",
        actor="system_webhook",
        payload=payload
    )
    db.add(audit)
    db.commit()

    return {"status": "received"}
