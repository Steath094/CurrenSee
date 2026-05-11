import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db";

dotenv.config({ path: [".env", "src/.env"] });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hi");
});
import userRoute from "./routes/user.route";
import predictionRoute from "./routes/prediction.route";
import modelRoute from "./routes/model.route";
import predictionsRoute from "./routes/predictions.route";
import feedbackRoute from "./routes/feedback.route";

app.use("/api/user", userRoute);
app.use("/api/predict", predictionRoute);
app.use("/api/models", modelRoute);
app.use("/api/predictions", predictionsRoute);
app.use("/api/feedback", feedbackRoute);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });
