import { Router } from "express";
import { getPredictionHistory } from "../controllers/prediction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();

route.get("/history", authMiddleware, getPredictionHistory);

export default route;
