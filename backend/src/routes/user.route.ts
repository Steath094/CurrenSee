import { Router } from "express"
import { getProfile, getUsageLimit, login, register, updateProfile } from "../controllers/user.controller"
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();

route.post("/login", login);
route.post("/register", register);
route.get("/profile", authMiddleware, getProfile);
route.put("/profile", authMiddleware, updateProfile);
route.get("/usage-limit", authMiddleware, getUsageLimit);


export default route;
