# CurrenSee

CurrenSee is a full-stack AI-powered currency detection platform for Indian currency notes.

Users can upload a currency image, select an AI model version, receive a denomination prediction with a confidence score, review prediction history, and provide feedback when a prediction is wrong.

## Tech Stack

Frontend:

- React
- Vite
- Responsive dark UI

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- Cloudinary

Model Server:

- FastAPI
- TensorFlow `.h5` models

## Current Features

- Image upload
- AI currency prediction
- Multi-model selection
- Backend-to-FastAPI model routing
- MongoDB model configuration
- Prediction persistence
- Cloudinary image storage
- Prediction history
- Daily usage limits
- Feedback capture

## Project Structure

```txt
frontend/       React app
backend/        Express API and MongoDB models
model-server/   FastAPI TensorFlow model server
```

Recommended model layout:

```txt
model-server/
  models/
    v1/
      model.h5
    v2/
      model.h5
```

## Run The Project

Start the services in this order.

### 1. Model Server

```bash
cd model-server
py -3.10 -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn tensorflow pillow numpy python-multipart
uvicorn main:app --reload --port 8000
```

Model server:

```txt
http://localhost:8000
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Backend API:

```txt
http://localhost:8080
```

Backend environment variables:

```env
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

## Core API Flow

Prediction:

```txt
Frontend -> Backend -> FastAPI -> Backend -> Cloudinary -> MongoDB -> Frontend
```

Feedback:

```txt
Frontend -> Backend -> MongoDB
```

## Main API Endpoints

```txt
GET  /api/models
POST /api/predict
GET  /api/predictions/history
POST /api/feedback
GET  /api/user/usage-limit
```

FastAPI:

```txt
POST /predict
```

## Example Prediction Response

```json
{
  "predictionId": "...",
  "denomination": "Rs. 100",
  "confidence": 0.93,
  "imageUrl": "https://res.cloudinary.com/...",
  "modelVersion": "v1"
}
```

## Future Work

- S3 image storage
- Advanced analytics
- Retraining pipeline
- Premium plans
- Better model versions

## Notes

- Use Python 3.10 for TensorFlow compatibility.
- Model input preprocessing expects RGB images resized to `224x224` and normalized.
- Keep FastAPI focused on inference; business logic stays in the backend.
