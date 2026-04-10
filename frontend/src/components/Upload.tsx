import axios from 'axios';
import React, { useState } from 'react'

function Upload() {
    const [predictionImage, setPredictionImage] = useState<File | null>(null);
    const [result,setResult] = useState<any>(null);
    const [errRes,setErrRes] = useState({ error: false,message: ""});
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPredictionImage(file);
        }
    };
    const handleOnClick = async (e: any) => {
        if (!predictionImage) return;
        try {
            const formData = new FormData();
            formData.append('predictionImage', predictionImage);
            const reponse = await axios.post("http://localhost:8080/api/predict",formData)
            setResult(reponse.data);
        } catch (error:any) {
            setErrRes({
                error: true,
                message: error.message || "Something Went Wrong"
            })
        }
    }
  return (
    <>  
        <input type="file" id="predictionImage" name="Prediction Image" onChange={handleFileChange}></input>
        <button onClick={handleOnClick}>Upload</button>
        {result && <div>
            message: {result.message}
            prediction: {result.prediction}
        </div>}
        {errRes.error && <div style={{backgroundColor: "red", color: "white", width: "150px", height: "50px"}}>
            {errRes.message} 
        </div>}
    </>
  )
}

export default Upload