import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true, index: true },

    type: { type: String, required: true, enum: ["SEVERE_MALNUTRITION", "NO_IMPROVEMENT"] },
    severity: { type: String, required: true, enum: ["HIGH", "MEDIUM"] },
    message: { type: String, required: true, trim: true, maxlength: 500 },

    growthEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "GrowthEntry", default: null },

    status: { type: String, enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"], default: "OPEN", index: true },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acknowledgedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ centerId: 1, status: 1 });
alertSchema.index({ childId: 1, type: 1, status: 1 });

export default mongoose.model("Alert", alertSchema);

