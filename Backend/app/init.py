from flask import Flask
from flask_cors import CORS
from app.config import Config
from integrations.adk_client import warmup

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    from adapters.routes import bp
    app.register_blueprint(bp)

    # Start GCP token refresh scheduler
    try:
        from refresh_token import schedule_refresh
        schedule_refresh(interval=3000)  # Refresh every 40 minutes (2400 seconds)
        app.logger.info("GCP token refresh scheduler started (40 min interval)")
    except Exception as e:
        app.logger.warning(f"GCP token refresh not started: {e}")

    try:
        warmup()
    except Exception:
        pass

    return app