from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import json

from backend.database import get_db
from backend.models import Task, AuditEvent, Household
from backend.schemas import TaskUpdateRequest, TaskSchema

router = APIRouter()

@router.post("/tasks/{task_id}/complete", response_model=TaskSchema)
def complete_task(task_id: int, request: TaskUpdateRequest, db: Session = Depends(get_db)):
    """
    Marks a task as COMPLETED.
    Rejects if already completed or if status is not 'COMPLETED'.
    """
    # 1. Validate Request
    if request.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Status must be 'COMPLETED'"
        )

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Check overlap
    if task.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Task is already completed"
        )

    old_status = task.status
    task.status = "COMPLETED"
    
    # 3. Audit Event
    payload = {
        "task_id": task_id,
        "old_status": old_status,
        "new_status": "COMPLETED",
    }
    if request.note:
        payload["note"] = request.note

    audit = AuditEvent(
        event_type="TASK_COMPLETED",
        actor_type="USER",
        actor_id="demo_user",
        entity_type="Task",
        entity_id=str(task_id),
        payload_json=payload
    )
    db.add(audit)
    
    # 4. Optional: Check parent household completion? 
    # If all tasks for household are complete, update household status?
    # Simple logic:
    if task.household_id:
        # Check siblings
        household = db.query(Household).filter(Household.id == task.household_id).first()
        if household:
             # Refresh household tasks to get latest state including this one (in session)
             # But this task isn't committed yet. It is in session though.
             # We can check all tasks for this household in DB.
             all_tasks = db.query(Task).filter(Task.household_id == household.id).all()
             # Logic: if ALL other tasks are completed (or are THIS task), set household to COMPLETED?
             # Be careful not to complete prematurely if fetching old state.
             # Since we changed task.status in this session, checking objects in session should be fine.
             if all(t.status == "COMPLETED" for t in all_tasks):
                 # Auto-complete household?
                 # household.status = "COMPLETED" 
                 # Maybe generic "IN_PROGRESS" is safer unless we are sure.
                 # Let's leave it manual for now or "REVIEW_REQUIRED".
                 pass

    db.commit()
    db.refresh(task)
    
    return task
