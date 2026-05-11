import { Router } from "express"
import { getProfile, getUsageLimit, login, logout, register, updateProfile } from "../controllers/user.controller"
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();

route.post("/login", login);
route.post("/register", register);
route.post("/logout", authMiddleware, logout);
route.get("/profile", authMiddleware, getProfile);
route.put("/profile", authMiddleware, updateProfile);
route.get("/usage-limit", authMiddleware, getUsageLimit);


export default route;
