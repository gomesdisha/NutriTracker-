import Child from "../models/Child.js";
import GrowthEntry from "../models/GrowthEntry.js";
import Alert from "../models/Alert.js";
import { classifyGrowth, shouldAlertNoImprovement } from "../utils/malnutrition.js";

async function upsertOpenAlert({ childId, centerId, type, severity, message, growthEntryId }) {
  await Alert.updateOne(
    { childId, centerId, type, status: "OPEN" },
    {
      $set: {
        severity,
        message,
        growthEntryId
      }
    },
    { upsert: true }
  );
}

export async function addGrowthEntry(req, res) {
  const { childId, measuredAt, heightCm, weightKg } = req.body;

  const child = await Child.findById(childId);
  if (!child || !child.isActive) return res.status(404).json({ message: "Child not found" });

  if (req.user.role === "WORKER" && String(req.user.centerId) !== String(child.centerId)) {
    return res.status(403).json({ message: "Forbidden: out of center scope" });
  }

  const { status, reasons, ageMonths } = classifyGrowth({
    dob: child.dob,
    measuredAt,
    weightKg,
    heightCm
  });

  const entry = await GrowthEntry.create({
    childId: child._id,
    centerId: child.centerId,
    measuredAt: new Date(measuredAt),
    heightCm,
    weightKg,
    ageMonths,
    status,
    reasons,
    createdBy: req.user.id
  });

  // Denormalize latest status to speed up dashboards
  child.latestStatus = status;
  child.latestMeasuredAt = entry.measuredAt;
  await child.save();

  // Alert: severe malnutrition
  if (status === "SEVERE") {
    await upsertOpenAlert({
      childId: child._id,
      centerId: child.centerId,
      type: "SEVERE_MALNUTRITION",
      severity: "HIGH",
      message: `Severe malnutrition detected for ${child.name} (${child.childId}).`,
      growthEntryId: entry._id
    });
  }

  // Alert: no improvement in last 3 entries
  const last3 = await GrowthEntry.find({ childId: child._id })
    .sort({ measuredAt: -1 })
    .select("measuredAt weightKg status")
    .limit(3)
    .lean();

  const last3Asc = [...last3].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  if (shouldAlertNoImprovement(last3Asc)) {
    await upsertOpenAlert({
      childId: child._id,
      centerId: child.centerId,
      type: "NO_IMPROVEMENT",
      severity: "MEDIUM",
      message: `No improvement across last 3 entries for ${child.name} (${child.childId}).`,
      growthEntryId: entry._id
    });
  }

  return res.status(201).json({ growthEntry: entry });
}

export async function listChildGrowth(req, res) {
  const { childId } = req.params;

  const child = await Child.findById(childId).lean();
  if (!child) return res.status(404).json({ message: "Child not found" });

  if (req.user.role === "WORKER" && String(req.user.centerId) !== String(child.centerId)) {
    return res.status(403).json({ message: "Forbidden: out of center scope" });
  }
  if (req.user.role === "SUPERVISOR" && req.user.centerId) {
    if (String(req.user.centerId) !== String(child.centerId)) {
      return res.status(403).json({ message: "Forbidden: out of center scope" });
    }
  }

  const history = await GrowthEntry.find({ childId }).sort({ measuredAt: 1 }).lean();
  return res.json({ child, history });
}

