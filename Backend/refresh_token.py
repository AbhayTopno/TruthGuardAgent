import os
import threading
import time
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]
SERVICE_ACCOUNT_FILE = "service-account.json"

token_data = {"access_token": None, "expiry": 0}

def refresh_token():
    """Refresh the GCP token and store it globally + in environment."""
    global token_data

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    creds.refresh(Request())

    token_data["access_token"] = creds.token
    token_data["expiry"] = creds.expiry.timestamp()

    # Update the Flask environment variable
    os.environ["GCP_ACCESS_TOKEN"] = creds.token
    print("[TOKEN REFRESHED ✅]", creds.expiry)

def schedule_refresh(interval=3500):
    """Run token refresh every ~1 hour (3500s) in background."""
    def loop():
        while True:
            refresh_token()
            time.sleep(interval)
    threading.Thread(target=loop, daemon=True).start()
