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
<img width="992" height="817" alt="Screenshot 2026-10-30 185830" src="https://github.com/user-attachments/assets/02ae8193-41db-4b0c-93b3-e4ac8cb629e6" />
<img width="969" height="756" alt="Screenshot 2026-10-30 185840" src="https://github.com/user-attachments/assets/73d95917-11a1-4d6c-995f-766ba2cd395c" />
![Uploading Screenshot 2026-10-30 185918.png…]()

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

## License
MIT
