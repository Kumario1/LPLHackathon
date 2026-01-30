from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Household, Workflow
from backend.schemas import HouseholdSummary, HouseholdDetail, Task

router = APIRouter()

@router.get("/transitions", response_model=List[HouseholdSummary])
def get_transitions(db: Session = Depends(get_db)):
    """
    Returns a list of all households being transitioned.
    """
    households = db.query(Household).all()
    return households

@router.get("/transitions/{household_id}", response_model=HouseholdDetail)
def get_transition_detail(household_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed view of a household, including accounts, docs, and tasks.
    """
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    
    # Manually assembling the detail view because tasks hang off workflow
    # In a real app we'd filter tasks/docs more carefully
    
    # Convert SQLAlchemy model to Pydantic model
    # We rely on "from_attributes=True" in generic cases, but here we need to flattening tasks
    
    tasks = []
    if household.workflow:
        tasks = household.workflow.tasks
        
    return HouseholdDetail(
        id=household.id,
        advisor_id=household.advisor_id,
        name=household.name,
        status=household.status,
        accounts=household.accounts,
        documents=household.documents,
        tasks=tasks
    )
