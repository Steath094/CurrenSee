import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const PLAN_USAGE_LIMITS = {
    free: 100,
    pro: 10000,
} as const;

function createToken(userId: unknown) {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET environment variable.");
    }

    return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
}

function toPublicUser(user: InstanceType<typeof User>) {
    const { password, __v, ...publicUser } = user.toObject();

    return publicUser;
}

function getRequestUserId(req: Request) {
    if (!req.userId) {
        throw new Error("Authenticated user id is missing.");
    }

    return req.userId;
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: toPublicUser(user),
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            name,
            password: hashedPassword,
        });

        await user.save();

        const token = createToken(user._id);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: toPublicUser(user),
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(getRequestUserId(req));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user: toPublicUser(user) });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = getRequestUserId(req);
        const { allowTrainingData, email, name, password } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                _id: { $ne: userId },
                email,
            });

            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }

            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (allowTrainingData !== undefined) {
            user.allowTrainingData = Boolean(allowTrainingData);
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: toPublicUser(user),
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsageLimit = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(getRequestUserId(req));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const plan = user.plan as keyof typeof PLAN_USAGE_LIMITS;
        const limit = PLAN_USAGE_LIMITS[plan] ?? PLAN_USAGE_LIMITS.free;
        const used = user.dailyUsageCount;

        return res.status(200).json({
            usage: {
                limit,
                plan: user.plan,
                remaining: Math.max(limit - used, 0),
                resetAt: user.lastUsageReset,
                used,
            },
        });
    } catch (error) {
        console.error("Usage limit error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
