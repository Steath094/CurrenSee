import type { NextFunction, Request, Response } from "express";
import { DAILY_REQUEST_LIMIT, getOrCreateTodayUsage } from "../services/usage.service";

export const usageLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const usage = await getOrCreateTodayUsage(req.userId);

        if (usage.requestCount >= DAILY_REQUEST_LIMIT) {
            console.warn("[usage] Daily request limit reached", {
                userId: req.userId,
            });

            return res.status(429).json({
                message: "Daily request limit reached",
            });
        }

        return next();
    } catch (error) {
        console.error("[usage] Failed to check daily usage", error);

        return res.status(500).json({
            message: "Failed to check usage limit",
        });
    }
};
