# OpenClaw Gateway + Clawdbot API

This folder contains a lightweight OpenClaw gateway (WebSocket) and a Clawdbot-compatible HTTP API.
Both services call the Transition OS backend API (no direct DB access).

## Quick start (local)

```bash
# In repo root
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Terminal 1: backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2: OpenClaw WebSocket (18789)
uvicorn openclaw.openclaw_gateway:app --host 0.0.0.0 --port 18789

# Terminal 3: Clawdbot HTTP API (8080)
uvicorn openclaw.clawdbot_server:app --host 0.0.0.0 --port 8080
```

## Environment

Copy `openclaw/.env.example` to `openclaw/.env` and export it before running, e.g.

```bash
set -a
source openclaw/.env
set +a
```
