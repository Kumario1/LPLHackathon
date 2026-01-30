from backend.database import engine, Base
from backend.models import Advisor, Household, Account, Workflow, Task, Document, AuditEvent

def init_db():
    print("Initializing database...")
    # Base.metadata.drop_all(bind=engine) # Optional: comment in if you want to wipe clean every time init is run
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
