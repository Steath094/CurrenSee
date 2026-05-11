import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    modelVersion: {
      type: String,
      default: "v1",
    },

    denomination: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    isCorrect: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ userId: 1, createdAt: -1 });

export const Prediction = mongoose.model(
  "Prediction",
  predictionSchema
);
