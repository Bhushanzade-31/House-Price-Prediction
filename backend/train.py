from sklearn.datasets import fetch_california_housing
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pandas as pd
import numpy as np
import joblib

data = fetch_california_housing()
x = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(x_train, y_train)
y_pred = model.predict(x_test)

mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"RMSE: ${rmse * 100000:,.0f}")
print(f"MAE:  ${mae * 100000:,.0f}")
print(f"R2 Score: {r2:.4f}")
print(f"First 5 predictions: {(y_pred[:5] * 100000).round()}")

joblib.dump(model, 'housemodel.joblib')
joblib.dump(list(x.columns), 'feature_names.joblib')
print("\nModel and feature names saved.")