from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class Advisor(Base):
    __tablename__ = "advisors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # email removed or kept? User prompt didn't specify keeping email, but it's reasonable.
    # Prompt specified: id, name, channel, experience_years.
    # I'll keep email as it's useful, but prioritize requested fields.
    email = Column(String, unique=True, index=True, nullable=True)
    channel = Column(
        String, default="independent"
    )  # "independent", "bank program", "acquisition"
    experience_years = Column(Integer, nullable=True)

    households = relationship("Household", back_populates="advisor")
    workflows = relationship("Workflow", back_populates="advisor")


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("advisors.id"))
    name = Column(String, nullable=False)
    status = Column(String, default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, AT_RISK
    eta_date = Column(DateTime(timezone=True), nullable=True)
    risk_score = Column(Float, nullable=True)  # 0-100

    advisor = relationship("Advisor", back_populates="households")
    accounts = relationship("Account", back_populates="household")
    documents = relationship("Document", back_populates="household")
    tasks = relationship("Task", back_populates="household")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"))
    account_number = Column(
        String, unique=True, index=True, nullable=False
    )  # Kept for utility
    type = Column(String)  # IRA, BROKERAGE, ADVISORY
    custodian = Column(String, default="LPL")  # SCHWAB, FIDELITY, PERSHING, LPL
    status = Column(
        String, default="PENDING"
    )  # PENDING, OPEN, CLOSED, TRANSFER_IN_PROGRESS
    asset_value = Column(Float, default=0.0)

    household = relationship("Household", back_populates="accounts")
    documents = relationship("Document", back_populates="account")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("advisors.id"))
    name = Column(String, nullable=False)  # Recruited advisor onboarding - Jane Doe
    type = Column(
        String, default="RECRUITED_ADVISOR"
    )  # RECRUITED_ADVISOR, ACQUISITION_CONVERSION

    started_at = Column(DateTime(timezone=True), nullable=True)
    target_completion_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    advisor = relationship("Advisor", back_populates="workflows")
    tasks = relationship("Task", back_populates="workflow")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    household_id = Column(
        Integer, ForeignKey("households.id"), nullable=True
    )  # Optional link to household
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)  # Kept for utility
    owner_role = Column(String, default="ADVISOR")  # ADVISOR, OPS, COMPLIANCE
    status = Column(
        String, default="PENDING"
    )  # PENDING, IN_PROGRESS, COMPLETED, FAILED, BLOCKED
    priority = Column(Integer, default=1)
    sla_due_at = Column(DateTime(timezone=True), nullable=True)
    blocked_by_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    workflow = relationship("Workflow", back_populates="tasks")
    household = relationship("Household", back_populates="tasks")
    blocked_by = relationship("Task", remote_side=[id])


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    type = Column(String, default="OTHER")  # ACCOUNT_OPEN, ACAT, KYC
    name = Column(String, nullable=False)
    storage_url = Column(String, nullable=True)
    nigo_status = Column(String, default="UNKNOWN")  # UNKNOWN, CLEAN, DEFECTS_FOUND
    defects_json = Column(JSON, nullable=True)

    household = relationship("Household", back_populates="documents")
    account = relationship("Account", back_populates="documents")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    actor_type = Column(String, default="SYSTEM")  # USER, BOT, SYSTEM
    actor_id = Column(String, default="system")
    event_type = Column(
        String, index=True
    )  # TASK_COMPLETED, WEBHOOK_RECEIVED, NIGO_VALIDATED
    entity_type = Column(String, nullable=True)  # Task, Household, Document
    entity_id = Column(String, nullable=True)
    payload_json = Column(JSON)  # Store details
