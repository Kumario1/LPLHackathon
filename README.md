# Transition OS - LPL Hackathon Backend

Transition OS is an intelligent "System of Record" designed to streamline the complex process of advisor transitions. It serves as the backbone for the LPL Hackathon project, powering both the ops dashboard and **Clawdbot**, an AI agent that assists advisors and operations staff.

**🚀 LIVE DEPLOYMENT**: This backend is currently running on AWS EC2 + RDS PostgreSQL.

---

## Project Overview

In the high-stakes world of financial advisor recruitment, transitioning a practice (households, accounts, assets) is a chaotic process involving thousands of documents and tasks. Transition OS solves this by providing:

1.  **Canonical Data Model**: A single source of truth for Advisors, Households, Accounts, Workflows, Tasks, and Documents.
2.  **Workflow Engine**: Tracks the state of every transition (e.g., "In Progress", "At Risk", "Completed").
3.  **Automated Audit Trails**: Every action—whether by a human or an AI agent—is logged immutably.
4.  **Webhook Ingestion**: Simulates real-world integrations (e.g., DocuSign, ACAT feeds) to trigger automated workflows.
5.  **AI-Ready APIs**: Designed specifically for consumption by LLM agents (Clawdbot) to answer questions like "Which households are at risk?" or "fix the NIGO issue on the Smith account."

---

## Tech Stack

*   **Framework**: FastAPI (Python 3.12)
*   **Database**: PostgreSQL (AWS RDS)
*   **Server**: AWS EC2 (Ubuntu 24.04)
*   **Validation**: Pydantic v2
*   **Architecture**: Modular Router/Controller pattern

---

## 🌐 Production Deployment

The backend is deployed on AWS with the following architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  AWS EC2    │────▶│  AWS RDS    │
│  (Browser)  │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Clawdbot   │
                    │  (AI Agent) │
                    └─────────────┘
```

### Access the Live API

| Endpoint | URL |
|----------|-----|
| Health Check | `http://54.221.139.68:8000/health` |
| API Documentation | `http://54.221.139.68:8000/api/docs` |
| Base API | `http://54.221.139.68:8000/api` |

**Live at**: `54.221.139.68` (AWS EC2)

### Server Management (EC2)

```bash
# SSH into your server
ssh -i "your-key.pem" ubuntu@54.221.139.68

# Check service status
sudo systemctl status transition-os

# View logs
sudo journalctl -u transition-os -f

# Restart the service
sudo systemctl restart transition-os

# Stop the service
sudo systemctl stop transition-os
```

### Database Connection (RDS)

```bash
# Connect to RDS from EC2
psql "postgresql://postgres:YOUR_PASSWORD@transition-os-db.csxq4yaemku3.us-east-1.rds.amazonaws.com:5432/postgres"
```

---

## 💻 Local Development

Want to run the backend locally for development?

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

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# For local SQLite development
DATABASE_URL=sqlite:///./transition_os.db

# Or connect to your RDS instance
# DATABASE_URL=postgresql://postgres:PASSWORD@transition-os-db.csxq4yaemku3.us-east-1.rds.amazonaws.com:5432/postgres
```

### 3. Initialize & Seed Database

```bash
# Set PYTHONPATH
export PYTHONPATH=$PYTHONPATH:.

# Create tables
python3 backend/init_db.py

# Seed demo data
python3 backend/seed_db.py
```

### 4. Run the Server (Local)

```bash
export PYTHONPATH=$PYTHONPATH:.
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

---

## 🔌 API Usage Examples

**Values to try**:
*   **Advisor ID**: `1` (Jane Doe)
*   **Household IDs**: `1` (Smith - In Progress), `2` (Acme - At Risk), `3` (Garcia - Completed)

### 1. Dashboard View
Get a summary of all transitions, including risk scores and open task counts.
```bash
curl "http://54.221.139.68:8000/api/transitions?advisor_id=1&status=IN_PROGRESS"
```

### 2. Household Deep Dive
Get details for a specific household, including accounts, tasks, and progress metrics.
```bash
curl http://54.221.139.68:8000/api/transitions/1
```

### 3. Complete a Task
Mark a task as completed. This logs an audit event in the background.
```bash
curl -X POST http://54.221.139.68:8000/api/tasks/2/complete \
     -H "Content-Type: application/json" \
     -d '{"status": "COMPLETED", "note": "Resolved via Dashboard"}'
```

### 4. Simulate Webhooks
Trigger external events to see how the system reacts (e.g., creating new tasks on rejection).

```bash
# Simulate an ACAT Transfer Rejection (Creates a new Ops task)
curl -X POST http://54.221.139.68:8000/api/webhooks/transfer \
     -H "Content-Type: application/json" \
     -d '{"event_type": "ACAT_REJECTED", "account_id": 2, "reason": "Name mismatch"}'

# Simulate a Document Upload
curl -X POST http://54.221.139.68:8000/api/webhooks/portal \
     -H "Content-Type: application/json" \
     -d '{"event_type": "DOCUMENT_UPLOADED", "household_id": 1, "filename": "Correct_ID.pdf"}'
```

---

## 🏥 Health Checks

The backend provides production-ready health probes:

```bash
# Liveness probe
 curl http://54.221.139.68:8000/health/live

# Readiness probe
curl http://54.221.139.68:8000/health/ready
```

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

---

## 📁 Project Structure

```
LPL/
├── backend/                  # FastAPI application
│   ├── main.py              # Entry point
│   ├── config.py            # Settings & environment
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── orchestrator.py      # Skill orchestrator
│   ├── routers/             # API routes
│   │   ├── transitions.py
│   │   ├── tasks.py
│   │   ├── webhooks.py
│   │   └── skills_api.py
│   ├── skills/              # Skill interfaces
│   │   └── interfaces.py
│   └── tests/               # Test suite
├── agents.md                # Architecture guide
├── DEPLOYMENT.md            # Detailed deployment guide
├── PROGRESS.md              # Project progress tracker
├── ec2-setup.sh             # EC2 provisioning script
├── transition-os.service    # Systemd service config
├── Dockerfile               # Container config
└── README.md                # This file
```

---

## 🚀 Deployment Options

### Current: EC2 + RDS (Production)
- **Status**: ✅ Active
- **URL**: `http://54.221.139.68:8000`
- **Database**: AWS RDS PostgreSQL
- **Docs**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### Alternative: AWS App Runner (Easier)
- Good for quick demos
- Auto-scaling included
- See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions

### Alternative: Docker
```bash
docker build -t transition-os .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... transition-os
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` |
| `PROJECT_NAME` | API title | `Transition OS` |
| `LOG_LEVEL` | Logging level | `INFO`, `DEBUG` |
| `ENVIRONMENT` | Deployment environment | `DEV`, `PROD` |

---

## 🤖 Connecting Clawdbot

To connect your AI agent (Clawdbot) to this backend:

```python
# In Clawdbot config
BACKEND_URL = "http://54.221.139.68:8000/api"
```

See `agents.md` for detailed integration instructions.

---

## 📊 Monitoring & Logs

```bash
# Real-time logs
sudo journalctl -u transition-os -f

# Recent logs (last 100 lines)
sudo journalctl -u transition-os -n 100

# System resources
htop
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to API | Check EC2 security group allows port 8000 |
| Database connection failed | Verify RDS security group allows EC2 |
| Service won't start | Check logs: `sudo journalctl -u transition-os -n 50` |
| Password issues | Verify `DATABASE_URL` in `/etc/systemd/system/transition-os.service` |

---

## 📚 Additional Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed AWS deployment instructions
- [agents.md](agents.md) - AI agent architecture & guidelines
- [PROGRESS.md](PROGRESS.md) - Current project status & roadmap
- [API Docs](http://54.221.139.68:8000/api/docs) - Interactive Swagger UI

---

**Last Updated**: January 30, 2026
