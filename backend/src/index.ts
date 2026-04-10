import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hi");
})


import prediction from "./routes/prediction.route";
app.use("/api/predict",prediction);
app.listen(PORT,()=>{
    console.log(`Backend Running on http://localhost:${PORT}`);
})
