
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = (
    BASE_DIR / "dataset" / "processed"
    / "SENSOR01_prediction.csv"
)

df = pd.read_csv(DATA_FILE)

split = int(len(df) * 0.8)
test = df.iloc[split:].copy()

current = test["Temperature"]
future = test["FutureTemperature"]
change = future - current

print("Temperature Change Analysis")
print("----------------------------")
print("Test rows:", len(test))
print("Unchanged rows:", int((change == 0).sum()))
print("Changed rows:", int((change != 0).sum()))
print("Mean absolute change:", round(change.abs().mean(), 6))
print("Maximum absolute change:", round(change.abs().max(), 6))
print("\nLargest changes:")
print(
    test.loc[change.abs().nlargest(10).index,
             ["Temperature", "FutureTemperature"]]
    .assign(Change=change.loc[change.abs().nlargest(10).index])
    .to_string(index=False)
)

