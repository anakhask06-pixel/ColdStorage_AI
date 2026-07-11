from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_anomaly.csv"

# -----------------------------
# Load data
# -----------------------------
df = pd.read_csv(INPUT_FILE)

df["DateTime"] = pd.to_datetime(df["DateTime"])

# -----------------------------
# Separate anomalies
# -----------------------------
normal = df[df["Anomaly"] == 1]
anomaly = df[df["Anomaly"] == -1]

# -----------------------------
# Plot
# -----------------------------
plt.figure(figsize=(16,6))

plt.plot(
    normal["DateTime"],
    normal["Temperature"],
    label="Normal",
    linewidth=1
)

plt.scatter(
    anomaly["DateTime"],
    anomaly["Temperature"],
    color="red",
    label="Anomaly",
    s=15
)

plt.title("Detected Temperature Anomalies")
plt.xlabel("Time")
plt.ylabel("Temperature (°C)")
plt.legend()

plt.show()