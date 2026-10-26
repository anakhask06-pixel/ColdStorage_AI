
from flask import Blueprint, request, jsonify

from services.sensor_service import (
    save_sensor_data,
    fetch_sensor_data,
)

sensor_bp = Blueprint("sensor_bp", __name__)


@sensor_bp.route("/api/sensor-data", methods=["GET"])
def get_sensor_data():
    try:
        data = fetch_sensor_data()
        return jsonify(data), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


@sensor_bp.route("/api/sensor-data", methods=["POST"])
def create_sensor_data():
    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "error": "Request body must be a JSON object."
            }), 400

        if "temperature" not in data or "humidity" not in data:
            return jsonify({
                "error": "Both temperature and humidity are required."
            }), 400

        result = save_sensor_data(
            data["temperature"],
            data["humidity"],
        )

        return jsonify(result), 201

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        return jsonify({"error": "Internal server error"}), 500
