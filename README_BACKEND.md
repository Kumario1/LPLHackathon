# Transition OS Backend

This is the backend for the Transition OS hackathon project. It uses FastAPI, SQLAlchemy, and Pydantic. By default, it runs with SQLite, but is designed to switch to PostgreSQL easily.

## Prerequisites

- Python 3.9+
- pip

## Quick Start (Local Development)

### 1. Create and Activate Virtual Environment

```bash
# Create venv
python3 -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
# venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Initialize and Seed Database

Run these scripts to create the SQLite database (`transition_os.db`) and populate it with sample data.

```bash
# Set PYTHONPATH so python can find the backend module
export PYTHONPATH=$PYTHONPATH:.

# Create tables
python3 backend/init_db.py

# Seed sample data (Advisor, Households, Accounts, Tasks, Docs)
python3 backend/seed_db.py
```

### 4. Run the Server

Start the FastAPI development server with hot-reload enabled.

```bash
export PYTHONPATH=$PYTHONPATH:.
uvicorn backend.main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

### 5. Verify It Works

**Health Check:**
```bash
curl http://127.0.0.1:8000/health
# {"status": "ok"}
```

**List Transitions (Households):**
```bash
curl http://127.0.0.1:8000/api/transitions
```

**Get Household Detail (with Tasks & Accounts):**
```bash
curl http://127.0.0.1:8000/api/transitions/1
```

**Complete a Task:**
```bash
curl -X POST http://127.0.0.1:8000/api/tasks/2/complete \
     -H "Content-Type: application/json" \
     -d '{"status": "COMPLETED"}'
```

**Trigger a Webhook (Simulation):**
```bash
curl -X POST http://127.0.0.1:8000/api/webhooks/docusign \
     -H "Content-Type: application/json" \
     -d '{"event": "envelope-completed", "envelopeId": "12345"}'
```

## Project Structure

- `backend/main.py`: Entry point, FastAPI app.
- `backend/models.py`: SQLAlchemy database models (the canonical schema).
- `backend/schemas.py`: Pydantic models for API request/response.
- `backend/routers/`: API route handlers (transitions, tasks, webhooks).
- `backend/config.py`: Configuration (DB URL, etc.).
- `backend/database.py`: Database connection and session management.

## Moving to PostgreSQL

1. Allow `psycopg2-binary` in `requirements.txt`.
2. Set `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/transition_os"
   ```
3. Run `init_db.py` again against the new database.
