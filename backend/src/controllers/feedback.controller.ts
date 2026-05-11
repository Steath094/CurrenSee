import type { Request, Response } from "express";
import {
    FeedbackServiceError,
    submitPredictionFeedback,
} from "../services/feedback.service";

export const createFeedback = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { correctedLabel, predictionId, wasCorrect } = req.body;

        if (typeof predictionId !== "string" || !predictionId.trim()) {
            return res.status(400).json({ message: "predictionId is required" });
        }

        if (typeof wasCorrect !== "boolean") {
            return res.status(400).json({ message: "wasCorrect must be a boolean" });
        }

        const feedbackPayload = {
            predictionId,
            userId: req.userId,
            wasCorrect,
        };
        const feedback =
            typeof correctedLabel === "string"
                ? await submitPredictionFeedback({
                    ...feedbackPayload,
                    correctedLabel,
                })
                : await submitPredictionFeedback(feedbackPayload);

        console.log("[feedback] Feedback saved", {
            predictionId,
            userId: req.userId,
            wasCorrect,
        });

        return res.status(201).json({
            feedbackId: feedback._id,
            message: "Feedback saved successfully",
        });
    } catch (error) {
        if (error instanceof FeedbackServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        console.error("[feedback] Failed to save feedback", error);

        return res.status(500).json({
            message: "Failed to save feedback",
        });
    }
};
