# Transition OS - LPL Hackathon Backend

Transition OS is an intelligent "System of Record" designed to streamline the complex process of advisor transitions. It serves as the backbone for the LPL Hackathon project, powering both the ops dashboard and **Clawdbot**, an AI agent that assists advisors and operations staff.

**🚀 LIVE DEPLOYMENTS**:
- **Backend API**: `http://54.221.139.68:8000`
- **OpenClaw Gateway**: `ws://44.222.228.231:18789`
- **Clawdbot API**: `http://44.222.228.231:8080`

---

## ⚡️ Quick Start

We use a `Makefile` to simplify common tasks.

1.  **Install Dependencies**:
    ```bash
    make install
    ```

2.  **Run the Backend**:
    ```bash
    make run
    ```
    API will be available at `http://localhost:8000`.

3.  **Run Tests**:
    ```bash
    make test
    ```

---

## 🏗 Project Structure

```
LPL/
├── backend/                  # FastAPI application
│   ├── main.py              # Entry point
│   ├── orchestrator.py      # Skill orchestrator
│   ├── routers/             # API routes
│   └── skills/              # Skill interfaces
├── frontend/                 # React/Vite Frontend
├── skills/                   # Clawdbot Skill Definitions (Markdown)
├── agents.md                # Architecture guide
├── Makefile                 # Automation scripts
└── README.md                # This file
```

---

## 🛠 Development

### Backend
The backend is built with FastAPI.
- **Linting**: `make lint` (uses `ruff` and `mypy`)
- **Formatting**: `make format` (uses `black` and `isort`)

### Frontend
The frontend is a React app using Vite.
- **Start**: `cd frontend && npm run dev`
- **Test**: `cd frontend && npm test`

### Clawdbot Skills
Skills are defined in `skills/` as `SKILL.md` files. These instruct the AI agent on how to use the backend APIs.

---

## 📚 Documentation
- [Backend Documentation](backend/README.md)
- [Skills Documentation](skills/README.md)
- [Deployment Guide](DEPLOYMENT.md)
