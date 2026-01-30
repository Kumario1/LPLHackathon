from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database import get_db
from backend.models import Task, AuditEvent
from backend.schemas import TaskUpdateRequest

router = APIRouter()

@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, request: TaskUpdateRequest = None, db: Session = Depends(get_db)):
    """
    Marks a task as COMPLETED and logs an audit event.
    Accepts optional body to match standard POST patterns, but 
    also just works as an action.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update logic
    old_status = task.status
    task.status = "COMPLETED"
    
    # Create Audit Event
    audit = AuditEvent(
        event_type="TASK_COMPLETED",
        actor="demo_user",
        payload={
            "task_id": task_id,
            "old_status": old_status, 
            "new_status": "COMPLETED",
            "workflow_id": task.workflow_id
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    
    return {"status": "success", "task_id": task_id, "new_state": task.status}
