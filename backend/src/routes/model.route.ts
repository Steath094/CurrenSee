import { Router } from "express";
import { getModels } from "../controllers/model.controller";

const route = Router();

route.get("/", getModels);

export default route;
