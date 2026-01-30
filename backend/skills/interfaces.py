from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

# --- Domain Models for Skills ---

class WorkflowDefinition(BaseModel):
    name: str
    steps: List[str]

class PredictionResult(BaseModel):
    score: float
    confidence: float
    factors: List[str]

class DocumentValidationResult(BaseModel):
    is_valid: bool
    nigo_status: str # CLEAN, DEFECTS_FOUND
    defects: List[str]

class MeetingPack(BaseModel):
    household_id: int
    documents: List[str]
    talking_points: List[str]

# --- Interfaces ---

class WorkflowEngine(ABC):
    @abstractmethod
    def create_workflow(self, workflow_type: str, advisor_id: int) -> int:
        """Creates a workflow and returns its ID."""
        pass

    @abstractmethod
    def get_next_steps(self, workflow_id: int) -> List[str]:
        """Returns next recommended steps."""
        pass

class DocumentIntelligence(ABC):
    @abstractmethod
    def validate_document(self, document_id: int) -> DocumentValidationResult:
        """Validates a document and checks for NIGO defects."""
        pass

    @abstractmethod
    def extract_info(self, document_id: int) -> Dict[str, Any]:
        """Extracts key-value pairs from a document."""
        pass

class EtaPrediction(ABC):
    @abstractmethod
    def predict_completion_date(self, household_id: int) -> PredictionResult:
        """Predicts ETA for household transition completion."""
        pass

class MeetingPrep(ABC):
    @abstractmethod
    def generate_pack(self, household_id: int) -> MeetingPack:
        """Generates a meeting pack for the household."""
        pass

# --- Stub Implementations (Default) ---

class StubWorkflowEngine(WorkflowEngine):
    def create_workflow(self, workflow_type: str, advisor_id: int) -> int:
        raise NotImplementedError("WorkflowEngine.create_workflow is not implemented")
        
    def get_next_steps(self, workflow_id: int) -> List[str]:
        return ["Step 1 (Stub)", "Step 2 (Stub)"]

class StubDocumentIntelligence(DocumentIntelligence):
    def validate_document(self, document_id: int) -> DocumentValidationResult:
        raise NotImplementedError("DocumentIntelligence.validate_document is not implemented")

    def extract_info(self, document_id: int) -> Dict[str, Any]:
        return {"stub_key": "stub_value"}

class StubEtaPrediction(EtaPrediction):
    def predict_completion_date(self, household_id: int) -> PredictionResult:
        return PredictionResult(score=0.85, confidence=0.9, factors=["Historical data"])

class StubMeetingPrep(MeetingPrep):
    def generate_pack(self, household_id: int) -> MeetingPack:
        raise NotImplementedError("MeetingPrep.generate_pack is not implemented")
