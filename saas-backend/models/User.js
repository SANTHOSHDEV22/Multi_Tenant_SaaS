const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);