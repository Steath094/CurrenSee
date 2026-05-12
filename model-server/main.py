from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
import io

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_FILE_NAMES = ("model.h5", "model.keras")
MODEL_FILE_PATTERNS = ("*.h5", "*.keras")
DEFAULT_TARGET_SIZE = (224, 224)
RESCALE_FACTOR = 1.0 / 255.0

loaded_models: dict[str, Any] = {}

currency_labels = {
    0: "Rs. 10",
    1: "Rs. 20",
    2: "Rs. 50",
    3: "Rs. 100",
    4: "Rs. 200",
    5: "Rs. 500",
    6: "Rs. 2000",
}


def find_model_file(version_dir: Path) -> Path:
    for file_name in MODEL_FILE_NAMES:
        model_path = version_dir / file_name

        if model_path.is_file():
            return model_path

    for pattern in MODEL_FILE_PATTERNS:
        matches = sorted(version_dir.glob(pattern))

        if matches:
            return matches[0]

    raise FileNotFoundError(f"No model file found in {version_dir}")


def load_available_models() -> dict[str, Any]:
    if not MODELS_DIR.exists():
        raise RuntimeError(f"Models directory not found: {MODELS_DIR}")

    models: dict[str, Any] = {}

    for version_dir in sorted(MODELS_DIR.iterdir()):
        if not version_dir.is_dir():
            continue

        model_path = find_model_file(version_dir)
        models[version_dir.name] = load_model(model_path)
        print(f"Loaded model version {version_dir.name} from {model_path}")

    if not models:
        raise RuntimeError(f"No TensorFlow models found in {MODELS_DIR}")

    return models


@asynccontextmanager
async def lifespan(_: FastAPI):
    loaded_models.update(load_available_models())
    yield
    loaded_models.clear()


app = FastAPI(lifespan=lifespan)


def get_model_target_size(model: Any) -> tuple[int, int]:
    input_shape = getattr(model, "input_shape", None)

    if isinstance(input_shape, list):
        input_shape = input_shape[0] if input_shape else None

    if input_shape and len(input_shape) >= 3:
        height = input_shape[1]
        width = input_shape[2]

        if isinstance(height, int) and isinstance(width, int):
            return height, width

    return DEFAULT_TARGET_SIZE


def preprocess_image(image_bytes: bytes, target_size: tuple[int, int]) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    height, width = target_size
    image = image.resize((width, height), Image.Resampling.NEAREST)
    image_array = np.asarray(image, dtype=np.float32) * RESCALE_FACTOR

    return np.expand_dims(image_array, axis=0)


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    modelVersion: str = Form(...),
):
    version = modelVersion.strip()

    if not version:
        raise HTTPException(status_code=400, detail="modelVersion is required")

    selected_model = loaded_models.get(version)

    if selected_model is None:
        raise HTTPException(status_code=404, detail="Model version not found")

    try:
        contents = await file.read()
        target_size = get_model_target_size(selected_model)
        image = preprocess_image(contents, target_size)

        raw_predictions = selected_model.predict(image, verbose=0)
        scores = np.asarray(raw_predictions)

        if scores.ndim > 1:
            scores = scores[0]

        scores = scores.reshape(-1)
        predicted_class = int(np.argmax(scores))
        confidence = float(np.max(scores))
        label = currency_labels.get(predicted_class, "Unknown")

        print(
            "[predict] Prediction complete",
            {
                "modelVersion": version,
                "inputSize": target_size,
                "predictedClass": predicted_class,
                "denomination": label,
                "confidence": round(confidence, 3),
            },
        )

        return {
            "denomination": label,
            "confidence": round(confidence, 3),
            "modelVersion": version,
        }
    except HTTPException:
        raise
    except Exception as exc:
        print(
            "[predict] Prediction failed",
            {
                "modelVersion": version,
                "error": str(exc),
            },
        )
        raise HTTPException(status_code=500, detail="Prediction failed") from exc
