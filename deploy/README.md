# EC2 Deployment Guide

This directory contains scripts to deploy Transition OS to an AWS EC2 instance.

## Prerequisites

1. **AWS Account** with EC2 access
2. **EC2 Instance** running Ubuntu 22.04 LTS (or Amazon Linux 2)
3. **SSH Key Pair** (.pem file) for EC2 access
4. **Security Group** with the following inbound rules:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)

## Quick Start

### 1. Launch EC2 Instance

```bash
# Recommended instance type: t3.small or larger
# AMI: Ubuntu Server 22.04 LTS
# Storage: 20GB minimum
```

### 2. Set Up the Instance

```bash
# SSH into your instance first
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP

# Run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/deploy/setup-ec2-instance.sh | bash
```

Or from your local machine:
```bash
scp -i ~/.ssh/your-key.pem deploy/setup-ec2-instance.sh ubuntu@YOUR_EC2_IP:/tmp/
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP 'bash /tmp/setup-ec2-instance.sh'
```

### 3. Deploy the Application

From your local machine:

```bash
# Make the script executable
chmod +x deploy/deploy-ec2.sh

# Run deployment
./deploy/deploy-ec2.sh \
  --host YOUR_EC2_PUBLIC_IP \
  --key ~/.ssh/your-key.pem \
  --user ubuntu
```

### 4. Access Your Application

Open your browser and navigate to:
```
http://YOUR_EC2_PUBLIC_IP
```

## Scripts

| Script | Description |
|--------|-------------|
| `deploy-ec2.sh` | Main deployment script (run from local machine) |
| `setup-ec2-instance.sh` | Initial EC2 setup (run on EC2 instance) |

## Environment Variables

Create a `.env.production` file in the `frontend/` directory:

```env
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
VITE_API_URL=https://api.yourdomain.com
```

## SSL/HTTPS Setup

After deployment, set up SSL with Let's Encrypt:

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Updating the Application

To deploy updates, simply run the deployment script again:

```bash
./deploy/deploy-ec2.sh --host YOUR_EC2_IP --key ~/.ssh/your-key.pem
```

## Troubleshooting

### Check Nginx status
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP 'sudo systemctl status nginx'
```

### View Nginx logs
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP 'sudo tail -f /var/log/nginx/error.log'
```

### Restart Nginx
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP 'sudo systemctl restart nginx'
```

### Check if app files exist
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP 'ls -la /opt/transition-os/dist/'
```
