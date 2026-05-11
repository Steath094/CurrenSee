import mongoose from "mongoose";
import { Usage } from "../models/usage.model";

export const DAILY_REQUEST_LIMIT = 100;

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getNextResetAt() {
    const resetAt = new Date();
    resetAt.setUTCHours(24, 0, 0, 0);

    return resetAt;
}

function toObjectId(userId: string) {
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid user id");
    }

    return new mongoose.Types.ObjectId(userId);
}

export async function getOrCreateTodayUsage(userId: string) {
    const userObjectId = toObjectId(userId);
    const date = getTodayKey();
    const usage = await Usage.findOneAndUpdate(
        {
            date,
            userId: userObjectId,
        },
        {
            $setOnInsert: {
                date,
                requestCount: 0,
                userId: userObjectId,
            },
        },
        {
            new: true,
            setDefaultsOnInsert: true,
            upsert: true,
        },
    );

    if (!usage) {
        throw new Error("Unable to load usage");
    }

    return usage;
}

export async function getDailyUsageStatus(userId: string) {
    const usage = await getOrCreateTodayUsage(userId);
    const used = usage.requestCount;

    return {
        limit: DAILY_REQUEST_LIMIT,
        remaining: Math.max(DAILY_REQUEST_LIMIT - used, 0),
        resetAt: getNextResetAt(),
        used,
    };
}

export async function incrementTodayUsage(userId: string) {
    const userObjectId = toObjectId(userId);
    const date = getTodayKey();
    const usage = await Usage.findOneAndUpdate(
        {
            date,
            userId: userObjectId,
        },
        {
            $inc: {
                requestCount: 1,
            },
            $setOnInsert: {
                date,
                userId: userObjectId,
            },
        },
        {
            new: true,
            setDefaultsOnInsert: true,
            upsert: true,
        },
    );

    if (!usage) {
        throw new Error("Unable to increment usage");
    }

    return usage;
}
