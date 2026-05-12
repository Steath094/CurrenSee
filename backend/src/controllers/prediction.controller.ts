import axios from "axios";
import type { Request, Response } from "express";
import FormData from "form-data";
import mongoose from "mongoose";
import fs from "node:fs";
import { Prediction } from "../models/prediction.model";
import { getActiveModelConfigByVersion } from "../services/modelConfig.service";
import { uploadPredictionImage } from "../services/storage.service";
import { incrementTodayUsage } from "../services/usage.service";

type ModelPredictionResponse = {
    confidence?: number | string;
    denomination?: string;
    error?: unknown;
    modelVersion?: string;
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

function getRequestedModelVersion(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPredictionEndpoint(configEndpoint: string) {
    if (process.env.MODEL_SERVER_PREDICT_URL) {
        return process.env.MODEL_SERVER_PREDICT_URL;
    }

    if (process.env.MODEL_SERVER_URL) {
        return `${process.env.MODEL_SERVER_URL.replace(/\/+$/, "")}/predict`;
    }

    return configEndpoint;
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

        const requestedModelVersion = getRequestedModelVersion(req.body?.modelVersion);

        if (!requestedModelVersion) {
            return res.status(400).json({ message: "modelVersion is required" });
        }

        const modelConfig = await getActiveModelConfigByVersion(requestedModelVersion);

        if (!modelConfig) {
            return res.status(400).json({
                message: "Invalid or inactive modelVersion",
            });
        }

        const formData = new FormData();

        if (req.file.buffer) {
            formData.append("file", req.file.buffer, req.file.originalname);
        } else if (req.file.path) {
            formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);
        } else {
            return res.status(400).json({ message: "Uploaded file is invalid" });
        }

        formData.append("modelVersion", modelConfig.version);

        console.log("[predict] Sending request to FastAPI", {
            modelVersion: modelConfig.version,
        });

        const predictionEndpoint = getPredictionEndpoint(modelConfig.endpoint);

        const response = await axios.post<ModelPredictionResponse>(
            predictionEndpoint,
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

        const imageUrl = await uploadPredictionImage(req.file);

        const prediction = await Prediction.create({
            userId,
            imageUrl,
            modelVersion: modelConfig.version,
            denomination: modelPrediction.denomination,
            confidence: modelPrediction.confidence,
        });

        await incrementTodayUsage(String(userId));

        return res.status(200).json({
            confidence: modelPrediction.confidence,
            denomination: modelPrediction.denomination,
            imageUrl,
            modelVersion: modelConfig.version,
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

export const getPredictionHistory = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserObjectId(req, res);

        if (!userId) {
            return;
        }

        const predictions = await Prediction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .select({
                _id: 1,
                confidence: 1,
                createdAt: 1,
                denomination: 1,
                imageUrl: 1,
                isCorrect: 1,
                modelVersion: 1,
            })
            .lean();

        return res.status(200).json({
            predictions: predictions.map((prediction) => ({
                confidence: prediction.confidence,
                createdAt: prediction.createdAt,
                denomination: prediction.denomination,
                imageUrl: prediction.imageUrl,
                isCorrect: prediction.isCorrect,
                modelVersion: prediction.modelVersion,
                predictionId: prediction._id,
            })),
        });
    } catch (error) {
        console.error("[predictions] Failed to get prediction history", error);

        return res.status(500).json({
            message: "Failed to get prediction history",
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
