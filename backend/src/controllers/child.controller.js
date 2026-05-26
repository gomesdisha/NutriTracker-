import Child from "../models/Child.js";
import Center from "../models/Center.js";
import { generateChildId } from "../utils/childId.js";

function applyScopeFilter(req, filter) {
  if (req.user.role === "ADMIN") return filter;
  if (req.user.role === "WORKER") return { ...filter, centerId: req.user.centerId };
  // SUPERVISOR: if assigned a center, scope; else allow all
  if (req.user.role === "SUPERVISOR" && req.user.centerId) return { ...filter, centerId: req.user.centerId };
  return filter;
}

export async function createChild(req, res) {
  // Worker can only create within their own center
  if (req.user.role === "WORKER" && String(req.user.centerId) !== String(req.body.centerId)) {
    return res.status(403).json({ message: "Forbidden: out of center scope" });
  }

  const center = await Center.findById(req.body.centerId).lean();
  if (!center) return res.status(400).json({ message: "Invalid centerId" });

  const child = await Child.create({
    ...req.body,
    childId: generateChildId(center.code),
    registeredBy: req.user.id
  });

  return res.status(201).json({ child });
}

export async function listChildren(req, res) {
  const { q, status, centerId } = req.query;

  let filter = { isActive: true };
  if (status) filter.latestStatus = status;
  if (centerId) filter.centerId = centerId;

  filter = applyScopeFilter(req, filter);

  if (q) {
    filter.$or = [{ name: new RegExp(String(q).trim(), "i") }, { childId: new RegExp(String(q).trim(), "i") }];
  }

  const children = await Child.find(filter)
    .sort({ updatedAt: -1 })
    .populate("centerId", "name code")
    .lean();

  return res.json({ children });
}

export async function getChild(req, res) {
  const { id } = req.params;
  const child = await Child.findById(id).populate("centerId", "name code").lean();
  if (!child) return res.status(404).json({ message: "Child not found" });

  if (req.user.role === "WORKER" && String(req.user.centerId) !== String(child.centerId?._id || child.centerId)) {
    return res.status(403).json({ message: "Forbidden: out of center scope" });
  }
  if (req.user.role === "SUPERVISOR" && req.user.centerId) {
    if (String(req.user.centerId) !== String(child.centerId?._id || child.centerId)) {
      return res.status(403).json({ message: "Forbidden: out of center scope" });
    }
  }

  return res.json({ child });
}

export async function updateChild(req, res) {
  const { id } = req.params;
  const child = await Child.findById(id).lean();
  if (!child) return res.status(404).json({ message: "Child not found" });

  if (req.user.role === "WORKER" && String(req.user.centerId) !== String(child.centerId)) {
    return res.status(403).json({ message: "Forbidden: out of center scope" });
  }

  const updated = await Child.findByIdAndUpdate(id, req.body, { new: true }).lean();
  return res.json({ child: updated });
}

