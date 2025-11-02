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
# ADK Agent Configuration
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

### Running Locally

#### Option 1: Using Waitress (Production-ready server)
```bash
python wsgi.py
```
The application will start on `http://0.0.0.0:8080`

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
- Google Cloud Platform account
- `gcloud` CLI installed and configured
- Project created in Google Cloud Console

### Step-by-Step Deployment

#### 1. Install Google Cloud SDK (if not already installed)

**Windows:**
Download and install from: https://cloud.google.com/sdk/docs/install

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

#### 2. Create a Compute Engine VM Instance

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Create a VM instance
gcloud compute instances create truthguard-backend \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# Create firewall rule for HTTP/HTTPS traffic
gcloud compute firewall-rules create allow-http-https \
  --allow=tcp:80,tcp:443,tcp:8080 \
  --target-tags=http-server,https-server
```

#### 3. Connect to Your VM

```bash
gcloud compute ssh truthguard-backend --zone=us-central1-a
```

#### 4. Set Up the Application on VM

Once connected to the VM:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python and required tools
sudo apt install -y python3 python3-pip python3-venv git nginx

# Clone your repository
git clone <your-repository-url>
cd TruthGuardAgent/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
# Copy your environment variables, save and exit (Ctrl+X, Y, Enter)
```

#### 5. Set Up Systemd Service

Create a systemd service file for auto-restart and management:

```bash
sudo nano /etc/systemd/system/truthguard.service
```

Add the following content:

```ini
[Unit]
Description=TruthGuard Agent Backend
After=network.target

[Service]
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/TruthGuardAgent/backend
Environment="PATH=/home/YOUR_USERNAME/TruthGuardAgent/backend/venv/bin"
ExecStart=/home/YOUR_USERNAME/TruthGuardAgent/backend/venv/bin/python wsgi.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Replace `YOUR_USERNAME` with your actual username (run `whoami` to check).

```bash
# Enable and start the service
sudo systemctl enable truthguard
sudo systemctl start truthguard
sudo systemctl status truthguard
```

#### 6. Configure Nginx as Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/truthguard
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_VM_EXTERNAL_IP;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/truthguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Set Up SSL/HTTPS with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

#### 8. Get Your VM's External IP

```bash
gcloud compute instances describe truthguard-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### Managing the Deployment

**View logs:**
```bash
sudo journalctl -u truthguard -f
```

**Restart service:**
```bash
sudo systemctl restart truthguard
```

**Update application:**
```bash
cd /home/YOUR_USERNAME/TruthGuardAgent/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart truthguard
```

**Monitor VM:**
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory
free -h
```

### Setting Up Webhooks

After deployment, configure your webhooks:

**Telegram:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/telegram/<YOUR_BOT_TOKEN>"}'
```

**WhatsApp:**
Configure in the Meta Developer Console:
- Webhook URL: `https://your-domain.com/whatsapp`
- Verify Token: Your `WHATSAPP_VERIFY_TOKEN`

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
| `SECRET_KEY` | Flask secret key for sessions | Yes |

## 🛠️ Technology Stack

- **Flask 3.1.2** - Web framework
- **Waitress 3.0.2** - Production WSGI server
- **Pydantic 2.12.3** - Data validation
- **Flask-CORS 6.0.1** - Cross-origin resource sharing
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
