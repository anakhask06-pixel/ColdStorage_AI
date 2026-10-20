
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = (
    BASE_DIR / "dataset" / "processed"
    / "SENSOR01_features.csv"
)

df = pd.read_csv(DATA_FILE)

print("Temperature summary:")
print(df["Temperature"].describe())

print("\nHumidity summary:")
print(df["Humidity"].describe())

print("\nTemperature readings between 2°C and 8°C:")
print(
    df["Temperature"].between(2, 8).sum(),
    "out of",
    len(df)
)

print("\nMissing values:")
print(df[["Temperature", "Humidity"]].isna().sum())
