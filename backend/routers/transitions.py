from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, text
from typing import List, Optional

from backend.database import get_db
from backend.models import Household, Task, Document
from backend.schemas import HouseholdSummary, HouseholdDetail

router = APIRouter()

@router.get("/transitions", response_model=List[HouseholdSummary])
def get_transitions(
    advisor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns a list of all households being transitioned.
    Supports filtering by advisor_id and status.
    Ordered by risk_score DESC, then eta_date ASC.
    """
    query = db.query(Household)
    
    if advisor_id:
        query = query.filter(Household.advisor_id == int(advisor_id))
    if status:
        query = query.filter(Household.status == status)
        
    # Order by risk_score DESC, eta_date ASC (nulls last)
    query = query.order_by(desc(Household.risk_score), Household.eta_date.asc())
    
    households = query.all()
    
    results = []
    for h in households:
        advisor_name = h.advisor.name if h.advisor else "Unknown"
        accounts_count = len(h.accounts)
        
        # Open filtered tasks (not COMPLETED)
        # Note: relying on relationship might load all tasks. For optimization we might query count separately, 
        # but for hackathon scale this is fine.
        open_tasks = [t for t in h.tasks if t.status != "COMPLETED"]
        open_tasks_count = len(open_tasks)
        
        # NIGO docs
        nigo_docs = [d for d in h.documents if d.nigo_status == "DEFECTS_FOUND"]
        nigo_issues_count = len(nigo_docs)
        
        results.append(HouseholdSummary(
            id=h.id,
            name=h.name,
            advisor_name=advisor_name,
            status=h.status,
            eta_date=h.eta_date,
            risk_score=h.risk_score,
            accounts_count=accounts_count,
            open_tasks_count=open_tasks_count,
            nigo_issues_count=nigo_issues_count
        ))
    return results

@router.get("/transitions/{household_id}", response_model=HouseholdDetail)
def get_transition_detail(household_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed view of a household, including accounts and tasks.
    """
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    
    advisor_name = household.advisor.name if household.advisor else "Unknown"
    
    # Computations
    total_tasks = len(household.tasks)
    completed_tasks = len([t for t in household.tasks if t.status == "COMPLETED"])
    open_tasks_count = total_tasks - completed_tasks
    
    progress_percent = 0.0
    if total_tasks > 0:
        progress_percent = (completed_tasks / total_tasks) * 100.0
        
    nigo_docs = [d for d in household.documents if d.nigo_status == "DEFECTS_FOUND"]
    nigo_issues_count = len(nigo_docs)

    return HouseholdDetail(
        id=household.id,
        name=household.name,
        advisor_name=advisor_name,
        status=household.status,
        eta_date=household.eta_date,
        risk_score=household.risk_score,
        open_tasks_count=open_tasks_count,
        nigo_issues_count=nigo_issues_count,
        progress_percent=progress_percent,
        accounts=household.accounts,
        tasks=household.tasks
    )
