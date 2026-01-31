#!/bin/bash
# Test all services

echo "=========================================="
echo "🔍 Testing All Services"
echo "=========================================="

BACKEND_URL=${BACKEND_URL:-http://54.221.139.68:8000}
OPENCLAW_URL=${OPENCLAW_URL:-http://44.222.228.231:18789}
CLAWDBOT_URL=${CLAWDBOT_URL:-http://44.222.228.231:8080}

echo -e "\n1️⃣  Testing Backend (${BACKEND_URL})..."
curl -s ${BACKEND_URL}/health/live | head -1
echo "   Households API:"
curl -s ${BACKEND_URL}/api/transitions | head -c 100
echo "..."

echo -e "\n\n2️⃣  Testing OpenClaw (${OPENCLAW_URL})..."
curl -s ${OPENCLAW_URL}/health | head -1

echo -e "\n\n3️⃣  Testing Clawdbot (${CLAWDBOT_URL})..."
curl -s ${CLAWDBOT_URL}/health | head -1

echo -e "\n\n4️⃣  Testing Chat..."
curl -s -X POST ${CLAWDBOT_URL}/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the dashboard status?"}' | head -c 150
echo "..."

echo -e "\n\n=========================================="
echo "✅ Tests Complete!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Test Page: http://localhost:5173/#test"
