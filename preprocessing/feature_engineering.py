from pathlib import Path
import pandas as pd

# ==========================================
# Project Paths
# ==========================================
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_clean.csv"
OUTPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_features.csv"

# ==========================================
# Load Cleaned Dataset
# ==========================================
print("Loading cleaned dataset...")

df = pd.read_csv(INPUT_FILE)

# ==========================================
# Convert DateTime Column
# ==========================================
df["DateTime"] = pd.to_datetime(df["DateTime"])

# ==========================================
# Feature Engineering
# ==========================================

# Time-based Features
df["Hour"] = df["DateTime"].dt.hour
df["Minute"] = df["DateTime"].dt.minute
df["Day"] = df["DateTime"].dt.day
df["Month"] = df["DateTime"].dt.month
df["Weekday"] = df["DateTime"].dt.weekday

# Weekend Feature
df["IsWeekend"] = (df["Weekday"] >= 5).astype(int)

# ==========================================
# Display Information
# ==========================================

print("\nNew Features Created Successfully!\n")

print(df.head())

print("\nDataset Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns)

# ==========================================
# Save Dataset
# ==========================================

df.to_csv(OUTPUT_FILE, index=False)

print("\nFeature engineered dataset saved successfully!")
print(OUTPUT_FILE)