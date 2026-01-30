from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Task Schemas ---
class TaskBase(BaseModel):
    description: str
    status: str
    owner: str

class Task(TaskBase):
    id: int
    workflow_id: int
    due_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskUpdateRequest(BaseModel):
    status: str

# --- Document Schemas ---
class DocumentBase(BaseModel):
    name: str
    document_type: str
    nigo_status: str

class Document(DocumentBase):
    id: int
    household_id: int

    class Config:
        from_attributes = True

# --- Account Schemas ---
class AccountBase(BaseModel):
    account_number: str
    registration_type: str
    custodian: str

class Account(AccountBase):
    id: int
    household_id: int

    class Config:
        from_attributes = True

# --- Household Schemas ---
class HouseholdBase(BaseModel):
    name: str
    status: str

class HouseholdSummary(HouseholdBase):
    id: int
    advisor_id: int

    class Config:
        from_attributes = True

class HouseholdDetail(HouseholdSummary):
    accounts: List[Account] = []
    # Simplified approach: fetch pending tasks via workflow link or separate query 
    # For now, let's assume we might enrich this in the service layer or separate API call
    # but the prompt asked for "household + accounts + tasks"
    # To include tasks we'd need to nest through Workflow -> Tasks
    
    # We will add a flattened list of tasks here for simplicity in this view
    tasks: List[Task] = []
    documents: List[Document] = []
    
    class Config:
        from_attributes = True
