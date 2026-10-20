
from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_FILE = BASE_DIR / "models" / "anomaly_model.pkl"

model = joblib.load(MODEL_FILE)

features = ["Temperature", "Humidity", "Hour", "Minute"]

# Illustrative test cases, not confirmed spoilage thresholds
test_cases = [
    {
        "case": "Normal storage",
        "Temperature": 5.0,
        "Humidity": 70.0,
        "Hour": 10,
        "Minute": 30,
    },
    {
        "case": "Warm environment",
        "Temperature": 12.0,
        "Humidity": 85.0,
        "Hour": 14,
        "Minute": 15,
    },
    {
        "case": "Extreme temperature",
        "Temperature": 30.0,
        "Humidity": 90.0,
        "Hour": 16,
        "Minute": 45,
    },
]

print("Isolation Forest Test Results")
print("-" * 45)

for case in test_cases:
    X = pd.DataFrame(
        [{key: case[key] for key in features}],
        columns=features,
    )

    label = int(model.predict(X)[0])
    score = float(model.decision_function(X)[0])

    print(f"\nTest case: {case['case']}")
    print(f"Temperature: {case['Temperature']}°C")
    print(f"Humidity: {case['Humidity']}%")
    print(f"Raw label: {label}")
    print(f"Status: {'ANOMALY' if label == -1 else 'NORMAL'}")
    print(f"Decision score: {score:.6f}")
