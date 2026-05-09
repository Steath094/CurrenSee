import axios from "axios";
import type { Request, Response } from "express";
import FormData from "form-data";
import mongoose from "mongoose";
import fs from "node:fs";
import { Prediction } from "../models/prediction.model";

type ModelPredictionResponse = {
    confidence?: number | string;
    denomination?: string;
    error?: unknown;
};

type ParsedPredictionResponse =
    | {
        confidence: number;
        denomination: string;
        ok: true;
    }
    | {
        message: string;
        ok: false;
    };

function getAuthenticatedUserObjectId(req: Request, res: Response) {
    if (!req.userId) {
        res.status(401).json({ message: "Authentication required" });
        return undefined;
    }

    if (!mongoose.isValidObjectId(req.userId)) {
        res.status(401).json({ message: "Invalid authentication token" });
        return undefined;
    }

    return new mongoose.Types.ObjectId(req.userId);
}

function parseModelPrediction(data: ModelPredictionResponse): ParsedPredictionResponse {
    if (data.error) {
        return {
            message:
                typeof data.error === "string"
                    ? data.error
                    : "Prediction service returned an error",
            ok: false,
        };
    }

    const confidence =
        typeof data.confidence === "number"
            ? data.confidence
            : typeof data.confidence === "string"
                ? Number.parseFloat(data.confidence)
                : Number.NaN;

    if (!data.denomination || !Number.isFinite(confidence)) {
        return {
            message: "Prediction service returned an invalid response",
            ok: false,
        };
    }

    return {
        confidence,
        denomination: data.denomination,
        ok: true,
    };
}

function getPositiveInteger(value: unknown, fallback: number) {
    const parsed = Number.parseInt(String(value ?? fallback), 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getErrorDetails(error: unknown) {
    if (axios.isAxiosError(error)) {
        return error.response?.data || error.message;
    }

    return error instanceof Error ? error.message : error;
}

export const getPrediction = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserObjectId(req, res);

        if (!userId) {
            return;
        }

        console.log("[predict] Request received");

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const formData = new FormData();

        if (req.file.buffer) {
            formData.append("file", req.file.buffer, req.file.originalname);
        } else if (req.file.path) {
            formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);
        } else {
            return res.status(400).json({ message: "Uploaded file is invalid" });
        }

        console.log("[predict] Sending request to FastAPI");

        const response = await axios.post<ModelPredictionResponse>(
            "http://localhost:8000/predict",
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 10000,
            },
        );

        console.log("[predict] Response received from FastAPI", response.data);

        const modelPrediction = parseModelPrediction(response.data);

        if (!modelPrediction.ok) {
            return res.status(502).json({
                message: "Failed to get prediction",
                error: modelPrediction.message,
            });
        }

        const prediction = await Prediction.create({
            userId,
            imageUrl: req.file.filename,
            denomination: modelPrediction.denomination,
            confidence: modelPrediction.confidence,
        });

        return res.status(200).json({
            confidence: modelPrediction.confidence,
            denomination: modelPrediction.denomination,
            predictionId: prediction._id,
        });
    } catch (error) {
        const details = getErrorDetails(error);
        console.error("[predict] Prediction request failed", details);

        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || 502).json({
                message: "Failed to get prediction",
                error: details,
            });
        }

        return res.status(500).json({
            message: "Failed to get prediction",
            error: "Internal server error",
        });
    }
};

export const updateIsCorrect = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserObjectId(req, res);

        if (!userId) {
            return;
        }

        const { predictionId } = req.params;
        const { isCorrect } = req.body;

        if (!mongoose.isValidObjectId(predictionId)) {
            return res.status(400).json({ message: "Invalid prediction id" });
        }

        if (typeof isCorrect !== "boolean") {
            return res.status(400).json({ message: "isCorrect must be a boolean" });
        }

        const prediction = await Prediction.findById(predictionId);

        if (!prediction) {
            return res.status(404).json({ message: "Prediction not found" });
        }

        if (prediction.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        prediction.isCorrect = isCorrect;
        await prediction.save();

        return res.status(200).json({
            message: "Feedback updated successfully",
            prediction,
        });
    } catch (error) {
        console.error("Feedback update error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserPredictionPreview = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserObjectId(req, res);

        if (!userId) {
            return;
        }

        const predictions = await Prediction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({ predictions });
    } catch (error) {
        console.error("Get user prediction preview error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserPredictions = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserObjectId(req, res);

        if (!userId) {
            return;
        }

        const page = getPositiveInteger(req.query.page, 1);
        const limit = Math.min(getPositiveInteger(req.query.limit, 10), 100);
        const skip = (page - 1) * limit;

        const [predictions, total] = await Promise.all([
            Prediction.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Prediction.countDocuments({ userId }),
        ]);

        return res.status(200).json({
            pagination: {
                limit,
                page,
                total,
                totalPages: Math.ceil(total / limit),
            },
            predictions,
        });
    } catch (error) {
        console.error("Get user predictions error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
