
from pathlib import Path
from datetime import datetime
import math

import joblib
import pandas as pd


# ==========================================
# 1. MODEL PATHS AND FEATURES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

ANOMALY_MODEL_PATH = BASE_DIR / "models" / "anomaly_model.pkl"
PREDICTION_MODEL_PATH = BASE_DIR / "models" / "prediction_model.pkl"

FEATURES = ["Temperature", "Humidity", "Hour", "Minute"]


# ==========================================
# 2. LOAD MODELS ONCE
# ==========================================

def load_models():
    if not ANOMALY_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Anomaly model not found: {ANOMALY_MODEL_PATH}"
        )

    if not PREDICTION_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Prediction model not found: {PREDICTION_MODEL_PATH}"
        )

    anomaly_model = joblib.load(ANOMALY_MODEL_PATH)
    prediction_model = joblib.load(PREDICTION_MODEL_PATH)

    return anomaly_model, prediction_model


# Models are loaded once when this module is imported.
ANOMALY_MODEL, PREDICTION_MODEL = load_models()


# ==========================================
# 3. STORAGE TEMPERATURE CHECK
# ==========================================

def check_storage_temperature(temperature):
    if temperature < 2:
        return "TOO_COLD"
    elif temperature > 8:
        return "TOO_WARM"
    else:
        return "NORMAL"


# ==========================================
# 4. AI INFERENCE FUNCTION
# ==========================================

def predict_environment(temperature, humidity, timestamp=None):

    # Validate temperature
    if isinstance(temperature, bool) or not isinstance(
        temperature, (int, float)
    ):
        raise ValueError("Temperature must be numeric.")

    # Validate humidity
    if isinstance(humidity, bool) or not isinstance(
        humidity, (int, float)
    ):
        raise ValueError("Humidity must be numeric.")

    temperature = float(temperature)
    humidity = float(humidity)

    if not math.isfinite(temperature):
        raise ValueError("Temperature must be finite.")

    if not math.isfinite(humidity) or not 0 <= humidity <= 100:
        raise ValueError("Humidity must be between 0 and 100.")

    if timestamp is None:
        timestamp = datetime.now()

    if not isinstance(timestamp, datetime):
        raise ValueError("timestamp must be a datetime object.")

    # Prepare features in the same order as training
    input_data = pd.DataFrame(
        [{
            "Temperature": temperature,
            "Humidity": humidity,
            "Hour": timestamp.hour,
            "Minute": timestamp.minute,
        }],
        columns=FEATURES
    )

    # Isolation Forest anomaly detection
    raw_anomaly = int(ANOMALY_MODEL.predict(input_data)[0])
    anomaly_score = float(
        ANOMALY_MODEL.decision_function(input_data)[0]
    )

    # Random Forest next-row temperature prediction
    predicted_temperature = float(
        PREDICTION_MODEL.predict(input_data)[0]
    )

    if not math.isfinite(predicted_temperature):
        raise ValueError("The prediction model returned an invalid value.")

    # Rule-based storage status
    storage_status = check_storage_temperature(temperature)

    # Combined status
    if storage_status != "NORMAL":
        overall_status = "WARNING"
    elif raw_anomaly == -1:
        overall_status = "ANOMALY"
    else:
        overall_status = "NORMAL"

    # JSON-compatible result
    return {
        "current_temperature": temperature,
        "current_humidity": humidity,
        "predicted_temperature": round(predicted_temperature, 3),
        "anomaly": raw_anomaly == -1,
        "anomaly_label": raw_anomaly,
        "anomaly_score": round(anomaly_score, 6),
        "storage_status": storage_status,
        "overall_status": overall_status,
    }


# ==========================================
# 5. TEST THE AI MODULE
# ==========================================

if __name__ == "__main__":

    test_cases = [
        {
            "name": "Normal storage",
            "temperature": 5.0,
            "humidity": 70.0,
        },
        {
            "name": "Warm storage",
            "temperature": 12.0,
            "humidity": 85.0,
        },
        {
            "name": "Excessively cold storage",
            "temperature": 0.0,
            "humidity": 70.0,
        },
        {
            "name": "Extreme temperature",
            "temperature": 30.0,
            "humidity": 90.0,
        },
    ]

    print("AI Inference Integration Test")
    print("=" * 40)

    for test in test_cases:
        result = predict_environment(
            temperature=test["temperature"],
            humidity=test["humidity"],
        )

        print(f"\nTest: {test['name']}")
        print("-" * 40)

        for key, value in result.items():
            print(f"{key}: {value}")
