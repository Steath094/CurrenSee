import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prediction",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    wasCorrect: {
      type: Boolean,
      required: true,
    },

    correctedLabel: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ predictionId: 1, userId: 1 }, { unique: true });

export const Feedback = mongoose.model(
  "Feedback",
  feedbackSchema
);
