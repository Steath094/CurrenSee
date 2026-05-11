import mongoose from "mongoose";
import { Feedback } from "../models/feedback.model";
import { Prediction } from "../models/prediction.model";

export class FeedbackServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
    }
}

type SubmitFeedbackParams = {
    correctedLabel?: string;
    predictionId: string;
    userId: string;
    wasCorrect: boolean;
};

function getObjectId(value: string, message: string) {
    if (!mongoose.isValidObjectId(value)) {
        throw new FeedbackServiceError(message, 400);
    }

    return new mongoose.Types.ObjectId(value);
}

export async function submitPredictionFeedback({
    correctedLabel,
    predictionId,
    userId,
    wasCorrect,
}: SubmitFeedbackParams) {
    const predictionObjectId = getObjectId(predictionId, "Invalid predictionId");
    const userObjectId = getObjectId(userId, "Invalid user id");
    const normalizedCorrectedLabel = correctedLabel?.trim();

    if (wasCorrect === false && !normalizedCorrectedLabel) {
        throw new FeedbackServiceError(
            "correctedLabel is required when wasCorrect is false",
            400,
        );
    }

    const prediction = await Prediction.findOne({
        _id: predictionObjectId,
        userId: userObjectId,
    });

    if (!prediction) {
        throw new FeedbackServiceError("Prediction not found", 404);
    }

    const feedback = await Feedback.findOneAndUpdate(
        {
            predictionId: predictionObjectId,
            userId: userObjectId,
        },
        {
            correctedLabel: wasCorrect ? null : normalizedCorrectedLabel,
            predictionId: predictionObjectId,
            userId: userObjectId,
            wasCorrect,
        },
        {
            new: true,
            setDefaultsOnInsert: true,
            upsert: true,
        },
    );

    prediction.isCorrect = wasCorrect;
    await prediction.save();

    return feedback;
}
