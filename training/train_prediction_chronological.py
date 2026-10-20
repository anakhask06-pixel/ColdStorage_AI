
from pathlib import Path

import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "dataset" / "processed" / "SENSOR01_prediction.csv"
MODEL_FILE = BASE_DIR / "models" / "prediction_model_chronological.pkl"

FEATURES = ["Temperature", "Humidity", "Hour", "Minute"]
TARGET = "FutureTemperature"

df = pd.read_csv(DATA_FILE)

# Preserve time order: first 80% for training, last 20% for testing
split = int(len(df) * 0.8)

train_df = df.iloc[:split]
test_df = df.iloc[split:]

X_train = train_df[FEATURES]
y_train = train_df[TARGET]

X_test = test_df[FEATURES]
y_test = test_df[TARGET]

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print("Training Random Forest using chronological split...")
model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("\nChronological Test Results")
print("--------------------------")
print(f"MAE:  {mean_absolute_error(y_test, predictions):.6f}")
print(f"MSE:  {mean_squared_error(y_test, predictions):.6f}")
print(f"R²:   {r2_score(y_test, predictions):.6f}")

baseline = X_test["Temperature"].to_numpy()

print("\nPersistence Baseline")
print("--------------------")
print(f"MAE:  {mean_absolute_error(y_test, baseline):.6f}")
print(f"R²:   {r2_score(y_test, baseline):.6f}")

joblib.dump(model, MODEL_FILE)
print("\nChronologically trained model saved to:")
print(MODEL_FILE)
