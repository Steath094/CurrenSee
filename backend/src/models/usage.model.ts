import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestCount: {
      type: Number,
      default: 0,
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

usageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Usage = mongoose.model("Usage", usageSchema);