# 🏠 House Price Prediction Web App

An end-to-end machine learning application that predicts California house prices from 8 features, with a **FastAPI** backend and a **React** frontend.

🔗 **Live Demo:** [Add your Vercel link here]([https://your-app.vercel.app](https://house-price-prediction-theta.vercel.app/))

## ✨ Features

- Predicts house prices from 8 input features (R² of **XX%**)
- Single prediction with a form and a price range display
- Batch prediction: upload a CSV and download the results
- Vectorized inference with Pandas/NumPy instead of row-by-row, so large files process faster
- Input validation and structured error handling: malformed files and missing columns return clear error messages
- Interactive API docs with Swagger UI

## 🛠 Tech Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| ML       | Python, scikit-learn, Pandas, NumPy   |
| Backend  | FastAPI, Uvicorn, Pydantic            |
| Frontend | React.js                              |
| Deploy   | Vercel                                |

## 📊 Dataset

California Housing dataset with 8 features:

`MedInc`, `HouseAge`, `AveRooms`, `AveBedrms`, `Population`, `AveOccup`, `Latitude`, `Longitude`

## ⚙️ Installation

```bash
git clone https://github.com/<your-username>/House-Price-Prediction.git
cd House-Price-Prediction
```

**Backend**
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

**Frontend**
```bash
cd frontend
npm install
npm start
```

## 🔌 API Endpoints

| Method | Endpoint         | Description                  |
|--------|------------------|------------------------------|
| POST   | `/predict`       | Predict price for one house  |
| POST   | `/predict/batch` | Predict prices from a CSV    |

**Example request**
```json
{
  "MedInc": 8.3252,
  "HouseAge": 41,
  "AveRooms": 6.98,
  "AveBedrms": 1.02,
  "Population": 322,
  "AveOccup": 2.55,
  "Latitude": 37.88,
  "Longitude": -122.23
}
```

**Batch CSV format:** the file must contain all 8 columns above. Missing columns or invalid files return a clear error message.

## 📸 Screenshots

<img width="992" height="817" alt="API docs" src="https://github.com/user-attachments/assets/02ae8193-41db-4b0c-93b3-e4ac8cb629e6" />
<img width="969" height="756" alt="Predict request" src="https://github.com/user-attachments/assets/73d95917-11a1-4d6c-995f-766ba2cd395c" />
<img width="791" height="487" alt="Prediction response" src="https://github.com/user-attachments/assets/722996c1-4424-4dc3-beb7-3be1eec2e970" />

