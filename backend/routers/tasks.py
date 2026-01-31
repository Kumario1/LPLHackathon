from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import AuditEvent, Household, Task
from backend.schemas import TaskSchema, TaskUpdateRequest

router = APIRouter()


@router.post("/tasks/{task_id}/complete", response_model=TaskSchema)
def complete_task(
    task_id: int, request: TaskUpdateRequest, db: Session = Depends(get_db)
):
    """
    Marks a task as COMPLETED.
    Rejects if already completed or if status is not 'COMPLETED'.
    """
    # 1. Validate Request
    if request.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'COMPLETED'"
        )

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Check overlap
    if task.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Task is already completed"
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
        payload_json=payload,
    )
    db.add(audit)

    if task.household_id:
        household = (
            db.query(Household).filter(Household.id == task.household_id).first()
        )
        if household:
            all_tasks = db.query(Task).filter(Task.household_id == household.id).all()
            if all(t.status == "COMPLETED" for t in all_tasks):
                # All tasks are complete. Logic for auto-completing household could go here.
                # For now, we leave the household status as-is to allow for manual review.
                pass

    db.commit()
    db.refresh(task)

    return task
