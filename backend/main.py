
import io
from pathlib import Path

import joblib
import pandas as pd
import env

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Get the directory containing main.py
BASE_DIR = Path(__file__).resolve().parent

# Load ML model and feature names
MODEL_PATH = BASE_DIR / "housemodel.joblib"
FEATURE_NAMES_PATH = BASE_DIR / "feature_names.joblib"

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_NAMES_PATH)

# Configure CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[env.url],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HouseFeatures(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float


@app.get("/")
def home():
    return {"message": "FastAPI is working!"}


@app.post("/predict")
def predict(features: HouseFeatures):
    try:
        data = pd.DataFrame(
            [[
                features.MedInc,
                features.HouseAge,
                features.AveRooms,
                features.AveBedrms,
                features.Population,
                features.AveOccup,
                features.Latitude,
                features.Longitude,
            ]],
            columns=feature_names,
        )

        price = float(model.predict(data)[0]) * 100000

        return {
            "predicted_price": f"${price:,.0f}",
            "predicted_price_short": f"${price:.2f}",
            "confidence_range": (
                f"${price - 39000:,.0f} to ${price + 39000:,.0f}"
            ),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a CSV file.",
        )

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        required_columns = [
            "MedInc",
            "HouseAge",
            "AveRooms",
            "AveBedrms",
            "Population",
            "AveOccup",
            "Latitude",
            "Longitude",
        ]

        missing_columns = [
            col for col in required_columns if col not in df.columns
        ]

        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}",
            )

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="The uploaded CSV file is empty.",
            )

        # Convert input features to numeric values
        X = df[required_columns].apply(pd.to_numeric, errors="raise")

        if X.isnull().any().any():
            raise HTTPException(
                status_code=400,
                detail="CSV features cannot contain empty values.",
            )

        predictions = model.predict(X) * 100000
        df["PredictedPrice"] = predictions

        output = df.to_csv(index=False)

        return StreamingResponse(
            io.BytesIO(output.encode("utf-8")),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=predictions.csv"
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during prediction: {str(e)}",
        )
