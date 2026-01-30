#!/bin/bash

# EC2 Setup Script for Transition OS
# Run this on your Ubuntu 22.04 or 24.04 EC2 instance.

set -e  # Exit on error

echo ">>> Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo ">>> Installing dependencies (Python, pip, venv, git, nginx)..."
sudo apt install -y python3-pip python3-venv git nginx libpq-dev

echo ">>> Setting up application directory..."
# We assume this script is running from inside the cloned repo, or we create a dir
# For this script, we'll assume standard deployment to /var/www/transition-os or similar
# But often users just run in their home dir. Let's stick to current directory setup or home.

# Create virtual environment
if [ ! -d "venv" ]; then
    echo ">>> Creating virtual environment..."
    python3 -m venv venv
else
    echo ">>> Virtual environment already exists."
fi

echo ">>> Activating venv and installing requirements..."
source venv/bin/activate
pip install -r backend/requirements.txt

echo ">>> Setup complete!"
echo ""
echo "To run the server manually:"
echo "  source venv/bin/activate"
echo "  export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
echo "  uvicorn backend.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "To run as a system service (keep running after exit), see the instructions in DEPLOYMENT.md to set up systemd."
