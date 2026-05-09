import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Internal server error" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};