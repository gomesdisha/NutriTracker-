import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "WORKER", "SUPERVISOR"],
      index: true
    },

    // Used to scope worker/supervisor access
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", default: null, index: true },

    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

