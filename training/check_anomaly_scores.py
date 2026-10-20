
from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "anomaly_model.pkl"

model = joblib.load(MODEL_PATH)

print("Anomaly score diagnostic")
print("-" * 40)

for temperature in [0, 2, 5, 8, 12, 20, 30, 42]:
    data = pd.DataFrame([{
        "Temperature": temperature,
        "Humidity": 70.0,
        "Hour": 10,
        "Minute": 30
    }], columns=["Temperature", "Humidity", "Hour", "Minute"])

    label = int(model.predict(data)[0])
    score = float(model.decision_function(data)[0])

    print(
        f"Temperature: {temperature:>2}°C | "
        f"Label: {label:>2} | Score: {score:.6f}"
    )
