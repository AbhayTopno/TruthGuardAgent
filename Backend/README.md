# TruthGuard Agent - Flask Multi-Platform Verification Backend

## Overview
TruthGuard Agent is a comprehensive fact-checking and verification backend service that:
- Serves browser extension and React frontend verification requests
- Ingests messages from WhatsApp Business API and Telegram Bot API webhooks
- Orchestrates verification logic by invoking the Google ADK (Agent Development Kit) agent
- Routes structured results back to web clients or messaging channels
- Provides real-time misinformation detection and news verification

## 🏗️ Architecture

### Components

| Component | Responsibility |
|-----------|----------------|
| **API Endpoints** | Receive verification requests and user context from the extension and frontend |
| **WhatsApp Integration** | Webhook endpoint for inbound WhatsApp messages via the Business API |
| **Telegram Integration** | Webhook endpoint for Telegram bot updates |
| **ADK Agent Client** | Invokes the ADK agent with incoming queries and handles responses |
| **Response Dispatcher** | Normalizes and returns verification results to HTTP clients or messaging agents |

### Project Structure

```
backend/
├── adapters/           # API routes and request handlers
│   └── routes.py      # Flask blueprint with all endpoints
├── app/               # Application initialization
│   ├── init.py       # Flask app factory
│   └── config.py     # Configuration management
├── core/              # Business logic
│   ├── schemas.py    # Pydantic models for validation
│   └── service.py    # Verification service orchestration
├── integrations/      # External service clients
│   ├── adk_client.py        # Google ADK agent client
│   ├── telegram_client.py   # Telegram Bot API client
│   └── whatsapp_client.py   # WhatsApp Business API client
├── wsgi.py           # Application entry point
├── requirements.txt  # Python dependencies
└── .env             # Environment variables (not in repo)
```

### Data Flow
1. Client (extension, frontend, WhatsApp, Telegram) submits a fact-check query
2. Flask endpoint validates input and forwards the request to the ADK agent client
3. ADK agent processes the query and returns verification metadata and verdict
4. Response dispatcher formats the result and delivers it back to the originating channel
5. Logging and error handlers record transaction outcomes for observability

## 📡 API Endpoints

### 1. Verification Endpoint (Frontend/Extension)
**POST** `/verify_for_frontend_extension_app`

Accept JSON payloads and return verification results for browser extensions and React frontends.

**Request:**
```json
{
  "text": "News article or claim to verify",
  "links": ["https://example.com/article"],
  "user": {"id": "user123"},
  "channel": "extension"
}
```

**Response:**
```json
{
  "status": "ok",
  "formatted_response": "Verification result with sources...",
  "result": {
    "status": "ok",
    "verdict": "verified",
    "confidence": 0.85,
    "evidence": [
      {"title": "Source Title", "snippet": "Excerpt...", "url": "https://..."}
    ]
  }
}
```

### 2. WhatsApp Webhook
**GET** `/whatsapp` - Webhook verification
**POST** `/whatsapp` - Handle incoming WhatsApp messages

Processes WhatsApp Business API webhooks and sends verification results back to users.

### 3. Telegram Webhook
**POST** `/telegram/<token>` - Handle Telegram bot updates

Processes Telegram messages and sends verification results back through the Telegram Bot API.

### 4. Health Check
**GET** `/verify` - Simple health check endpoint

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Virtual environment tool (recommended)
- Active internet connection for ADK agent communication

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd TruthGuardAgent/backend
```

2. **Create a virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file in the `backend/` directory:

```env
# GCP Vertex AI Configuration
REASONING_ENGINE_URL=https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/reasoningEngines/YOUR_ENGINE_ID:streamQuery?alt=sse
GCP_ACCESS_TOKEN=  # Auto-generated, leave empty

# Legacy ADK Agent Configuration (if using old client)
ADK_BASE=https://truthguardagent.onrender.com
ADK_APP_NAME=news_info_verification_v2
ADK_TIMEOUT_SEC=300

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# WhatsApp Business API Configuration
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Flask Secret Key
SECRET_KEY=your_secret_key_here
```

5. **Set up GCP Service Account** (Required for GCP deployment)

Download your GCP service account JSON key and save it as `service-account.json` in the `backend/` directory:

```bash
# The service account needs these permissions:
# - Vertex AI User
# - Service Account Token Creator
```

### Running Locally

#### Option 1: Using Waitress (Production-ready server - Recommended)
```bash
python wsgi.py
```
The application will start on `http://0.0.0.0:8080`

**Features:**
- ✅ Auto-refreshes GCP token on startup
- ✅ Refreshes token every 40 minutes automatically
- ✅ Production-ready WSGI server
- ✅ Multi-threaded request handling

#### Option 2: Using Flask Development Server
```bash
# Windows
set FLASK_APP=app.init:create_app
set FLASK_ENV=development
flask run --host=0.0.0.0 --port=8080

# Linux/Mac
export FLASK_APP=app.init:create_app
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=8080
```

**Note:** Development server also includes GCP token auto-refresh.

### Testing the API

**Test verification endpoint:**
```bash
curl -X POST http://localhost:8080/verify_for_frontend_extension_app \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Breaking news: Major scientific discovery announced",
    "links": [],
    "user": {"id": "test-user"},
    "channel": "extension"
  }'
```

## ☁️ Deployment to Google Cloud VM (Compute Engine)

### Prerequisites
- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Project created in Google Cloud Console
- Domain name pointed to your VM (for SSL)
- GCP Service Account with Vertex AI permissions

### Complete Step-by-Step Deployment Guide

---

#### Step 1: Install Google Cloud SDK (Local Machine)

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run the installer
3. Open a new PowerShell window
4. Authenticate: `gcloud auth login`

**Linux/Mac:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
gcloud auth login
```

---

#### Step 2: Set Up GCP Project and Service Account

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create a service account for the backend
gcloud iam service-accounts create truthguard-backend \
    --display-name="TruthGuard Backend Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:truthguard-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:truthguard-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountTokenCreator"

# Create and download service account key
gcloud iam service-accounts keys create service-account.json \
    --iam-account=truthguard-backend@${PROJECT_ID}.iam.gserviceaccount.com

# This creates service-account.json in your current directory
```

---

#### Step 3: Create Compute Engine VM Instance

```bash
# Create a VM instance with optimal settings
gcloud compute instances create truthguard-backend \
  --project=$PROJECT_ID \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --network-interface=network-tier=PREMIUM,subnet=default \
  --maintenance-policy=MIGRATE \
  --provisioning-model=STANDARD \
  --service-account=truthguard-backend@${PROJECT_ID}.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --tags=http-server,https-server \
  --create-disk=auto-delete=yes,boot=yes,device-name=truthguard-backend,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20231030,mode=rw,size=20,type=pd-balanced \
  --no-shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --labels=app=truthguard,env=production \
  --reservation-affinity=any

# Create firewall rules
gcloud compute firewall-rules create allow-http-https \
  --project=$PROJECT_ID \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80,tcp:443,tcp:8080 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server,https-server

# Get the external IP
gcloud compute instances describe truthguard-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Save the external IP** - you'll need it for DNS and Nginx configuration.

---

#### Step 4: Configure DNS (Before SSL Setup)

Point your domain to the VM's external IP:

1. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Add an A record:
   - **Name/Host:** `@` (or your subdomain like `api`)
   - **Type:** `A`
   - **Value:** `YOUR_VM_EXTERNAL_IP`
   - **TTL:** 300 (5 minutes)

3. Wait 5-10 minutes for DNS propagation
4. Verify: `nslookup yourdomain.com`

---

#### Step 5: Connect to Your VM and Initial Setup

```bash
# SSH into your VM
gcloud compute ssh truthguard-backend --zone=us-central1-a

# Once connected, update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv git nginx certbot python3-certbot-nginx ufw htop

# Configure firewall
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8080/tcp    # App (optional, for testing)
sudo ufw --force enable
sudo ufw status
```

---

#### Step 6: Clone Repository and Set Up Application

```bash
# Clone your repository
cd ~
git clone https://github.com/YOUR_USERNAME/TruthGuardAgent.git
cd TruthGuardAgent/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Upload service-account.json from your local machine
# On your LOCAL machine, run:
# gcloud compute scp service-account.json truthguard-backend:~/TruthGuardAgent/backend/ --zone=us-central1-a

# Create .env file
nano .env
```

**Paste this into `.env`:**
```env
# GCP Vertex AI Configuration
REASONING_ENGINE_URL=https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/reasoningEngines/YOUR_ENGINE_ID:streamQuery?alt=sse
GCP_ACCESS_TOKEN=  # Auto-generated

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_actual_bot_token

# WhatsApp Business API Configuration
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id

# Flask Secret Key (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_generated_secret_key
```

Save and exit: `Ctrl+X`, `Y`, `Enter`

```bash
# Set proper permissions
chmod 600 .env
chmod 600 service-account.json

# Test the application
python wsgi.py
# Press Ctrl+C after confirming it starts without errors
```

---

#### Step 7: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/truthguard.service
```

**Paste this configuration** (replace `YOUR_USERNAME` with your actual username from `whoami`):

```ini
[Unit]
Description=TruthGuard Agent Backend - AI-Powered Fact Checking Service
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=YOUR_USERNAME
Group=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/TruthGuardAgent/backend
Environment="PATH=/home/YOUR_USERNAME/TruthGuardAgent/backend/venv/bin"
Environment="PYTHONUNBUFFERED=1"

# Main process
ExecStart=/home/YOUR_USERNAME/TruthGuardAgent/backend/venv/bin/python wsgi.py

# Restart configuration
Restart=always
RestartSec=10
StartLimitInterval=200
StartLimitBurst=5

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=truthguard

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Save and exit, then:

```bash
# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable truthguard
sudo systemctl start truthguard

# Check status
sudo systemctl status truthguard

# View logs
sudo journalctl -u truthguard -f
```

**Expected logs:**
```
[TOKEN SCHEDULER] Starting with 2400s refresh interval
[TOKEN REFRESHED ✅] 2025-11-02 15:30:00 - Expires: 2025-11-02 16:30:00
[TOKEN SCHEDULER] Background thread started
Serving on http://0.0.0.0:8080
```

---

#### Step 8: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/truthguard
```

**Paste this configuration** (replace `yourdomain.com` with your actual domain):

```nginx
# Upstream backend
upstream truthguard_backend {
    server 127.0.0.1:8080;
    keepalive 64;
}

# HTTP server - redirects to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all HTTP to HTTPS (will be added after SSL setup)
    # location / {
    #     return 301 https://$server_name$request_uri;
    # }

    # Temporary location for initial setup
    location / {
        proxy_pass http://truthguard_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/truthguard /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Test HTTP access:**
```bash
curl http://yourdomain.com/verify
# Should return: {"message":"Verification endpoint","status":"ok"}
```

---

#### Step 9: Set Up SSL/HTTPS with Let's Encrypt

```bash
# Install Certbot (if not already installed)
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to redirect HTTP to HTTPS (select option 2: Redirect)
```

**Certbot automatically:**
- ✅ Obtains SSL certificate
- ✅ Configures Nginx with SSL
- ✅ Sets up auto-renewal (runs twice daily)
- ✅ Redirects HTTP to HTTPS

**Verify auto-renewal:**
```bash
sudo certbot renew --dry-run
```

**Updated Nginx config after SSL** (Certbot modifies this automatically):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to backend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

---

#### Step 10: Verify Deployment

```bash
# 1. Test HTTPS endpoint
curl https://yourdomain.com/verify

# Expected response:
# {"message":"Verification endpoint","status":"ok"}

# 2. Test SSL certificate
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# 3. Check service status
sudo systemctl status truthguard
sudo systemctl status nginx

# 4. View real-time logs
sudo journalctl -u truthguard -f

# 5. Test full verification endpoint
curl -X POST https://yourdomain.com/verify_for_frontend_extension_app \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Is climate change real?",
    "links": [],
    "user": {"id": "test-user"},
    "channel": "extension"
  }'
```

---

### Managing the Deployment

#### Service Management

```bash
# View live logs
sudo journalctl -u truthguard -f --lines=100

# Restart service
sudo systemctl restart truthguard

# Stop service
sudo systemctl stop truthguard

# Start service
sudo systemctl start truthguard

# Check service status
sudo systemctl status truthguard

# View error logs only
sudo journalctl -u truthguard -p err -f
```

#### Update Application

```bash
# SSH into VM
gcloud compute ssh truthguard-backend --zone=us-central1-a
### Environment Variables

| Variable | Description | Required | Notes |
|----------|-------------|----------|-------|
| `REASONING_ENGINE_URL` | GCP Vertex AI Reasoning Engine endpoint | Yes | Full URL with project ID and engine ID |
| `GCP_ACCESS_TOKEN` | GCP access token (auto-generated) | No | Auto-refreshed every 40 mins |
| `ADK_BASE` | Legacy ADK agent base URL | No | Only if using old ADK client |
| `ADK_APP_NAME` | ADK application name | No | Default: news_info_verification_v2 |
| `ADK_TIMEOUT_SEC` | Timeout for ADK requests (seconds) | No | Default: 300 |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather | For Telegram | Get from https://t.me/botfather |
| `WHATSAPP_TOKEN` | WhatsApp API token | For WhatsApp | Meta Business Suite |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | For WhatsApp | Your custom verification string |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token | For WhatsApp | Meta Developer Console |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | For WhatsApp | From WhatsApp Business API |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business account ID | For WhatsApp | From Meta Business Suite |
| `SECRET_KEY` | Flask secret key for sessions | Yes | Generate with: `python -c "import secrets; print(secrets.token_hex(32))"` |
sudo systemctl restart truthguard

# Check logs
sudo journalctl -u truthguard -f --lines=50
```

#### Monitor System Resources

```bash
# Real-time system monitor
htop

# Disk usage
df -h
du -sh ~/TruthGuardAgent/

# Memory usage
free -h

# Network connections
sudo netstat -tulpn | grep python

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Management

```bash
# Check certificate expiry
sudo certbot certificates

# Manual renewal (normally automatic)
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run

# View renewal cron job
sudo systemctl list-timers | grep certbot
```

---

### Setting Up Webhooks

After successful deployment with SSL, configure your messaging platform webhooks:

#### Telegram Webhook Setup

```bash
# Set webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/telegram/<YOUR_BOT_TOKEN>"}'

# Verify webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# Delete webhook (if needed)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

#### WhatsApp Webhook Setup

1. Go to Meta Developer Console: https://developers.facebook.com/
2. Select your app → WhatsApp → Configuration
3. Set Webhook URL: `https://yourdomain.com/whatsapp`
4. Set Verify Token: `your_WHATSAPP_VERIFY_TOKEN` (from .env)
5. Subscribe to webhook fields:
   - `messages`
   - `message_status`
6. Click "Verify and Save"

**Test WhatsApp webhook:**
```bash
# The verification happens automatically when you click "Verify and Save"
# Check logs to confirm:
sudo journalctl -u truthguard -f | grep whatsapp
```

---

### Backup and Recovery

#### Backup Configuration

```bash
# Backup .env and service-account.json
cd ~/TruthGuardAgent/backend
tar -czf ~/truthguard-backup-$(date +%Y%m%d).tar.gz .env service-account.json

# Download backup to local machine (run from LOCAL machine)
gcloud compute scp truthguard-backend:~/truthguard-backup-*.tar.gz ./ --zone=us-central1-a
```

#### Create VM Snapshot

```bash
# Create disk snapshot (run from local machine)
gcloud compute disks snapshot truthguard-backend \
  --snapshot-names=truthguard-snapshot-$(date +%Y%m%d) \
  --zone=us-central1-a \
  --description="TruthGuard backend snapshot"

# List snapshots
gcloud compute snapshots list --filter="name:truthguard-snapshot*"
```

---

### Troubleshooting Guide

#### Service Won't Start

```bash
# Check detailed error logs
sudo journalctl -u truthguard -n 100 --no-pager

# Check if port 8080 is already in use
sudo lsof -i :8080

# Check Python errors
cd ~/TruthGuardAgent/backend
source venv/bin/activate
python wsgi.py  # Run manually to see errors
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Check Nginx SSL configuration
sudo nginx -t

# Renew certificate manually
sudo certbot renew --force-renewal

# Check Let's Encrypt logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

#### Token Refresh Not Working

```bash
# Check if service-account.json exists
ls -la ~/TruthGuardAgent/backend/service-account.json

# Check token refresh logs
sudo journalctl -u truthguard -f | grep TOKEN

# Manually test token refresh
cd ~/TruthGuardAgent/backend
source venv/bin/activate
python refresh_token.py
```

#### High Memory/CPU Usage

```bash
# Check resource usage
htop

# Check Python process
ps aux | grep python

# Restart service to free memory
sudo systemctl restart truthguard

# Check disk space
df -h

# Clean up old logs
sudo journalctl --vacuum-time=7d
```

#### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if Nginx is running
sudo systemctl status nginx
```

---

### Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo systemctl restart truthguard
   ```

2. **Monitor failed login attempts:**
   ```bash
   sudo journalctl _SYSTEMD_UNIT=ssh.service | grep "Failed password"
   ```

3. **Set up automatic security updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure unattended-upgrades
   ```

4. **Regular backups:** Schedule weekly snapshots via GCP Console

5. **Monitor disk usage:**
   ```bash
   # Add to crontab for daily monitoring
   crontab -e
   # Add: 0 0 * * * df -h | mail -s "Disk Usage Report" your@email.com
   ```

---

### Performance Optimization

1. **Enable Nginx caching** (add to Nginx config):
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
   proxy_cache my_cache;
   ```

2. **Increase worker processes** (in `wsgi.py`):
   ```python
   serve(app, host="0.0.0.0", port=8080, threads=16)  # Increase threads
   ```

3. **Monitor performance:**
   ```bash
   # Install monitoring tools
   sudo apt install -y prometheus-node-exporter
   ```

---

### Cost Optimization

- **Use Preemptible VM** for development (60-91% cheaper):
  ```bash
  gcloud compute instances create truthguard-dev --preemptible ...
  ```

- **Shut down during off-hours:**
  ```bash
  gcloud compute instances stop truthguard-backend --zone=us-central1-a
  gcloud compute instances start truthguard-backend --zone=us-central1-a
  ```

- **Monitor costs:** https://console.cloud.google.com/billing

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADK_BASE` | Base URL for ADK agent service | Yes |
| `ADK_APP_NAME` | ADK application name | Yes |
| `ADK_TIMEOUT_SEC` | Timeout for ADK requests (default: 300) | No |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from BotFather | For Telegram |
| `WHATSAPP_TOKEN` | WhatsApp API token | For WhatsApp |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | For WhatsApp |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token | For WhatsApp |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | For WhatsApp |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business account ID | For WhatsApp |
## 🛠️ Technology Stack

- **Flask 3.1.2** - Web framework
- **Waitress 3.0.2** - Production WSGI server
- **Pydantic 2.12.3** - Data validation
- **Flask-CORS 6.0.1** - Cross-origin resource sharing
- **Requests 2.32.5** - HTTP client for external APIs
- **python-dotenv 1.2.1** - Environment variable management
- **Google Auth 2.35.0** - GCP authentication and token management
- **Nginx** - Reverse proxy and SSL termination
- **Let's Encrypt/Certbot** - Free SSL certificates
- **Systemd** - Service management and auto-restart
- **Requests 2.32.5** - HTTP client for external APIs
- **python-dotenv 1.2.1** - Environment variable management

## 📊 Monitoring and Logging

The application uses Python's built-in logging module. Logs include:
- ADK agent interactions (latency, success/failure)
- Webhook processing (Telegram/WhatsApp)
- Error tracking and debugging information

**View logs in production:**
```bash
sudo journalctl -u truthguard -f --lines=100
```

## 🔒 Security Considerations

- All environment variables should be kept secure and never committed to version control
- HTTPS is required for WhatsApp and Telegram webhooks
- Telegram webhook validates bot token to prevent unauthorized access
- WhatsApp webhook verifies tokens during subscription
- Consider implementing rate limiting for production deployments
- Use strong `SECRET_KEY` for Flask session security

## 🐛 Troubleshooting

### Common Issues

**Issue: ADK timeout errors**
- Increase `ADK_TIMEOUT_SEC` in `.env`
- Check ADK agent service availability
- Verify network connectivity

**Issue: Telegram/WhatsApp not receiving messages**
- Verify webhook URL is publicly accessible
- Check firewall rules allow incoming HTTPS traffic
- Validate tokens in `.env` file
- Check logs for specific error messages

**Issue: Application won't start**
- Verify all required environment variables are set
- Check Python version compatibility (3.8+)
- Ensure all dependencies are installed
- Review logs for specific errors

## 📚 Additional Resources

- [Integrating Telegram bot with Flask](https://www.reddit.com/r/flask/comments/1lykzqo/integrating_telegram_bot_with_flask/)
- [WhatsApp Business API and Flask](https://www.pragnakalp.com/automate-messages-using-whatsapp-business-api-flask-part-1/)
- [Building a Telegram Chatbot](https://github.com/AliAbdelaal/telegram-bot-tutorial)
- [Google Cloud Compute Engine Documentation](https://cloud.google.com/compute/docs)
- [Flask Production Deployment](https://flask.palletsprojects.com/en/3.0.x/deploying/)

## 📄 License

[Your License Here]

## 👥 Contributing

[Your Contributing Guidelines Here]

## 📞 Support

For issues and questions, please [create an issue](your-repo-url/issues) in the GitHub repository.
