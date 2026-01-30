from fastapi import APIRouter, HTTPException
from backend.orchestrator import orchestrator
from backend.skills.interfaces import PredictionResult, DocumentValidationResult, MeetingPack
from pydantic import BaseModel

router = APIRouter()

class WorkflowCreateRequest(BaseModel):
    workflow_type: str
    advisor_id: int

@router.post("/workflows")
def create_workflow(request: WorkflowCreateRequest):
    """Creates a new workflow via the Orchestrator."""
    return orchestrator.create_workflow(request.workflow_type, request.advisor_id)

@router.get("/predictions/eta/{household_id}", response_model=PredictionResult)
def get_eta_prediction(household_id: int):
    """Gets ETA prediction from the AI Skill."""
    return orchestrator.get_eta_prediction(household_id)

@router.post("/documents/validate/{document_id}", response_model=DocumentValidationResult)
def validate_document(document_id: int):
    """Triggers NIGO check on a document."""
    return orchestrator.validate_document(document_id)

@router.get("/households/{household_id}/meeting-pack", response_model=MeetingPack)
def get_meeting_pack(household_id: int):
    """Generates a meeting pack."""
    return orchestrator.generate_meeting_pack(household_id)
