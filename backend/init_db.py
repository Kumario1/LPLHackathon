from backend.database import engine, Base
from backend.models import Advisor, Household, Account, Workflow, Task, Document, AuditEvent

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
