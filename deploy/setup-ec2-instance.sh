#!/bin/bash
#===============================================================================
# EC2 Instance Setup Script
# 
# Run this script ON the EC2 instance to prepare it for hosting.
# This handles initial system setup before the main deployment.
#
# Usage (on EC2):
#   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/setup-ec2.sh | bash
#   OR
#   scp setup-ec2-instance.sh ubuntu@EC2_IP:/tmp/ && ssh ubuntu@EC2_IP 'bash /tmp/setup-ec2-instance.sh'
#===============================================================================

set -e

echo "=========================================="
echo "  EC2 Instance Setup for Transition OS"
echo "=========================================="

# Update system
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "[2/5] Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node --version
npm --version

# Install Nginx
echo "[3/5] Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Certbot for SSL (optional)
echo "[4/5] Installing Certbot for SSL certificates..."
sudo apt-get install -y certbot python3-certbot-nginx

# Create application directory
echo "[5/5] Setting up application directory..."
sudo mkdir -p /opt/transition-os
sudo chown -R $USER:$USER /opt/transition-os

# Configure firewall (if ufw is enabled)
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 22/tcp
fi

echo ""
echo "=========================================="
echo "  EC2 Instance Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Run the deploy-ec2.sh script from your local machine"
echo "  2. (Optional) Set up SSL with: sudo certbot --nginx -d your-domain.com"
echo ""
