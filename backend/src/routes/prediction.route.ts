import { Router } from "express"
import { getPrediction } from "../controllers/prediction.controller"
import { upload } from "../middlewares/multer.middleware"
const route = Router();

route.post("/",upload.single("predictionImage"),getPrediction)


export default route;