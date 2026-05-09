# 💰 AI Currency Detection Web App

A full-stack AI-powered web application that detects the denomination of Indian currency notes from images using a trained deep learning model.

---

## 🚀 Overview

This project allows users to upload an image of a currency note and get:

* ✅ Predicted denomination (₹10, ₹20, ₹50, etc.)
* 📊 Confidence score of the prediction

The system uses a **React frontend**, **Node.js backend**, and a **FastAPI-based ML model server**.

---

## 🧠 Architecture

```
Frontend (React)
      ↓
Backend (Node.js + Express + Multer)
      ↓
Model Server (FastAPI + TensorFlow)
      ↓
Prediction Response
```

---

## 📁 Project Structure

```
project-root/
│
├── frontend/        # React app (Vite)
├── backend/         # Node.js server (Express + Multer)
├── model-server/    # FastAPI ML server
│   ├── model/       # .h5 trained model
│   └── main.py      # FastAPI app
```

---

## ⚙️ Prerequisites

Make sure you have installed:

* Node.js (v18+ recommended)
* Python 3.10
* pip

---

## 🔧 Setup & Run Instructions

---

### 🔹 1. Model Server (FastAPI)

```bash
cd model-server

# create virtual environment
py -3.10 -m venv venv

# activate (Git Bash)
source venv/Scripts/activate

# OR (PowerShell)
venv\Scripts\activate

# install dependencies
pip install fastapi uvicorn tensorflow pillow numpy

# run server
uvicorn main:app --reload --port 8000
```

👉 Runs on: http://localhost:8000
👉 Swagger UI: http://localhost:8000/docs

---

### 🔹 2. Backend (Node.js)

```bash
cd backend

npm install

# run server
npm run dev
# OR
node server.js
```

👉 Runs on: http://localhost:8080

---

### 🔹 3. Frontend (React)

```bash
cd frontend

npm install

npm run dev
```

👉 Runs on: http://localhost:5173

---

## ▶️ Running the Full System

Start services in this order:

1. ✅ FastAPI Model Server
2. ✅ Node Backend
3. ✅ React Frontend

---

## 🔗 API Endpoints

### Backend

```
POST /api/predict
```

### FastAPI

```
POST /predict
```

---

## 🔄 Example Flow

1. User uploads an image from the frontend
2. Backend receives the image using multer
3. Backend sends the image to FastAPI
4. FastAPI processes the image using the ML model
5. Prediction is returned to frontend

---

## 📊 Example Response

```json
{
  "denomination": "₹100",
  "confidence": 0.93
}
```

---

## 🔮 Future Improvements

* 🔁 Model version switching (v1, v2, etc.)
* 🔐 User authentication & usage limits
* ☁️ S3 storage for dataset collection
* 🧠 Feedback loop for improving model accuracy
* 📸 Webcam support

---

## 🧑‍💻 Author

Built as a full-stack AI project integrating machine learning with web technologies.

---

## ⭐ Notes

* Ensure Python version is **3.10** for TensorFlow compatibility
* Model must match preprocessing (224x224, RGB, normalized)
* Start services in correct order to avoid connection issues

---
