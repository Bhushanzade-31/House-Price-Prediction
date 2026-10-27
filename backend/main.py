import io
import os
import pandas as pd
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException , UploadFile, File
import joblib
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# load_dotenv()
import env
app = FastAPI()
#to add frontent
app.add_middleware(
    CORSMiddleware,
    allow_origins=[env.url],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load(r'C:\Users\zadeg\OneDrive\Desktop\New folder\pro\backend\housemodel.joblib')
feature_names = joblib.load(r'C:\Users\zadeg\OneDrive\Desktop\New folder\pro\backend\feature_names.joblib')

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
        data = pd.DataFrame([[
            features.MedInc, features.HouseAge, features.AveRooms,
            features.AveBedrms, features.Population, features.AveOccup,
            features.Latitude, features.Longitude,
        ]], columns=feature_names)
        price = model.predict(data)[0] * 100000
        return {
            "predicted_price": f"${price:,.0f}",
            "predicted_price_short": f"${price:.2f}",
            "fidance_range": f"${price-39000:,.0f} to ${price+39000:,.0f}",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    content = await file.read()
    df=pd.read_csv(io.BytesIO(content))
    
                              
    required_columns = [
        'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude'
    ]
    missing_columns = [
        col for col in required_columns 
        if col not in df.columns
    ]
    if missing_columns:
        raise HTTPException(status_code=400, 
                            detail=f"therequired columns are missing  file:  {', '.join(missing_columns)}")
        
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")
    
    try:
        predictions = model.predict(df[required_columns])
        df['PredictedPrice'] = df[required_columns].apply(lambda row: model.predict([row])[0] * 100000, axis=1)
        output = df.to_csv(index=False)
        
        return StreamingResponse(
            io.StringIO(output),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=predictions.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")  
    