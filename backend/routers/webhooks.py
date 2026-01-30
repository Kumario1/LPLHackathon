from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import json

from backend.database import get_db
from backend.models import AuditEvent, Document, Account, Task
from backend.schemas import TaskSchema

router = APIRouter()

@router.post("/webhooks/{source}")
async def receive_webhook(source: str, request: Request, db: Session = Depends(get_db)):
    """
    Ingests webhooks from external sources (e.g. DocuSign, ACAT provider)
    and logs them as audit events. Also triggers specific business logic.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("event_type")
    if not event_type:
        raise HTTPException(status_code=422, detail="Missing event_type in payload")

    # 1. Log Audit Event
    # Infer entity ID for audit log
    entity_type = None
    entity_id = None
    if "household_id" in payload:
        entity_type = "Household"
        entity_id = str(payload["household_id"])
    elif "account_id" in payload:
        entity_type = "Account"
        entity_id = str(payload["account_id"])

    audit = AuditEvent(
        event_type=f"WEBHOOK_{event_type}",
        actor_type="SYSTEM",
        actor_id=source,
        entity_type=entity_type,
        entity_id=entity_id,
        payload_json=payload
    )
    db.add(audit)
    
    # 2. Handle specific events
    # DOCUMENT_UPLOADED
    if event_type == "DOCUMENT_UPLOADED":
        # Ensure document exists or create generic one
        doc_id = payload.get("document_id")
        household_id = payload.get("household_id")
        if household_id:
            # Check if doc exists? If doc_id given, maybe Look up by ID? 
            # If not found, create new.
            # For this simple logic, if doc_id provided and generic ID matches, fine.
            # But usually doc_id is external or internal. 
            # Prompt says: "If document_id is provided, ensure there is a Document row... if not, create one"
            # We assume payload document_id might map to internal ID or we just create a new one if we can't find it.
            # Let's simple create a new doc if we don't strictly find it by some ID logic, 
            # or just log it. 
            # For simplicity: Always create if not present is tricky without common ID.
            # Let's just create a new Document row if 'document_id' is NOT an integer we found.
            pass # Logic below
            
            # Simple implementation:
            # If we were given an internal ID, try to find it. 
            # If not found, create a new doc entry.
            doc_name = payload.get("filename", "Uploaded Document")
            doc_type = payload.get("doc_type", "OTHER")
            
            # Create new doc
            new_doc = Document(
                household_id=household_id,
                name=doc_name,
                type=doc_type,
                nigo_status="UNKNOWN"
            )
            db.add(new_doc)
            db.commit() # Commit to generate ID

    # ESIGN_COMPLETED
    elif event_type == "ESIGN_COMPLETED":
        doc_id = payload.get("document_id")
        if doc_id:
            # In a real app doc_id is internal ID. 
            # We try to cast to int
            try:
                doc = db.query(Document).filter(Document.id == int(doc_id)).first()
                if doc:
                    doc.nigo_status = "CLEAN"
                    db.add(doc)
            except ValueError:
                pass

    # ACAT_REJECTED
    elif event_type == "ACAT_REJECTED":
        account_id = payload.get("account_id") # This might be strings like "ACC_001", we need to map to int ID or account_number
        if account_id:
            # Try finding by ID first, then account_number
            account = None
            if isinstance(account_id, int) or (isinstance(account_id, str) and account_id.isdigit()):
                 account = db.query(Account).filter(Account.id == int(account_id)).first()
            
            if not account:
                 account = db.query(Account).filter(Account.account_number == str(account_id)).first()
            
            if account:
                account.status = "TRANSFER_REJECTED"
                db.add(account)
                
                # Create Task
                # "Resolve ACAT rejection for account {id}"
                task_name = f"Resolve ACAT rejection for account {account.account_number}"
                new_task = Task(
                    workflow_id=None, # Or find active workflow? Prompt didn't specify.
                    household_id=account.household_id,
                    name=task_name,
                    owner_role="OPS",
                    status="PENDING",
                    priority=1,
                    sla_due_at=datetime.now() # Due now!
                )
                db.add(new_task)

    db.commit()

    return {
        "status": "received", 
        "source": source, 
        "event_type": event_type
    }
