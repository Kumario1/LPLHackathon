from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
import datetime

class Advisor(Base):
    __tablename__ = "advisors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    households = relationship("Household", back_populates="advisor")


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("advisors.id"))
    name = Column(String, nullable=False)
    status = Column(String, default="ONBOARDING")  # ONBOARDING, ACAT_INITIATED, COMPLETED, etc.

    advisor = relationship("Advisor", back_populates="households")
    accounts = relationship("Account", back_populates="household")
    documents = relationship("Document", back_populates="household")
    # Linking workflow one-to-one or one-to-many per household. 
    # Usually a household goes through one transition workflow at a time.
    workflow = relationship("Workflow", uselist=False, back_populates="household")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"))
    account_number = Column(String, unique=True, index=True, nullable=False)
    registration_type = Column(String)  # INDIVIDUAL, JOINT, IRA, etc.
    custodian = Column(String, default="LPL")
    
    household = relationship("Household", back_populates="accounts")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"), unique=True) # One workflow per household for this scaffold
    advisor_id = Column(Integer, ForeignKey("advisors.id")) # Optional, if we want to track by advisor too
    type = Column(String, default="ONBOARDING")
    status = Column(String, default="IN_PROGRESS")
    
    household = relationship("Household", back_populates="workflow")
    tasks = relationship("Task", back_populates="workflow")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    description = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, COMPLETED
    due_date = Column(DateTime(timezone=True), nullable=True)
    owner = Column(String, default="SYSTEM") 

    workflow = relationship("Workflow", back_populates="tasks")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"))
    name = Column(String, nullable=False)
    document_type = Column(String) # ACAT, NEW_ACCOUNT, ADVISORY_AGREEMENT
    nigo_status = Column(String, default="CLEAN") # CLEAN, NIGO

    household = relationship("Household", back_populates="documents")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True) # TASK_COMPLETED, DOCUMENT_UPLOADED
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    actor = Column(String) # user_id or "system" or "clawdbot"
    payload = Column(JSON) # Store details
