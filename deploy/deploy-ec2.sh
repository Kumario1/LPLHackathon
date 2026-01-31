#!/bin/bash
#===============================================================================
# EC2 Deployment Script for Transition OS Frontend
# 
# This script deploys the frontend application to an AWS EC2 instance.
# 
# Prerequisites:
#   1. AWS CLI configured with appropriate credentials
#   2. SSH key file for EC2 instance access
#   3. EC2 instance running with Ubuntu/Amazon Linux
#   4. Security group allowing ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
#
# Usage:
#   ./deploy-ec2.sh --host <EC2_PUBLIC_IP> --key <PATH_TO_PEM_FILE> [--user ubuntu]
#
# Example:
#   ./deploy-ec2.sh --host 54.123.45.67 --key ~/.ssh/my-key.pem --user ubuntu
#===============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
EC2_USER="ubuntu"
EC2_HOST=""
SSH_KEY=""
APP_DIR="/opt/transition-os"
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)/frontend"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --host|-h)
            EC2_HOST="$2"
            shift 2
            ;;
        --key|-k)
            SSH_KEY="$2"
            shift 2
            ;;
        --user|-u)
            EC2_USER="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 --host <EC2_PUBLIC_IP> --key <PATH_TO_PEM_FILE> [--user ubuntu]"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}Error: EC2 host IP is required. Use --host <IP>${NC}"
    exit 1
fi

if [ -z "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key file is required. Use --key <PATH_TO_PEM>${NC}"
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key file not found: $SSH_KEY${NC}"
    exit 1
fi

# SSH command helper
SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST"
SCP_CMD="scp -i $SSH_KEY -o StrictHostKeyChecking=no"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Transition OS - EC2 Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Target Host: ${GREEN}$EC2_HOST${NC}"
echo -e "SSH User:    ${GREEN}$EC2_USER${NC}"
echo -e "SSH Key:     ${GREEN}$SSH_KEY${NC}"
echo ""

#-------------------------------------------------------------------------------
# Step 1: Build the frontend locally
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[1/6] Building frontend locally...${NC}"
cd "$FRONTEND_DIR"

# Install dependencies
npm install

# Create production build
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"

#-------------------------------------------------------------------------------
# Step 2: Test SSH connection
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[2/6] Testing SSH connection...${NC}"
$SSH_CMD "echo 'SSH connection successful'" || {
    echo -e "${RED}Error: Cannot connect to EC2 instance${NC}"
    exit 1
}
echo -e "${GREEN}✓ SSH connection verified${NC}"

#-------------------------------------------------------------------------------
# Step 3: Setup EC2 instance (install dependencies)
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[3/6] Setting up EC2 instance...${NC}"

$SSH_CMD << 'REMOTE_SETUP'
#!/bin/bash
set -e

# Update system packages
sudo apt-get update -y

# Install Node.js (if not present)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Nginx (if not present)
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
fi

# Create app directory
sudo mkdir -p /opt/transition-os
sudo chown -R $USER:$USER /opt/transition-os

echo "EC2 setup complete"
REMOTE_SETUP

echo -e "${GREEN}✓ EC2 instance configured${NC}"

#-------------------------------------------------------------------------------
# Step 4: Upload build artifacts
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[4/6] Uploading build artifacts...${NC}"

# Create tarball of dist folder
cd "$FRONTEND_DIR"
tar -czf /tmp/transition-os-build.tar.gz dist/

# Upload to EC2
$SCP_CMD /tmp/transition-os-build.tar.gz $EC2_USER@$EC2_HOST:/tmp/

# Extract on EC2
$SSH_CMD << 'REMOTE_EXTRACT'
cd /opt/transition-os
rm -rf dist/
tar -xzf /tmp/transition-os-build.tar.gz
rm /tmp/transition-os-build.tar.gz
echo "Files extracted successfully"
REMOTE_EXTRACT

# Cleanup local tarball
rm /tmp/transition-os-build.tar.gz

echo -e "${GREEN}✓ Build artifacts uploaded${NC}"

#-------------------------------------------------------------------------------
# Step 5: Configure Nginx
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[5/6] Configuring Nginx...${NC}"

$SSH_CMD << 'REMOTE_NGINX'
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/transition-os > /dev/null << 'NGINX_CONF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /opt/transition-os/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/transition-os /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

echo "Nginx configured successfully"
REMOTE_NGINX

echo -e "${GREEN}✓ Nginx configured${NC}"

#-------------------------------------------------------------------------------
# Step 6: Verify deployment
#-------------------------------------------------------------------------------
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"

# Wait for Nginx to restart
sleep 2

# Test if the site is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$EC2_HOST/health 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Deployment verified - Site is live!${NC}"
else
    echo -e "${YELLOW}Warning: Health check returned status $HTTP_STATUS${NC}"
    echo "The site may still be accessible. Please check manually."
fi

#-------------------------------------------------------------------------------
# Deployment Complete
#-------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Your application is now live at:"
echo -e "  ${GREEN}http://$EC2_HOST${NC}"
echo ""
echo -e "To set up HTTPS, run:"
echo -e "  sudo certbot --nginx -d your-domain.com"
echo ""
echo -e "To view logs:"
echo -e "  $SSH_CMD 'sudo tail -f /var/log/nginx/access.log'"
echo ""
