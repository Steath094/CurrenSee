import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function getCloudinaryClient() {
    if (!isConfigured) {
        const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } =
            process.env;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            throw new Error("Missing Cloudinary environment variables.");
        }

        cloudinary.config({
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
            cloud_name: CLOUDINARY_CLOUD_NAME,
            secure: true,
        });

        isConfigured = true;
    }

    return cloudinary;
}
