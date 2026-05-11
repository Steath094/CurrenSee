import type { Request, Response } from "express";
import { getActiveModelSummaries } from "../services/modelConfig.service";

export const getModels = async (_req: Request, res: Response) => {
    try {
        const models = await getActiveModelSummaries();

        return res.status(200).json(models);
    } catch (error) {
        console.error("[models] Failed to fetch model list", error);

        return res.status(500).json({
            message: "Failed to fetch models",
        });
    }
};
