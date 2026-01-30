# Transition OS - LPL Hackathon Backend

Transition OS is an intelligent "System of Record" designed to streamline the complex process of advisor transitions. It serves as the backbone for the LPL Hackathon project, powering both the ops dashboard and **Clawdbot**, an AI agent that assists advisors and operations staff.

## Project Overview

In the high-stakes world of financial advisor recruitment, transitioning a practice (households, accounts, assets) is a chaotic process involving thousands of documents and tasks. Transition OS solves this by providing:

1.  **Canonical Data Model**: A single source of truth for Advisors, Households, Accounts, Workflows, Tasks, and Documents.
2.  **Workflow Engine**: Tracks the state of every transition (e.g., "In Progress", "At Risk", "Completed").
3.  **Automated Audit Trails**: Every action—whether by a human or an AI agent—is logged immutably.
4.  **Webhook Ingestion**: Simulates real-world integrations (e.g., DocuSign, ACAT feeds) to trigger automated workflows.
5.  **AI-Ready APIs**: Designed specifically for consumption by LLM agents (Clawdbot) to answer questions like "Which households are at risk?" or "fix the NIGO issue on the Smith account."

## Tech Stack

*   **Framework**: FastAPI (Python 3.9+)
*   **Database**: SQLAlchemy ORM with SQLite (Local) / PostgreSQL (Production-ready)
*   **Validation**: Pydantic v2
*   **Architecture**: Modular Router/Controller pattern

## Quick Start (Local Development)

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate
# Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Initialize & Seed Database

We include a seed script that populates the database with realistic demo data, including "Jane Doe" (Advisor), 3 Households, various Accounts, and simulated Document defects.

```bash
# Set PYTHONPATH
export PYTHONPATH=$PYTHONPATH:.

# Create tables
python3 backend/init_db.py

# Seed data
python3 backend/seed_db.py
```

### 3. Run the Server

```bash
export PYTHONPATH=$PYTHONPATH:.
uvicorn backend.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

## API Usage Examples

**Values to try**:
*   **Advisor ID**: `1` (Jane Doe)
*   **Household IDs**: `1` (Smith - In Progress), `2` (Acme - At Risk), `3` (Garcia - Completed)

### 1. Dashboard View
Get a summary of all transitions, including risk scores and open task counts.
```bash
# Filter by status and advisor
curl "http://127.0.0.1:8000/api/transitions?advisor_id=1&status=IN_PROGRESS"
```

### 2. Household Deep Dive
Get details for a specific household, including accounts, tasks, and progress metrics.
```bash
curl http://127.0.0.1:8000/api/transitions/1
```

### 3. Complete a Task
Mark a task as completed. This logs an audit event in the background.
```bash
curl -X POST http://127.0.0.1:8000/api/tasks/2/complete \
     -H "Content-Type: application/json" \
     -d '{"status": "COMPLETED", "note": "Resolved via Dashboard"}'
```

### 4. Simulate Webhooks
Trigger external events to see how the system reacts (e.g., creating new tasks on rejection).

```bash
# Simulate an ACAT Transfer Rejection (Creates a new Ops task)
curl -X POST http://127.0.0.1:8000/api/webhooks/transfer \
     -H "Content-Type: application/json" \
     -d '{"event_type": "ACAT_REJECTED", "account_id": 2, "reason": "Name mismatch"}'

# Simulate a Document Upload
curl -X POST http://127.0.0.1:8000/api/webhooks/portal \
     -H "Content-Type: application/json" \
     -d '{"event_type": "DOCUMENT_UPLOADED", "household_id": 1, "filename": "Correct_ID.pdf"}'
```

## Health Checks

The backend provides production-ready health probes:

- **Liveness**: `GET /health/live` (Returns 200 OK)
- **Readiness**: `GET /health/ready` (Returns 200 if Orchestrator is loaded)

---

## 🛠 For Integrators (AI/Skills/Frontend)

The backend is "Skill-Ready". We have defined strict interfaces for all intelligent capabilities.

### 1. Architecture
*   **Orchestrator** (`backend/orchestrator.py`): The central interaction point for skills.
*   **Interfaces** (`backend/skills/interfaces.py`): Typed definition of what skills must do.
*   **Stubs**: Currently, all skills use "Stub" implementations that return placeholder data.

### 2. How to Add a Skill
1.  Navigate to `backend/skills/interfaces.py`.
2.  Implement a new class inheriting from the abstract base class (e.g., `RealDocumentIntelligence(DocumentIntelligence)`).
3.  Inject your implementation in `backend/orchestrator.py` by replacing the stub.

### 3. Testing
Run the test suite to ensure the shell is intact:
```bash
pytest backend/tests
```
