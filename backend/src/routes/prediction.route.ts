import { Router } from "express";
import {
    getPrediction,
    getUserPredictionPreview,
    getUserPredictions,
    updateIsCorrect,
} from "../controllers/prediction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { usageLimitMiddleware } from "../middlewares/usage.middleware";

const route = Router();

route.post(
    "/",
    authMiddleware,
    usageLimitMiddleware,
    upload.single("predictionImage"),
    getPrediction,
);
route.get("/", authMiddleware, getUserPredictions);
route.get("/preview", authMiddleware, getUserPredictionPreview);
route.patch("/:predictionId/feedback", authMiddleware, updateIsCorrect);

export default route;
