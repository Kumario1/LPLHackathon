import logging
from typing import Dict, Any, Optional

from backend.config import settings
from backend.skills.interfaces import (
    WorkflowEngine, DocumentIntelligence, EtaPrediction, MeetingPrep,
    StubWorkflowEngine, StubDocumentIntelligence, StubEtaPrediction, StubMeetingPrep,
    WorkflowDefinition, DocumentValidationResult, PredictionResult, MeetingPack
)

logger = logging.getLogger(__name__)

class Orchestrator:
    """
    The Orchestrator is the central entry point for all 'smart' or 'complex' capabilities.
    It delegates to specialized Skills.
    It handles configuration (stubs vs real) and graceful degradation.
    """
    
    def __init__(self):
        self.workflow_engine: WorkflowEngine = StubWorkflowEngine()
        self.doc_intel: DocumentIntelligence = StubDocumentIntelligence()
        self.eta_predictor: EtaPrediction = StubEtaPrediction()
        self.meeting_prep: MeetingPrep = StubMeetingPrep()

        # In the future, we can load "Real" implementations here based on settings.
        # if not settings.ENABLE_SKILL_STUBS:
        #     self.workflow_engine = RealWorkflowEngine() ...

        logger.info(f"Orchestrator initialized. Stubs enabled: {settings.ENABLE_SKILL_STUBS}")

    def create_workflow(self, workflow_type: str, advisor_id: int) -> int:
        """Delegates to WorkflowEngine"""
        try:
            logger.info(f"Orchestrating create_workflow type={workflow_type} advisor={advisor_id}")
            return self.workflow_engine.create_workflow(workflow_type, advisor_id)
        except NotImplementedError:
            logger.warning("WorkflowEngine.create_workflow not implemented, returning Stub ID -1")
            # For API Hardening, we might want to let the API handle the 501, 
            # OR return a safe default. The prompt asks to handle NotImplementedError 
            # and return a response with "status: NOT_IMPLEMENTED" etc.
            # But since this returns an int, we should probably let the exception bubble up 
            # to the API layer to format the JSON 501 response.
            raise

    def get_eta_prediction(self, household_id: int) -> PredictionResult:
        try:
             return self.eta_predictor.predict_completion_date(household_id)
        except NotImplementedError:
             logger.warning("EtaPrediction not implemented")
             raise

    def validate_document(self, document_id: int) -> DocumentValidationResult:
        try:
            return self.doc_intel.validate_document(document_id)
        except NotImplementedError:
             logger.warning("DocumentIntelligence not implemented")
             raise

    def generate_meeting_pack(self, household_id: int) -> MeetingPack:
        try:
            return self.meeting_prep.generate_pack(household_id)
        except NotImplementedError:
             logger.warning("MeetingPrep not implemented")
             raise

# Global instance
orchestrator = Orchestrator()
