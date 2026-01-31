#!/usr/bin/env bash
set -euo pipefail

echo "🤖 Setting up Clawdbot/OpenClaw dependencies..."

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python3 not found. Please install python3 first."
  exit 1
fi

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "✅ Dependencies installed."
