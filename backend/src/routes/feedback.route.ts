import { Router } from "express";
import { createFeedback } from "../controllers/feedback.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();

route.post("/", authMiddleware, createFeedback);

export default route;
