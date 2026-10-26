import sys
from pathlib import Path

from flask import Blueprint, jsonify, request

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai_inference import predict_environment

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/analyze", methods=["POST"])
def analyze_environment():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send a valid JSON object."}), 400

    if "temperature" not in data or "humidity" not in data:
        return jsonify({
            "error": "Both temperature and humidity are required."
        }), 400

    try:
        result = predict_environment(
            temperature=data["temperature"],
            humidity=data["humidity"]
        )
        return jsonify(result), 200
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        print("AI analysis failed.")
        return jsonify({
            "error": "AI analysis failed. Check the backend terminal."
        }), 500
