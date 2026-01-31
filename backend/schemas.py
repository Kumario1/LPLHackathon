from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# --- Task Schemas ---
class TaskSchema(BaseModel):
    id: int
    name: str
    owner_role: str
    status: str
    priority: int
    sla_due_at: Optional[datetime] = None
    blocked_by_task_id: Optional[int] = None

    # Enable ORM mode for Pydantic v2
    model_config = ConfigDict(from_attributes=True)


class TaskUpdateRequest(BaseModel):
    status: str
    note: Optional[str] = None


# --- Account Schemas ---
class AccountSchema(BaseModel):
    id: int
    type: str  # IRA, BROKERAGE, etc
    custodian: str
    status: str
    asset_value: float = 0.0

    model_config = ConfigDict(from_attributes=True)


# --- Document Schemas ---
class DocumentSchema(BaseModel):
    id: int
    name: str
    type: str
    nigo_status: str

    model_config = ConfigDict(from_attributes=True)


# --- Household Schemas ---
class HouseholdSummary(BaseModel):
    id: int
    name: str
    advisor_name: str
    status: str
    eta_date: Optional[datetime] = None
    risk_score: Optional[float] = None
    accounts_count: int = 0
    # New fields
    open_tasks_count: int = 0
    nigo_issues_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class HouseholdDetail(BaseModel):
    id: int
    name: str
    advisor_name: str
    status: str
    eta_date: Optional[datetime] = None
    risk_score: Optional[float] = None

    # New fields
    open_tasks_count: int = 0
    nigo_issues_count: int = 0
    progress_percent: float = 0.0

    accounts: List[AccountSchema] = []
    tasks: List[TaskSchema] = []

    model_config = ConfigDict(from_attributes=True)
