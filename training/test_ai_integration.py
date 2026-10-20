
import json
import sys
from pathlib import Path

# Add the project root to the Python import path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from ai_inference import predict_environment


def main():
    result = predict_environment(
        temperature=5.0,
        humidity=70.0,
    )

    # Check whether the result can be converted to JSON
    json_output = json.dumps(result, indent=4)

    print("AI Integration Test")
    print("=" * 30)
    print(json_output)

    # Verify all required output fields
    required_fields = [
        "current_temperature",
        "current_humidity",
        "predicted_temperature",
        "anomaly",
        "anomaly_label",
        "anomaly_score",
        "storage_status",
        "overall_status",
    ]

    for field in required_fields:
        assert field in result, f"Missing field: {field}"

    assert result["storage_status"] == "NORMAL"
    assert result["overall_status"] in [
        "NORMAL",
        "WARNING",
        "ANOMALY",
    ]

    print("\nAll required fields are present.")
    print("JSON serialization successful.")
    print("AI integration test passed.")


if __name__ == "__main__":
    main()
