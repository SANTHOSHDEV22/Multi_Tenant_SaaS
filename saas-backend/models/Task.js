const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
      default: "",
    },

    status: {
      type: String,
      enum: ["Not Assigned", "In-Progress", "Completed"],
      default: "Not Assigned",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔥 Indexing for performance (important for SaaS)
 */
taskSchema.index({ companyId: 1, projectId: 1 });
taskSchema.index({ companyId: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Task", taskSchema);