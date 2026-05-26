import Center from "../models/Center.js";

export async function createCenter(req, res) {
  const center = await Center.create(req.body);
  return res.status(201).json({ center });
}

export async function listCenters(req, res) {
  const centers = await Center.find({}).sort({ name: 1 }).lean();
  return res.json({ centers });
}

export async function updateCenter(req, res) {
  const { id } = req.params;
  const center = await Center.findByIdAndUpdate(id, req.body, { new: true });
  if (!center) return res.status(404).json({ message: "Center not found" });
  return res.json({ center });
}

