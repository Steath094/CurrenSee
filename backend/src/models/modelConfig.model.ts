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

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

modelConfigSchema.index({ isActive: 1, isDefault: -1, createdAt: 1 });

export const ModelConfig = mongoose.model(
  "ModelConfig",
  modelConfigSchema
);
