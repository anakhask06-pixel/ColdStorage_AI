from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

# =====================================
# Project Paths
# =====================================
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"
MODEL_FILE = BASE_DIR / "models" / "prediction_model.pkl"

# =====================================
# Load Dataset
# =====================================
print("Loading prediction dataset...")

df = pd.read_csv(INPUT_FILE)

# =====================================
# Features and Target
# =====================================
features = [
    "Temperature",
    "Humidity",
    "Hour",
    "Minute"
]

X = df[features]
y = df["FutureTemperature"]

# =====================================
# Train/Test Split
# =====================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# =====================================
# Train Model
# =====================================
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

print("\nTraining Prediction Model...")

model.fit(X_train, y_train)

print("Training Completed!")

# =====================================
# Prediction
# =====================================
predictions = model.predict(X_test)

# =====================================
# Evaluation
# =====================================
mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\nModel Performance")
print("----------------------------")
print(f"MAE : {mae:.3f}")
print(f"MSE : {mse:.3f}")
print(f"R²  : {r2:.3f}")

# =====================================
# Save Model
# =====================================
joblib.dump(model, MODEL_FILE)

print("\nPrediction model saved successfully!")
print(MODEL_FILE)