
from pathlib import Path
import pandas as pd
import joblib

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"
MODEL_FILE = BASE_DIR / "models" / "prediction_model.pkl"

# Load data and model
df = pd.read_csv(DATA_FILE)
model = joblib.load(MODEL_FILE)

features = [
    "Temperature",
    "Humidity",
    "Hour",
    "Minute"
]

target = "FutureTemperature"

# Use the final 20% of the time series as unseen test data
split_index = int(len(df) * 0.8)

train_df = df.iloc[:split_index]
test_df = df.iloc[split_index:]

X_test = test_df[features]
y_test = test_df[target]

# Evaluate the saved model on the chronological test section
predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\nChronological Evaluation of Saved Model")
print("---------------------------------------")
print("Training rows:", len(train_df))
print("Testing rows:", len(test_df))
print(f"MAE: {mae:.6f}")
print(f"MSE: {mse:.6f}")
print(f"R²:  {r2:.6f}")

print("\nSample predictions:")
results = pd.DataFrame({
    "Actual_Temperature": y_test.iloc[:10].values,
    "Predicted_Temperature": predictions[:10]
})
print(results.to_string(index=False))
