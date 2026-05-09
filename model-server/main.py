from fastapi import FastAPI, UploadFile, File
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io

app = FastAPI()

# 🔹 Load model once
model = load_model("model/currensee_one.h5")

# 🔹 Class mapping
class_map = {
    0: "₹10",
    1: "₹20",
    2: "₹50",
    3: "₹100",
    4: "₹200",
    5: "₹500",
    6: "₹2000"
}

# 🔹 Preprocess function
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# 🔹 Predict endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()

        # Preprocess
        image = preprocess_image(contents)

        # Predict
        predictions = model.predict(image)
        predicted_class = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        # Map label
        label = class_map[predicted_class]

        return {
            "denomination": label,
            "confidence": round(confidence, 3)
        }

    except Exception as e:
        return {"error": str(e)}