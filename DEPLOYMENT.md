# Deployment Guide for AWS

Here are two ways to deploy your backend to AWS.

## Option 1: AWS App Runner (Recommended for ease)
App Runner automatically builds and deploys your web application from your GitHub repo. It handles SSL (HTTPS), load balancing, and scaling for you.

1. **Push your code to GitHub**
   Ensure this project is in a GitHub repository.

2. **Go to AWS App Runner Console**
   - Search for "App Runner" in the AWS Console.
   - Click **Create service**.

3. **Configure Source**
   - **Repository type**: Source code repository.
   - **Provider**: GitHub (Connect your account if needed).
   - **Repository**: Select your repo.
   - **Branch**: `main` (or your working branch).
   - **Source directory**: `/` (root).
   - **Deployment settings**: Automatic (optional, triggers on push).

4. **Configure Build**
   - **Configuration file**: Select "Configure all settings here".
   - **Runtime**: Python 3.
   - **Build command**: `pip install -r backend/requirements.txt`
   - **Start command**: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
   - **Port**: `8000`

5. **Deploy**
   - Click Next/Create. Wait ~5 minutes.
   - You will get a `https://.......awsapprunner.com` URL.

*Note: In this mode, the SQLite database will reset every time you deploy. For a real app, use AWS RDS (Postgres).*

---

## Option 2: AWS EC2 + RDS (Production Ready)

This is the standard way to host a scalable backend. You will have an EC2 (server) talking to an RDS (database).

### Phase 1: Create the Database (RDS)
1. Go to **RDS** in AWS Console -> **Create database**.
2. **Engine**: PostgreSQL.
3. **Templates**: Free tier (if applicable) or Dev/Test.
4. **Settings**:
   - **DB Instance identifier**: `transition-os-db`
   - **Master username**: `postgres`
   - **Master password**: Create a secure password.
5. **Connectivity**:
   - **Connect to an EC2 compute resource**: Select "Don't connect" (we will do it manually to be safe) or select your EC2 instance if already created.
   - **Public access**: No (For security, keep it private to your VPC).
   - **VPC Security Group**: Create new (e.g. `rds-sec-group`).
6. **Create Database**.
7. Once created, wait for the status to be "Available". Note the **Endpoint** (something like `transition-os-db.cx123...region.rds.amazonaws.com`).

### Phase 2: Create the EC2 Instance
1. Go to **EC2** -> **Launch Instance**.
2. **Name**: `Transition-OS-Server`
3. **OS**: Ubuntu 24.04 LTS (recommended).
4. **Instance Type**: `t3.micro`.
5. **Key Pair**: Select your key or create one.
6. **Security Group**: Create a new one (e.g., `ec2-web-sg`).
   - Allow **SSH** (port 22) from My IP.
   - Allow **Custom TCP** (port 8000) from Anywhere (0.0.0.0/0).
7. Launch instance.

### Phase 3: Connect EC2 to RDS
**Crucial Step:** You must allow the EC2 instance to talk to the RDS database.
1. Go to the **Security Group** of your **RDS** instance.
2. Edit **Inbound rules**.
3. Add Rule:
   - Type: **PostgreSQL** (5432)
   - Source: **Select the Security Group ID of your EC2 instance** (e.g. `sg-0abc123...` / `ec2-web-sg`).
   - *This ensures only your web server can access your database.*

### Phase 4: Setup the Server
1. SSH into your EC2:
   ```bash
   ssh -i "key.pem" ubuntu@<public-ip>
   ```
2. Clone your repo:
   ```bash
   git clone <your-github-repo-url> LPLHackathon-1
   cd LPLHackathon-1
   ```
   *(You may need to set up a GitHub deploy token or SSH key first)*
3. Run the setup script:
   ```bash
   chmod +x ec2-setup.sh
   ./ec2-setup.sh
   ```

### Phase 5: Run the App
1. Edit the service file with your real database credentials:
   ```bash
   nano transition-os.service
   ```
   - Update `DATABASE_URL` line:
     `Environment="DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/postgres"`
   - *(Note: Default DB name in RDS is often 'postgres')*

2. Install and start the service:
   ```bash
   sudo cp transition-os.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable transition-os
   sudo systemctl start transition-os
   ```
3. Check status:
   ```bash
   sudo systemctl status transition-os
   ```

Your app is now running in the background and connected to AWS RDS!


---

## Option 3: Docker (Most robust)
Since I created a `Dockerfile` for you, you can run this anywhere that supports Docker (App Runner, ECS, DigitalOcean, etc.).

1. **Build**: `docker build -t my-backend .`

---

## Environment Variables
If you need to change settings (like connecting to a real Postgres database), you can set Environment Variables in your deployment platform.

**Common Variables:**
- `DATABASE_URL`: `postgresql://user:pass@host:5432/dbname` (If using RDS)
- `PROJECT_NAME`: Custom name for your API.

### How to set them:
- **App Runner**: In "Configuration" -> "Service settings" -> "Environment variables".
- **EC2**: Add them to your shell profile or pass them before the command:
  ```bash
  export DATABASE_URL="postgresql://..."
  nohup uvicorn ...
  ```

