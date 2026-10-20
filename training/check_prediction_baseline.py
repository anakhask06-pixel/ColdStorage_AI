
from pathlib import Path
import pandas as pd
import joblib

from sklearn.metrics import mean_absolute_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"
MODEL_FILE = BASE_DIR / "models" / "prediction_model.pkl"

df = pd.read_csv(DATA_FILE)

features = ["Temperature", "Humidity", "Hour", "Minute"]
target = "FutureTemperature"

# Keep the final 20% as the chronological test segment
split = int(len(df) * 0.8)
test = df.iloc[split:].copy()

# Baseline: next temperature equals current temperature
baseline = test["Temperature"].to_numpy()
actual = test[target].to_numpy()

# Existing trained model
model = joblib.load(MODEL_FILE)
model_predictions = model.predict(test[features])

print("Chronological test-set comparison")
print("---------------------------------")
print("Baseline MAE:",
      round(mean_absolute_error(actual, baseline), 6))
print("Model MAE:   ",
      round(mean_absolute_error(actual, model_predictions), 6))

print("\nBaseline R²:", round(r2_score(actual, baseline), 6))
print("Model R²:   ", round(r2_score(actual, model_predictions), 6))

print("\nTemperature changes in test set:")
print("No change:",
      int((test[target] == test["Temperature"]).sum()))
print("Total rows:", len(test))
