import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    dailyUsageCount: {
      type: Number,
      default: 0,
    },

    lastUsageReset: {
      type: Date,
      default: Date.now,
    },

    allowTrainingData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);