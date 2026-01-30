from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database import SessionLocal, engine
from backend.models import Advisor, Household, Account, Workflow, Task, Document

def seed_db():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(Advisor).first():
        print("Database already seeded.")
        return

    print("Seeding database...")

    # 1. Create Advisor
    advisor = Advisor(name="Jane Doe", email="jane.doe@lpl.com")
    db.add(advisor)
    db.commit()
    db.refresh(advisor)

    # 2. Create Households
    households_data = [
        {"name": "The Smith Family", "status": "ONBOARDING"},
        {"name": "Jones Joint Account", "status": "ACAT_INITIATED"},
        {"name": "Dr. Emily Wong", "status": "COMPLETED"},
    ]
    
    households = []
    for h_data in households_data:
        h = Household(advisor_id=advisor.id, **h_data)
        db.add(h)
        households.append(h)
    
    db.commit()
    for h in households:
        db.refresh(h)

    # 3. Create Accounts (6-9 accounts)
    accounts_data = [
        # Smith
        {"household_id": households[0].id, "account_number": "111-222-333", "registration_type": "JOINT_WROS", "custodian": "LPL"},
        {"household_id": households[0].id, "account_number": "111-222-444", "registration_type": "IRA_ROTH", "custodian": "LPL"},
        {"household_id": households[0].id, "account_number": "EXT-999-001", "registration_type": "INDIVIDUAL", "custodian": "SCHWAB"},
        # Jones
        {"household_id": households[1].id, "account_number": "555-666-777", "registration_type": "JOINT_WROS", "custodian": "LPL"},
        {"household_id": households[1].id, "account_number": "555-666-888", "registration_type": "IRA_SEP", "custodian": "FIDELITY"},
        # Wong
        {"household_id": households[2].id, "account_number": "888-999-000", "registration_type": "INDIVIDUAL", "custodian": "LPL"},
        {"household_id": households[2].id, "account_number": "888-999-111", "registration_type": "TRUST", "custodian": "LPL"},
    ]
    
    for a_data in accounts_data:
        a = Account(**a_data)
        db.add(a)

    # 4. Create Workflows and Tasks
    # Workflow for Smith (Onboarding)
    wf_smith = Workflow(household_id=households[0].id, advisor_id=advisor.id, type="ONBOARDING", status="IN_PROGRESS")
    db.add(wf_smith)
    db.commit()
    db.refresh(wf_smith)

    tasks_smith = [
        {"workflow_id": wf_smith.id, "description": "Gather KYC Documents", "status": "COMPLETED", "due_date": datetime.now() - timedelta(days=2)},
        {"workflow_id": wf_smith.id, "description": "Open Accounts", "status": "PENDING", "due_date": datetime.now() + timedelta(days=1)},
        {"workflow_id": wf_smith.id, "description": "Initiate ACAT Transfer", "status": "PENDING", "due_date": datetime.now() + timedelta(days=5)},
        {"workflow_id": wf_smith.id, "description": "Schedule Strategy Meeting", "status": "PENDING", "due_date": datetime.now() + timedelta(days=10)},
    ]
    for t in tasks_smith:
        db.add(Task(**t))

    # Workflow for Jones (ACAT focused)
    wf_jones = Workflow(household_id=households[1].id, advisor_id=advisor.id, type="ACAT_TRANSFER", status="IN_PROGRESS")
    db.add(wf_jones)
    db.commit()
    db.refresh(wf_jones)

    tasks_jones = [
        {"workflow_id": wf_jones.id, "description": "Submit Transfer Forms", "status": "COMPLETED", "due_date": datetime.now() - timedelta(days=5)},
        {"workflow_id": wf_jones.id, "description": "Verify Assets Received", "status": "PENDING", "due_date": datetime.now() + timedelta(days=3)},
    ]
    for t in tasks_jones:
        db.add(Task(**t))
        
    # Documents
    docs = [
         {"household_id": households[0].id, "name": "Smith_Account_App.pdf", "document_type": "NEW_ACCOUNT", "nigo_status": "CLEAN"},
         {"household_id": households[0].id, "name": "Smith_Transfer_Auth.pdf", "document_type": "ACAT", "nigo_status": "NIGO"}, # Defect!
         {"household_id": households[1].id, "name": "Jones_Transfer.pdf", "document_type": "ACAT", "nigo_status": "CLEAN"},
    ]
    for d in docs:
        db.add(Document(**d))

    db.commit()
    print("Database seeded successfully with Jane Doe, 3 households, 7 accounts, 2 workflows, and 6 tasks.")
    db.close()

if __name__ == "__main__":
    seed_db()
