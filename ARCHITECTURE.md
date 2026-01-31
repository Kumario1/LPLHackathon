# Transition OS - System Architecture

> Complete 3-tier architecture for Frontend, AI Agent (OpenClaw), and Backend services.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────┐                                 │
│   │   Frontend   │         │   Frontend   │                                 │
│   │  (Ops Team)  │         │  (Advisor)   │                                 │
│   │   React App  │         │   Portal     │                                 │
│   └──────┬───────┘         └──────┬───────┘                                 │
│          │                        │                                         │
│          │ HTTPS                  │ HTTPS                                   │
│          ▼                        ▼                                         │
│   ┌──────────────────────────────────────────────────┐                     │
│   │              AWS Application Load Balancer        │                     │
│   │              (Port 443 HTTPS)                     │                     │
│   └──────────────────────┬───────────────────────────┘                     │
│                          │                                                  │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      OpenClaw (AI Agent)                            │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│   │  │   NLP/LLM    │  │   Skill      │  │  Transition  │               │  │
│   │  │   Handler    │──│   Router     │──│   Client     │               │  │
│   │  │  (Claude/    │  │              │  │              │               │  │
│   │  │   GPT-4)     │  │              │  │              │               │  │
│   │  └──────────────┘  └──────────────┘  └──────┬───────┘               │  │
│   │                                              │                      │  │
│   │  EC2 #2: openclaw.mydomain.com               │ HTTP                 │  │
│   │  (t3.medium or larger for LLM)               ▼                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                                  │
│                          │ HTTP API Calls                                   │
│                          │ GET /api/transitions                             │
│                          │ POST /api/tasks/{id}/complete                    │
│                          │ POST /api/skills/nigo/analyze                    │
│                          ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Transition OS Backend                            │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│   │  │   FastAPI    │  │  Skills      │  │  Webhook     │               │  │
│   │  │   Routers    │──│  Framework   │──│  Handlers    │               │  │
│   │  │              │  │              │  │              │               │  │
│   │  │ - /api/      │  │ - NIGO       │  │ - ACAT       │               │  │
│   │  │   transitions│  │ - ETA/Risk   │  │ - DocuSign   │               │  │
│   │  │ - /api/tasks │  │ - Meeting    │  │ - Portal     │               │  │
│   │  │ - /api/skills│  │   Pack       │  │              │               │  │
│   │  │ - /api/      │  │ - Copilot    │  │              │               │  │
│   │  │   webhooks   │  │              │  │              │               │  │
│   │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│   │                                                                     │  │
│   │  EC2 #1: 54.221.139.68:8000                                       │  │
│   │  (t3.micro)                                                        │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                                  │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │              AWS RDS PostgreSQL                                     │  │
│   │                                                                     │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│   │  │ Advisors │ │Households│ │  Tasks   │ │ Documents│               │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │  │
│   │                                                                     │  │
│   │  transition-os-db.csxq4yaemku3.us-east-1.rds.amazonaws.com         │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Examples

### 1. Frontend → Backend (Direct API Call)

```
┌──────────┐      HTTPS       ┌─────────────────────┐      SQL       ┌──────────┐
│ Frontend │ ────────────────▶│  Transition OS      │ ─────────────▶ │   RDS    │
│  (React) │ GET /api/        │  Backend            │ SELECT * FROM  │ PostgreSQL│
│          │ transitions      │  (EC2 #1)           │ transitions    │          │
└──────────┘                  └─────────────────────┘                └──────────┘
```

**Example Request:**
```bash
curl https://api.transition-os.com/api/transitions?advisor_id=1
```

---

### 2. User Chat → OpenClaw → Backend

```
User: "What's left for the Smith household?"
    │
    ▼
┌─────────────────┐
│   OpenClaw      │
│   (AI Agent)    │
│                 │
│ 1. NLP Parser:  │ ──▶ "Smith household" → household_id=1
│    "Smith"      │
│                 │
│ 2. Intent:      │ ──▶ "get_status"
│    "get_status" │
│                 │
│ 3. Call Backend │ ──▶ GET http://54.221.139.68:8000/api/transitions/1
│                 │
│ 4. Format Resp  │ ◀──▶ {household, tasks, documents, risk_score}
│                 │
│ 5. Reply User   │ ──▶ "Smith household has 2 pending tasks: 
└─────────────────┘        1. Upload ID (NIGO)
                           2. Sign ACAT form"
```

---

### 3. External Webhook → Backend → OpenClaw

```
┌──────────┐     POST      ┌─────────────────────┐     HTTP      ┌─────────────────┐
│ DocuSign │ ─────────────▶│  Transition OS      │ ────────────▶ │   OpenClaw      │
│ Webhook  │ event:        │  Backend            │  Notify: New  │   (Optional)    │
│          │ signed        │                     │  task created │                 │
└──────────┘               └─────────────────────┘               └─────────────────┘
                                   │                                      │
                                   ▼                                      ▼
                            ┌──────────┐                          ┌──────────────┐
                            │   RDS    │                          │ Draft email  │
                            │ Create   │                          │ to advisor   │
                            │ Task     │                          └──────────────┘
                            └──────────┘
```

---

## AWS Security Groups

### OpenClaw EC2 Security Group (`openclaw-sg`)

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | My IP | Admin access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | LLM API calls (OpenAI/Anthropic) |
| HTTP | TCP | 8000 | `backend-sg` | Call backend (internal) |

**Outbound:** All traffic (default)

---

### Backend EC2 Security Group (`backend-sg` / `ec2-web-sg`)

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | My IP | Admin access |
| HTTP | TCP | 8000 | `openclaw-sg` | OpenClaw agent |
| HTTP | TCP | 8000 | `alb-sg` | Load balancer |
| HTTP | TCP | 8000 | My IP | Direct access (dev) |

**Outbound:** All traffic

---

### RDS Security Group (`rds-sg`)

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| PostgreSQL | TCP | 5432 | `backend-sg` | Only backend can access |

**Note:** Never expose RDS to 0.0.0.0/0

---

### Application Load Balancer Security Group (`alb-sg`)

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTPS | TCP | 443 | 0.0.0.0/0 | Public API access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Redirect to HTTPS |

---

## API Endpoints Reference

### Base URL
```
Development: http://54.221.139.68:8000/api
Production:  https://api.transition-os.com/api  (future)
```

### Endpoints by Consumer

#### Frontend / Any Client
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/health/live` | GET | Liveness probe |
| `/health/ready` | GET | Readiness probe |
| `/transitions` | GET | List all transitions |
| `/transitions/{id}` | GET | Get household details |
| `/tasks/{id}/complete` | POST | Mark task complete |
| `/webhooks/{source}` | POST | Receive webhooks |

#### OpenClaw AI Agent
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/skills/nigo/analyze` | POST | Analyze document for NIGO issues |
| `/skills/eta/predict` | POST | Predict transition completion time |
| `/skills/meeting-pack` | POST | Generate meeting preparation pack |
| `/skills/copilot/draft` | POST | Draft emails and explanations |

---

## Frontend API Client Example

### JavaScript/React

```javascript
// src/api/transitionClient.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://54.221.139.68:8000/api';

class TransitionAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Health check
  async health() {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
    return response.json();
  }

  // Get all transitions
  async getTransitions(advisorId = null, status = null) {
    const params = new URLSearchParams();
    if (advisorId) params.append('advisor_id', advisorId);
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.baseURL}/transitions?${params}`);
    return response.json();
  }

  // Get single household
  async getHousehold(householdId) {
    const response = await fetch(`${this.baseURL}/transitions/${householdId}`);
    return response.json();
  }

  // Complete a task
  async completeTask(taskId, note = '') {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', note })
    });
    return response.json();
  }

  // Get meeting pack
  async getMeetingPack(householdId) {
    const response = await fetch(`${this.baseURL}/skills/meeting-pack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ household_id: householdId })
    });
    return response.json();
  }
}

export const transitionAPI = new TransitionAPI();
```

### Usage in React Component

```javascript
import { transitionAPI } from './api/transitionClient';

function Dashboard() {
  const [transitions, setTransitions] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await transitionAPI.getTransitions(1); // Advisor ID 1
      setTransitions(data);
    }
    loadData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    await transitionAPI.completeTask(taskId, 'Completed via dashboard');
    // Refresh data...
  };

  return (
    // Render transitions...
  );
}
```

---

## OpenClaw (AI Agent) Client Example

```python
# openclaw/transition_client.py
import os
import requests
from typing import Dict, List, Optional

BACKEND_URL = os.getenv("BACKEND_URL", "http://54.221.139.68:8000/api")


class TransitionClient:
    """Client for OpenClaw to communicate with Transition OS backend"""
    
    def __init__(self, base_url: str = BACKEND_URL):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_transitions(self, advisor_id: Optional[int] = None, 
                       status: Optional[str] = None) -> List[Dict]:
        """Get all transitions with optional filters"""
        params = {}
        if advisor_id:
            params['advisor_id'] = advisor_id
        if status:
            params['status'] = status
            
        response = self.session.get(f"{self.base_url}/transitions", params=params)
        response.raise_for_status()
        return response.json()
    
    def get_household(self, household_id: int) -> Dict:
        """Get detailed information about a household"""
        response = self.session.get(f"{self.base_url}/transitions/{household_id}")
        response.raise_for_status()
        return response.json()
    
    def complete_task(self, task_id: int, note: str = "") -> Dict:
        """Mark a task as completed"""
        payload = {"status": "COMPLETED", "note": note}
        response = self.session.post(
            f"{self.base_url}/tasks/{task_id}/complete",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def analyze_document_nigo(self, document_id: int) -> Dict:
        """Call NIGO analysis skill"""
        response = self.session.post(
            f"{self.base_url}/skills/nigo/analyze",
            json={"document_id": document_id}
        )
        response.raise_for_status()
        return response.json()
    
    def predict_eta(self, household_id: int) -> Dict:
        """Get ETA prediction for a transition"""
        response = self.session.post(
            f"{self.base_url}/skills/eta/predict",
            json={"household_id": household_id}
        )
        response.raise_for_status()
        return response.json()
    
    def generate_meeting_pack(self, household_id: int) -> Dict:
        """Generate meeting preparation materials"""
        response = self.session.post(
            f"{self.base_url}/skills/meeting-pack",
            json={"household_id": household_id}
        )
        response.raise_for_status()
        return response.json()
    
    def draft_copilot_message(self, context: str, message_type: str = "email") -> Dict:
        """Use GenAI copilot to draft messages"""
        response = self.session.post(
            f"{self.base_url}/skills/copilot/draft",
            json={"context": context, "message_type": message_type}
        )
        response.raise_for_status()
        return response.json()


# Usage in OpenClaw
if __name__ == "__main__":
    client = TransitionClient()
    
    # Example: Get at-risk transitions
    transitions = client.get_transitions(status="AT_RISK")
    print(f"Found {len(transitions)} at-risk transitions")
    
    # Example: Get household details
    household = client.get_household(1)
    print(f"Household: {household['household']['name']}")
```

---

## Deployment Checklist

### Phase 1: Backend (✅ COMPLETE)
- [x] EC2 Instance running (t3.micro)
- [x] RDS PostgreSQL database
- [x] FastAPI application deployed
- [x] Security groups configured
- [x] Systemd service auto-starting

### Phase 2: AI Agent - OpenClaw (🚧 IN PROGRESS)
- [ ] Create OpenClaw EC2 instance (t3.medium)
- [ ] Install Python, dependencies
- [ ] Configure `BACKEND_URL=http://54.221.139.68:8000/api`
- [ ] Set up LLM API keys (OpenAI/Anthropic)
- [ ] Test connection to backend
- [ ] Deploy OpenClaw service

### Phase 3: Frontend (❌ NOT STARTED)
- [ ] Create React/Vue app
- [ ] Configure API client
- [ ] Build dashboard components
- [ ] Deploy to S3/CloudFront or EC2

### Phase 4: Production Hardening (❌ NOT STARTED)
- [ ] Set up Application Load Balancer
- [ ] Configure SSL/HTTPS (Let's Encrypt or ACM)
- [ ] Add JWT authentication
- [ ] Set up CloudWatch monitoring
- [ ] Configure automated RDS backups

---

## Current Infrastructure

| Component | Status | IP/Endpoint | Instance Type |
|-----------|--------|-------------|---------------|
| Backend EC2 | ✅ Running | `54.221.139.68:8000` | t3.micro |
| RDS Database | ✅ Connected | `transition-os-db.csxq4yaemku3.us-east-1.rds.amazonaws.com` | db.t3.micro |
| OpenClaw EC2 | ❌ Not created | TBD | t3.medium (planned) |
| Frontend | ❌ Not built | TBD | S3/CloudFront or EC2 |
| Load Balancer | ❌ Not set up | TBD | AWS ALB |

---

## Quick Commands

### Check Backend Health
```bash
curl http://54.221.139.68:8000/health
```

### SSH to Backend
```bash
ssh -i "your-key.pem" ubuntu@54.221.139.68
```

### View Backend Logs
```bash
sudo journalctl -u transition-os -f
```

### Test API from Anywhere
```bash
# Get transitions
curl "http://54.221.139.68:8000/api/transitions?advisor_id=1"

# Get household details
curl http://54.221.139.68:8000/api/transitions/1

# Health check
curl http://54.221.139.68:8000/health/ready
```

---

## Environment Variables

### OpenClaw EC2
```bash
# Required
BACKEND_URL=http://54.221.139.68:8000/api
OPENAI_API_KEY=sk-...  # or ANTHROPIC_API_KEY

# Optional (for when auth is added)
BACKEND_API_KEY=your-secret-key
```

### Frontend
```bash
REACT_APP_API_URL=http://54.221.139.68:8000/api
# or for production:
# REACT_APP_API_URL=https://api.transition-os.com/api
```

---

**Last Updated**: January 30, 2026
