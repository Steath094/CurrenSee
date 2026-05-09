import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("Missing MONGO_URI environment variable.");
        }

        const connectionInstance = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`\nMongoDB connected. DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;
