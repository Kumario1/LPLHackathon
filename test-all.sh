#!/bin/bash
# Test all services

echo "=========================================="
echo "🔍 Testing All Services"
echo "=========================================="

echo -e "\n1️⃣  Testing Backend (54.221.139.68:8000)..."
curl -s http://54.221.139.68:8000/health/live | head -1
echo "   Households API:"
curl -s http://54.221.139.68:8000/api/transitions | head -c 100
echo "..."

echo -e "\n\n2️⃣  Testing OpenClaw (44.222.228.231:18789)..."
curl -s http://44.222.228.231:18789/health | head -1

echo -e "\n\n3️⃣  Testing Clawdbot (44.222.228.231:8080)..."
curl -s http://44.222.228.231:8080/health | head -1

echo -e "\n\n4️⃣  Testing Chat..."
curl -s -X POST http://44.222.228.231:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the dashboard status?"}' | head -c 150
echo "..."

echo -e "\n\n=========================================="
echo "✅ Tests Complete!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Test Page: http://localhost:5173/#test"
