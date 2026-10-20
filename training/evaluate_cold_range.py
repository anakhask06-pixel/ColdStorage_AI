
from pathlib import Path
import pandas as pd
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"
MODEL_FILE = BASE_DIR / "models" / "prediction_model.pkl"

df = pd.read_csv(DATA_FILE)

features = ["Temperature", "Humidity", "Hour", "Minute"]
target = "FutureTemperature"

# Use the final 20% as a chronological test segment
split = int(len(df) * 0.8)
test = df.iloc[split:].copy()

# Evaluate readings in the intended cold-storage range
cold = test[test["Temperature"].between(2, 8)]

print("Cold-storage range evaluation")
print("-----------------------------")
print("Test rows in range:", len(cold))

if cold.empty:
    print("No readings found in the selected range.")
else:
    model = joblib.load(MODEL_FILE)

    actual = cold[target]
    predicted = model.predict(cold[features])
    baseline = cold["Temperature"]

    print(f"Model MAE:    {mean_absolute_error(actual, predicted):.6f}")
    print(f"Baseline MAE: {mean_absolute_error(actual, baseline):.6f}")
    print(f"Model MSE:    {mean_squared_error(actual, predicted):.6f}")
