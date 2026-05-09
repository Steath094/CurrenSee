import mongoose from "mongoose";

const modelConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    version: {
      type: String,
      required: true,
      unique: true,
    },

    endpoint: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ModelConfig = mongoose.model(
  "ModelConfig",
  modelConfigSchema
);