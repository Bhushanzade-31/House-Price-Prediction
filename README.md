# 🏠 House Price Prediction

A machine learning model that predicts house prices, served through a **FastAPI** REST API.

## Tech Stack
Python, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy

## Installation
```bash
git clone https://github.com/<your-username>/House-Price-Prediction.git
cd House-Price-Prediction
pip install -r requirements.txt
```

## Run
```bash
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs for the interactive API docs.

## Example
`POST /predict`
```json
{
  "location": "Whitefield",
  "total_sqft": 1200,
  "bath": 2,
  "bhk": 3
}
```

## Screenshots
<img width="992" height="817" alt="API docs" src="https://github.com/user-attachments/assets/02ae8193-41db-4b0c-93b3-e4ac8cb629e6" />
<img width="969" height="756" alt="Predict request" src="https://github.com/user-attachments/assets/73d95917-11a1-4d6c-995f-766ba2cd395c" />
<img width="791" height="487" alt="Prediction response" src="https://github.com/user-attachments/assets/722996c1-4424-4dc3-beb7-3be1eec2e970" />

## License
MIT
