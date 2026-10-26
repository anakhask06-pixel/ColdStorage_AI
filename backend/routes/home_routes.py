from flask import Blueprint

home_bp = Blueprint("home", __name__)


@home_bp.route("/")
def home():
    return {
        "project": "AI-Based Intelligent Cold Storage Monitoring System",
        "status": "Backend is running successfully!",
        "version": "1.0"
    }
