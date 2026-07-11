from pathlib import Path
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

# =====================================
# Project Paths
# =====================================
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_features.csv"
MODEL_FILE = BASE_DIR / "models" / "anomaly_model.pkl"
OUTPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_anomaly.csv"

# =====================================
# Load Dataset
# =====================================
print("Loading feature engineered dataset...")

df = pd.read_csv(INPUT_FILE)

# =====================================
# Select Features
# =====================================
features = [
    "Temperature",
    "Humidity",
    "Hour",
    "Minute"
]

X = df[features]

print("\nFeatures Used:")
print(features)

# =====================================
# Build Isolation Forest Model
# =====================================
model = IsolationForest(
    n_estimators=100,
    contamination=0.02,
    random_state=42
)

print("\nTraining model...")

model.fit(X)

print("Model training completed!")

# =====================================
# Predict Anomalies
# =====================================
predictions = model.predict(X)

# Convert predictions
# 1 = Normal
# -1 = Anomaly
df["Anomaly"] = predictions

# =====================================
# Show Results
# =====================================
print("\nPrediction Summary:")
print(df["Anomaly"].value_counts())

# =====================================
# Save Model
# =====================================
joblib.dump(model, MODEL_FILE)

print("\nModel saved successfully!")
print(MODEL_FILE)

# =====================================
# Save Dataset
# =====================================
df.to_csv(OUTPUT_FILE, index=False)

print("\nAnomaly dataset saved successfully!")
print(OUTPUT_FILE)