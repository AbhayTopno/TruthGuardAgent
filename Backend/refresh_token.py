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
    current_time = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[TOKEN REFRESHED ✅] {current_time} - Expires: {creds.expiry}")

def schedule_refresh(interval=2900):
    """Run token refresh every specified interval (default: 2900s) in background."""
    # Refresh immediately on startup
    print(f"[TOKEN SCHEDULER] Starting with {interval}s refresh interval")
    try:
        refresh_token()
    except Exception as e:
        print(f"[TOKEN REFRESH ERROR] Initial refresh failed: {e}")
    
    # Schedule periodic refreshes
    def loop():
        while True:
            print(f"[TOKEN SCHEDULER] Waiting {interval}s until next refresh...")
            time.sleep(interval)
            print(f"[TOKEN SCHEDULER] Refreshing token now...")
            try:
                refresh_token()
            except Exception as e:
                print(f"[TOKEN REFRESH ERROR] {e}")
                
                
    threading.Thread(target=loop, daemon=True).start()

    # thread = threading.Thread(target=loop, daemon=True)
    # thread.start()
    # print(f"[TOKEN SCHEDULER] Background thread started (thread id: {thread.ident})")
