from pathlib import Path
import pandas as pd

# =====================================
# Project Paths
# =====================================
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_features.csv"
OUTPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"

# =====================================
# Load Dataset
# =====================================
print("Loading feature dataset...")

df = pd.read_csv(INPUT_FILE)

# =====================================
# Create Target Column
# Predict the next temperature value
# =====================================
df["FutureTemperature"] = df["Temperature"].shift(-1)

# Remove last row (it has no future value)
df.dropna(inplace=True)

# =====================================
# Save Dataset
# =====================================
df.to_csv(OUTPUT_FILE, index=False)

print("\nPrediction dataset created successfully!")
print(df.head())
print("\nSaved to:")
print(OUTPUT_FILE)