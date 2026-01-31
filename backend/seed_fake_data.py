#!/usr/bin/env python3
"""
Fake Data Seeder for Transition OS

This script populates the database with realistic fake data for testing.
Run this on your backend EC2 to create sample households, tasks, and documents.
"""

import sys
import os
from datetime import datetime, timedelta
from random import choice, randint, uniform

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import Advisor, Household, Account, Task, Document, Workflow, AuditEvent


def seed_fake_data():
    """Seed the database with fake data"""
    db = SessionLocal()
    
    try:
        print("🌱 Seeding fake data...")
        
        # Clear existing data (optional - comment out if you want to keep existing)
        # db.query(AuditEvent).delete()
        # db.query(Document).delete()
        # db.query(Task).delete()
        # db.query(Account).delete()
        # db.query(Household).delete()
        # db.query(Workflow).delete()
        # db.query(Advisor).delete()
        # db.commit()
        
        # Create Advisors
        advisors = [
            Advisor(name="John Smith", email="john.smith@lpl.com", channel="independent", experience_years=15),
            Advisor(name="Sarah Johnson", email="sarah.j@lpl.com", channel="bank program", experience_years=8),
            Advisor(name="Michael Chen", email="mchen@lpl.com", channel="acquisition", experience_years=22),
            Advisor(name="Emily Davis", email="emily.davis@lpl.com", channel="independent", experience_years=5),
        ]
        
        for advisor in advisors:
            existing = db.query(Advisor).filter(Advisor.email == advisor.email).first()
            if not existing:
                db.add(advisor)
        
        db.commit()
        print(f"✅ Created {len(advisors)} advisors")
        
        # Get all advisors for reference
        db_advisors = db.query(Advisor).all()
        
        # Create Households
        household_data = [
            {"name": "Smith Family", "status": "IN_PROGRESS", "risk_score": 25.5},
            {"name": "Johnson Household", "status": "IN_PROGRESS", "risk_score": 45.0},
            {"name": "Williams Estate", "status": "AT_RISK", "risk_score": 78.5},
            {"name": "Brown Family Trust", "status": "COMPLETED", "risk_score": 10.0},
            {"name": "Davis Retirement", "status": "IN_PROGRESS", "risk_score": 35.0},
            {"name": "Miller Family", "status": "AT_RISK", "risk_score": 65.0},
            {"name": "Wilson Portfolio", "status": "IN_PROGRESS", "risk_score": 20.0},
            {"name": "Garcia Investments", "status": "COMPLETED", "risk_score": 15.0},
        ]
        
        households = []
        for i, h_data in enumerate(household_data):
            advisor = db_advisors[i % len(db_advisors)]
            
            # Check if household exists
            existing = db.query(Household).filter(Household.name == h_data["name"]).first()
            if existing:
                households.append(existing)
                continue
            
            household = Household(
                name=h_data["name"],
                advisor_id=advisor.id,
                status=h_data["status"],
                eta_date=datetime.now() + timedelta(days=randint(7, 60)),
                risk_score=h_data["risk_score"]
            )
            db.add(household)
            households.append(household)
        
        db.commit()
        print(f"✅ Created {len(households)} households")
        
        # Create Accounts for each household
        account_types = ["IRA", "BROKERAGE", "ADVISORY", "401K"]
        custodians = ["LPL", "SCHWAB", "FIDELITY", "PERSHING"]
        
        for household in households:
            # Check if household already has accounts
            existing_accounts = db.query(Account).filter(Account.household_id == household.id).count()
            if existing_accounts > 0:
                continue
            
            # Create 1-4 accounts per household
            num_accounts = randint(1, 4)
            for i in range(num_accounts):
                account = Account(
                    household_id=household.id,
                    account_number=f"ACC-{household.id}-{i+1:03d}",
                    type=choice(account_types),
                    custodian=choice(custodians),
                    status=choice(["PENDING", "OPEN", "TRANSFER_IN_PROGRESS"]),
                    asset_value=uniform(50000, 2000000)
                )
                db.add(account)
        
        db.commit()
        print(f"✅ Created accounts for households")
        
        # Create Workflows
        workflow_types = ["RECRUITED_ADVISOR", "ACQUISITION_CONVERSION"]
        
        for advisor in db_advisors:
            # Check if advisor already has workflows
            existing_workflows = db.query(Workflow).filter(Workflow.advisor_id == advisor.id).count()
            if existing_workflows > 0:
                continue
            
            workflow = Workflow(
                advisor_id=advisor.id,
                name=f"{choice(['Recruited', 'Acquisition'])} Advisor Onboarding - {advisor.name}",
                type=choice(workflow_types),
                started_at=datetime.now() - timedelta(days=randint(1, 30)),
                target_completion_at=datetime.now() + timedelta(days=randint(30, 90))
            )
            db.add(workflow)
        
        db.commit()
        print(f"✅ Created workflows")
        
        # Create Tasks
        task_templates = [
            {"name": "Submit ACAT forms", "owner_role": "ADVISOR", "priority": 1},
            {"name": "Verify client identity", "owner_role": "OPS", "priority": 2},
            {"name": "Complete risk assessment", "owner_role": "ADVISOR", "priority": 1},
            {"name": "Transfer custody documents", "owner_role": "OPS", "priority": 2},
            {"name": "Review compliance checklist", "owner_role": "COMPLIANCE", "priority": 1},
            {"name": "Set up online access", "owner_role": "OPS", "priority": 3},
            {"name": "Schedule welcome call", "owner_role": "ADVISOR", "priority": 2},
            {"name": "Verify beneficiary info", "owner_role": "OPS", "priority": 1},
        ]
        
        statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]
        
        db_workflows = db.query(Workflow).all()
        
        for workflow in db_workflows:
            for household in households:
                # Check if tasks already exist
                existing_tasks = db.query(Task).filter(
                    Task.workflow_id == workflow.id,
                    Task.household_id == household.id
                ).count()
                if existing_tasks > 0:
                    continue
                
                # Create 3-6 tasks per household
                num_tasks = randint(3, 6)
                selected_tasks = [choice(task_templates) for _ in range(num_tasks)]
                
                for task_data in selected_tasks:
                    task = Task(
                        workflow_id=workflow.id,
                        household_id=household.id,
                        name=task_data["name"],
                        owner_role=task_data["owner_role"],
                        status=choice(statuses),
                        priority=task_data["priority"],
                        sla_due_at=datetime.now() + timedelta(days=randint(1, 30))
                    )
                    db.add(task)
        
        db.commit()
        print(f"✅ Created tasks")
        
        # Create Documents
        document_types = ["ACCOUNT_OPEN", "ACAT", "KYC", "OTHER"]
        nigo_statuses = ["UNKNOWN", "CLEAN", "DEFECTS_FOUND"]
        
        for household in households:
            # Check if documents already exist
            existing_docs = db.query(Document).filter(Document.household_id == household.id).count()
            if existing_docs > 0:
                continue
            
            # Create 2-5 documents per household
            num_docs = randint(2, 5)
            for i in range(num_docs):
                doc_type = choice(document_types)
                nigo = choice(nigo_statuses)
                
                document = Document(
                    household_id=household.id,
                    account_id=None,  # Could link to specific account
                    type=doc_type,
                    name=f"{doc_type}_Doc_{i+1}_{household.name.replace(' ', '_')}.pdf",
                    storage_url=f"s3://documents/{household.id}/{doc_type.lower()}_{i+1}.pdf",
                    nigo_status=nigo,
                    defects_json={
                        "defects": [
                            {"type": "MISSING_SIGNATURE", "page": 2, "severity": "HIGH"}
                        ]
                    } if nigo == "DEFECTS_FOUND" else None
                )
                db.add(document)
        
        db.commit()
        print(f"✅ Created documents")
        
        # Create Audit Events
        event_types = ["TASK_COMPLETED", "DOCUMENT_UPLOADED", "HOUSEHOLD_CREATED", "WORKFLOW_STARTED"]
        
        for _ in range(20):
            audit = AuditEvent(
                actor_type=choice(["USER", "BOT", "SYSTEM"]),
                actor_id=f"actor_{randint(1, 10)}",
                event_type=choice(event_types),
                entity_type=choice(["Task", "Household", "Document", "Workflow"]),
                entity_id=str(randint(1, 50)),
                payload_json={"details": "Test audit event", "timestamp": datetime.now().isoformat()}
            )
            db.add(audit)
        
        db.commit()
        print(f"✅ Created audit events")
        
        print("\n🎉 Fake data seeding complete!")
        print(f"\n📊 Summary:")
        print(f"   - Advisors: {db.query(Advisor).count()}")
        print(f"   - Households: {db.query(Household).count()}")
        print(f"   - Accounts: {db.query(Account).count()}")
        print(f"   - Workflows: {db.query(Workflow).count()}")
        print(f"   - Tasks: {db.query(Task).count()}")
        print(f"   - Documents: {db.query(Document).count()}")
        print(f"   - Audit Events: {db.query(AuditEvent).count()}")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_fake_data()
