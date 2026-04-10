import type { Request, Response } from "express";

export const getPrediction = (req: Request,res: Response) => {
    res.status(200).json({
        message: "Working it seems",
        prediction : Math.ceil(Math.random()*100)
    })
}

