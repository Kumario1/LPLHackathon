#!/usr/bin/env python3
"""
SQLite Data Seeder - Works without PostgreSQL
"""

import sys
import os

# Set SQLite database before importing models
os.environ["DATABASE_URL"] = "sqlite:///./transition_os.db"

from datetime import datetime, timedelta
from random import choice, randint, uniform

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base, Advisor, Household, Account, Task, Document, Workflow, AuditEvent

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding SQLite database...")
        print(f"📁 Database: ./transition_os.db")
        
        # Create Advisors
        advisors_data = [
            {"name": "John Smith", "email": "john.smith@lpl.com", "channel": "independent", "experience_years": 15},
            {"name": "Sarah Johnson", "email": "sarah.j@lpl.com", "channel": "bank program", "experience_years": 8},
            {"name": "Michael Chen", "email": "mchen@lpl.com", "channel": "acquisition", "experience_years": 22},
            {"name": "Emily Davis", "email": "emily.davis@lpl.com", "channel": "independent", "experience_years": 5},
        ]
        
        advisors = []
        for data in advisors_data:
            existing = db.query(Advisor).filter(Advisor.email == data["email"]).first()
            if not existing:
                advisor = Advisor(**data)
                db.add(advisor)
                advisors.append(advisor)
            else:
                advisors.append(existing)
        
        db.commit()
        print(f"✅ Advisors: {len(advisors)}")
        
        # Create Households
        household_names = [
            "Smith Family", "Johnson Household", "Williams Estate", "Brown Family Trust",
            "Davis Retirement", "Miller Family", "Wilson Portfolio", "Garcia Investments",
            "Anderson Legacy", "Thomas Wealth", "Jackson Trust", "White Holdings"
        ]
        
        statuses = ["IN_PROGRESS", "AT_RISK", "COMPLETED"]
        
        households = []
        for i, name in enumerate(household_names):
            existing = db.query(Household).filter(Household.name == name).first()
            if not existing:
                household = Household(
                    advisor_id=advisors[i % len(advisors)].id,
                    name=name,
                    status=choice(statuses),
                    eta_date=datetime.now() + timedelta(days=randint(7, 60)),
                    risk_score=round(uniform(10, 80), 1)
                )
                db.add(household)
                households.append(household)
            else:
                households.append(existing)
        
        db.commit()
        print(f"✅ Households: {len(households)}")
        
        # Create Accounts
        account_types = ["IRA", "BROKERAGE", "ADVISORY", "401K", "ROTH_IRA"]
        custodians = ["LPL", "SCHWAB", "FIDELITY", "PERSHING"]
        
        account_count = 0
        for household in households:
            if db.query(Account).filter(Account.household_id == household.id).first():
                continue
            
            for _ in range(randint(1, 4)):
                account = Account(
                    household_id=household.id,
                    account_number=f"{household.id:03d}-{randint(1000, 9999)}",
                    type=choice(account_types),
                    custodian=choice(custodians),
                    status=choice(["PENDING", "OPEN", "TRANSFER_IN_PROGRESS"]),
                    asset_value=round(uniform(25000, 2500000), 2)
                )
                db.add(account)
                account_count += 1
        
        db.commit()
        print(f"✅ Accounts: {account_count}")
        
        # Create Workflows
        workflows = []
        for advisor in advisors:
            if db.query(Workflow).filter(Workflow.advisor_id == advisor.id).first():
                continue
            
            workflow = Workflow(
                advisor_id=advisor.id,
                name=f"Onboarding - {advisor.name}",
                type=choice(["RECRUITED_ADVISOR", "ACQUISITION_CONVERSION"]),
                started_at=datetime.now() - timedelta(days=randint(1, 45)),
                target_completion_at=datetime.now() + timedelta(days=randint(30, 90))
            )
            db.add(workflow)
            workflows.append(workflow)
        
        db.commit()
        print(f"✅ Workflows: {len(workflows)}")
        
        # Create Tasks
        task_names = [
            "Submit ACAT forms", "Verify client identity", "Complete risk assessment",
            "Transfer custody docs", "Review compliance checklist", "Set up online access",
            "Schedule welcome call", "Verify beneficiary info", "Upload KYC documents",
            "Review investment policy", "Confirm account funding", "Finalize fee schedule"
        ]
        
        task_count = 0
        for workflow in workflows:
            for household in households:
                if db.query(Task).filter(Task.workflow_id == workflow.id, Task.household_id == household.id).first():
                    continue
                
                for _ in range(randint(3, 6)):
                    task = Task(
                        workflow_id=workflow.id,
                        household_id=household.id,
                        name=choice(task_names),
                        owner_role=choice(["ADVISOR", "OPS", "COMPLIANCE"]),
                        status=choice(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]),
                        priority=randint(1, 3),
                        sla_due_at=datetime.now() + timedelta(days=randint(1, 30))
                    )
                    db.add(task)
                    task_count += 1
        
        db.commit()
        print(f"✅ Tasks: {task_count}")
        
        # Create Documents
        doc_types = ["ACCOUNT_OPEN", "ACAT", "KYC", "OTHER"]
        nigo_statuses = ["UNKNOWN", "CLEAN", "DEFECTS_FOUND"]
        
        doc_count = 0
        for household in households:
            if db.query(Document).filter(Document.household_id == household.id).first():
                continue
            
            for i in range(randint(2, 5)):
                nigo = choice(nigo_statuses)
                document = Document(
                    household_id=household.id,
                    type=choice(doc_types),
                    name=f"DOC_{household.id}_{i+1}_{choice(['KYC', 'ACAT', 'ACCOUNT'])}.pdf",
                    nigo_status=nigo,
                    defects_json=[
                        {"rule": "MISSING_SIGNATURE", "page": 2, "severity": "HIGH"},
                        {"rule": "OUTDATED_FORM", "page": 1, "severity": "MEDIUM"}
                    ] if nigo == "DEFECTS_FOUND" else None
                )
                db.add(document)
                doc_count += 1
        
        db.commit()
        print(f"✅ Documents: {doc_count}")
        
        # Create Audit Events
        event_types = ["TASK_COMPLETED", "DOCUMENT_UPLOADED", "HOUSEHOLD_CREATED", 
                       "WORKFLOW_STARTED", "ACCOUNT_OPENED", "NIGO_DETECTED"]
        
        for _ in range(30):
            audit = AuditEvent(
                actor_type=choice(["USER", "BOT", "SYSTEM"]),
                actor_id=f"user_{randint(1, 5)}" if choice([True, False]) else "system",
                event_type=choice(event_types),
                entity_type=choice(["Task", "Household", "Document", "Workflow", "Account"]),
                entity_id=str(randint(1, 50)),
                payload_json={"action": "created", "timestamp": datetime.now().isoformat()}
            )
            db.add(audit)
        
        db.commit()
        print(f"✅ Audit Events: 30")
        
        # Summary
        print("\n" + "="*50)
        print("🎉 SEEDING COMPLETE!")
        print("="*50)
        print(f"""
📊 FINAL COUNTS:
   • Advisors:      {db.query(Advisor).count()}
   • Households:    {db.query(Household).count()}
   • Accounts:      {db.query(Account).count()}
   • Workflows:     {db.query(Workflow).count()}
   • Tasks:         {db.query(Task).count()}
   • Documents:     {db.query(Document).count()}
   • Audit Events:  {db.query(AuditEvent).count()}

💾 Database: ./transition_os.db
        """)
        
        # Show sample data
        print("📋 SAMPLE HOUSEHOLDS:")
        for h in db.query(Household).limit(5).all():
            tasks_open = db.query(Task).filter(Task.household_id == h.id, Task.status != "COMPLETED").count()
            docs_nigo = db.query(Document).filter(Document.household_id == h.id, Document.nigo_status == "DEFECTS_FOUND").count()
            print(f"   • {h.name} ({h.status}) - Tasks: {tasks_open}, NIGO: {docs_nigo}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
