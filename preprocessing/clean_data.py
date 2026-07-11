from pathlib import Path
import pandas as pd

# Project root folder
BASE_DIR = Path(__file__).resolve().parent.parent

# File paths
RAW_FILE = BASE_DIR / "dataset" / "raw" / "SENSOR01_preprocessed.csv"
OUTPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_clean.csv"

# Load dataset
df = pd.read_csv(RAW_FILE, sep=";")

# Create DateTime column
df["DateTime"] = pd.to_datetime(
    df["Date"] + " " + df["Time"],
    format="%d.%m.%Y %H:%M:%S"
)

# Fill missing values
df["Temperature"] = df["Temperature"].interpolate()
df["Humidity"] = df["Humidity"].interpolate()

print("Missing values after cleaning:")
print(df.isnull().sum())

# Save cleaned dataset
df.to_csv(OUTPUT_FILE, index=False)

print(f"\n✅ Saved successfully to:\n{OUTPUT_FILE}")