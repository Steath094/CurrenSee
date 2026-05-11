import type { UploadApiResponse } from "cloudinary";
import { getCloudinaryClient } from "../config/cloudinary";

const PREDICTION_IMAGE_FOLDER = "currensee/predictions";

function uploadBuffer(buffer: Buffer, originalName: string) {
    const cloudinary = getCloudinaryClient();

    return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: PREDICTION_IMAGE_FOLDER,
                resource_type: "image",
                secure: true,
                use_filename: true,
                unique_filename: true,
                filename_override: originalName,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload returned no result."));
                    return;
                }

                resolve(result);
            },
        );

        uploadStream.end(buffer);
    });
}

export async function uploadPredictionImage(file: Express.Multer.File) {
    const cloudinary = getCloudinaryClient();

    console.log("[storage] Uploading prediction image to Cloudinary", {
        originalName: file.originalname,
    });

    const result = file.buffer
        ? await uploadBuffer(file.buffer, file.originalname)
        : await cloudinary.uploader.upload(file.path, {
            folder: PREDICTION_IMAGE_FOLDER,
            resource_type: "image",
            secure: true,
            use_filename: true,
            unique_filename: true,
            filename_override: file.originalname,
        });

    console.log("[storage] Cloudinary upload completed", {
        publicId: result.public_id,
    });

    return result.secure_url;
}
