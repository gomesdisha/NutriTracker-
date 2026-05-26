import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    childId: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    dob: { type: Date, required: true, index: true },
    gender: { type: String, required: true, enum: ["M", "F", "O"], index: true },

    parent: {
      fatherName: { type: String, default: "", trim: true, maxlength: 140 },
      motherName: { type: String, default: "", trim: true, maxlength: 140 },
      phone: { type: String, default: "", trim: true, maxlength: 20 },
      address: { type: String, default: "", trim: true, maxlength: 500 }
    },

    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true, index: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Denormalized latest status for dashboards
    latestStatus: { type: String, enum: ["NORMAL", "MODERATE", "SEVERE"], default: "NORMAL", index: true },
    latestMeasuredAt: { type: Date, default: null, index: true },

    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

childSchema.index({ centerId: 1, latestStatus: 1 });
childSchema.index({ centerId: 1, name: 1 });

export default mongoose.model("Child", childSchema);

