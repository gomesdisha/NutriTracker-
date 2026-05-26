import mongoose from "mongoose";

const centerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, default: "", trim: true, maxlength: 500 },
    district: { type: String, default: "", trim: true, index: true },
    taluka: { type: String, default: "", trim: true, index: true },
    pincode: { type: String, default: "", trim: true, maxlength: 10 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("Center", centerSchema);

