# 🔌 Complete Integration Guide

Connect your **Frontend** → **OpenClaw/Clawdbot EC2** → **Backend EC2**

```
┌─────────────────┐      WebSocket       ┌─────────────────────────┐      HTTP API      ┌─────────────────┐
│   Frontend      │  ─────────────────►  │   OpenClaw EC2          │  ───────────────►  │   Backend EC2   │
│   (localhost)   │   ws://44.222.228.   │   44.222.228.231        │                    │   54.221.139.68 │
│                 │      231:18789       │   • OpenClaw Gateway    │                    │   • FastAPI     │
│                 │                      │   • Clawdbot API:8080   │                    │   • Database    │
└─────────────────┘                      └─────────────────────────┘                    └─────────────────┘
```

---

## 🌐 Your Live Services

| Service | IP | Port | URL |
|---------|----|------|-----|
| **OpenClaw Gateway** | 44.222.228.231 | 18789 | `ws://44.222.228.231:18789` |
| **Clawdbot API** | 44.222.228.231 | 8080 | `http://44.222.228.231:8080` |
| **Backend API** | 54.221.139.68 | 8000 | `http://54.221.139.68:8000` |

---

## Step 1: Verify All Services Are Running

### Test OpenClaw (from your local machine)
```bash
curl http://44.222.228.231:18789/health
```

### Test Clawdbot API
```bash
curl http://44.222.228.231:8080/health
```

### Test Backend
```bash
curl http://54.221.139.68:8000/health/live
curl http://54.221.139.68:8000/api/transitions
```

---

## Step 2: Frontend Configuration

Your `frontend/.env` should have:

```env
# OpenClaw Gateway (WebSocket for real-time chat)
VITE_OPENCLAW_URL=ws://44.222.228.231:18789

# Clawdbot API (HTTP REST API)
VITE_CLAWDBOT_URL=http://44.222.228.231:8080

# Backend API (direct connection)
VITE_BACKEND_URL=http://54.221.139.68:8000
```

---

## Step 3: Start Frontend

```bash
cd /Users/princekumar/Documents/LPLHackathon-1/frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## Step 4: Test the Connection

Go to **http://localhost:5173/#test**

Click "🚀 Run All Tests" to verify:
- ✅ Backend Health
- ✅ Backend Households API
- ✅ Clawdbot Health
- ✅ Clawdbot Chat
- ✅ OpenClaw WebSocket

---

## How It Works

### 1. User Sends Message
```javascript
// Frontend sends to OpenClaw via WebSocket
const ws = new WebSocket('ws://44.222.228.231:18789');
ws.send(JSON.stringify({
  type: 'message',
  content: 'What is the dashboard status?'
}));
```

### 2. OpenClaw Processes
- Receives message on EC2 (44.222.228.231)
- AI interprets the intent
- Calls backend API if needed

### 3. Backend Response
```javascript
// OpenClaw calls backend
fetch('http://54.221.139.68:8000/api/transitions')
  .then(res => res.json())
  .then(data => {
    // Format response for user
  });
```

### 4. Response to User
```javascript
// OpenClaw sends back via WebSocket
ws.onmessage = (event) => {
  console.log('AI Response:', event.data);
};
```

---

## Architecture Flow

```
User Types Message
       │
       ▼
┌──────────────┐
│   Frontend   │  React + WebSocket
│  localhost   │
└──────┬───────┘
       │ WebSocket
       ▼
┌──────────────────┐
│   OpenClaw EC2   │  44.222.228.231:18789
│   AI Processing  │  Interprets intent
└──────┬───────────┘
       │ HTTP API
       ▼
┌──────────────────┐
│   Backend EC2    │  54.221.139.68:8000
│   FastAPI + DB   │  Returns data
└──────┬───────────┘
       │ JSON
       ▼
┌──────────────────┐
│   OpenClaw EC2   │  Formats response
│   Sends to user  │
└──────┬───────────┘
       │ WebSocket
       ▼
┌──────────────┐
│   Frontend   │  Displays response
│   to User    │
└──────────────┘
```

---

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure backend allows requests from OpenClaw:

On backend EC2, check `backend/main.py` has:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://44.222.228.231",  # OpenClaw EC2
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### WebSocket Connection Fails
- Check OpenClaw is running: `curl http://44.222.228.231:18789/health`
- Check security group allows port 18789
- Make sure using `ws://` not `http://`

### Backend Returns Empty Array
Run the data seeder on backend:
```bash
ssh ubuntu@54.221.139.68
cd ~/LPL
source venv/bin/activate
python seed_sqlite.py
```

---

## Quick Test Commands

```bash
# Test all services
echo "=== Backend ===" && curl -s http://54.221.139.68:8000/health/live
echo -e "\n=== OpenClaw ===" && curl -s http://44.222.228.231:18789/health
echo -e "\n=== Clawdbot ===" && curl -s http://44.222.228.231:8080/health
echo -e "\n=== Chat ===" && curl -s -X POST http://44.222.228.231:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}' | head -c 200
```

---

## Summary

You now have:
- ✅ Frontend at localhost:5173
- ✅ OpenClaw at 44.222.228.231:18789 (WebSocket)
- ✅ Clawdbot API at 44.222.228.231:8080 (HTTP)
- ✅ Backend at 54.221.139.68:8000 (FastAPI + SQLite)

Open http://localhost:5173/#test and click "Run All Tests" to verify everything works!
