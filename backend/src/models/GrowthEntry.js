import mongoose from "mongoose";

const growthEntrySchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true, index: true },

    measuredAt: { type: Date, required: true, index: true },
    heightCm: { type: Number, required: true, min: 30, max: 130 },
    weightKg: { type: Number, required: true, min: 1, max: 40 },

    // Computed at write time for repeatable analytics
    ageMonths: { type: Number, required: true, min: 0, max: 72, index: true },
    status: { type: String, required: true, enum: ["NORMAL", "MODERATE", "SEVERE"], index: true },
    reasons: { type: [String], default: [] },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

growthEntrySchema.index({ childId: 1, measuredAt: -1 });
growthEntrySchema.index({ centerId: 1, measuredAt: -1 });

export default mongoose.model("GrowthEntry", growthEntrySchema);

