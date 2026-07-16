import Alert from "../models/Alert.js";

function applyScopeFilter(req, filter) {
  if (req.user.role === "ADMIN") return filter;
  if (req.user.role === "WORKER") return { ...filter, centerId: req.user.centerId };
  if (req.user.role === "SUPERVISOR" && req.user.centerId) return { ...filter, centerId: req.user.centerId };
  return filter;
}

export async function listAlerts(req, res) {
  const { status, type, centerId, childId } = req.query;

  let filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (centerId) filter.centerId = centerId;
  if (childId) filter.childId = childId;

  filter = applyScopeFilter(req, filter);

  const alerts = await Alert.find(filter)
    .sort({ createdAt: -1 })
    .populate("childId", "name childId latestStatus")
    .populate("centerId", "name code")
    .lean();

  return res.json({ alerts });
}

export async function acknowledgeAlert(req, res) {
  const { id } = req.params;
  const alert = await Alert.findById(id);
  if (!alert) return res.status(404).json({ message: "Alert not found" });

  if (req.user.role === "SUPERVISOR" && req.user.centerId) {
    if (String(req.user.centerId) !== String(alert.centerId)) {
      return res.status(403).json({ message: "Forbidden: out of center scope" });
    }
  }

  if (alert.status !== "OPEN") return res.status(400).json({ message: "Only OPEN alerts can be acknowledged" });

  alert.status = "ACKNOWLEDGED";
  alert.acknowledgedBy = req.user.id;
  alert.acknowledgedAt = new Date();
  await alert.save();

  return res.json({ alert });
}

export async function resolveAlert(req, res) {
  const { id } = req.params;
  const alert = await Alert.findById(id);
  if (!alert) return res.status(404).json({ message: "Alert not found" });

  if (req.user.role === "SUPERVISOR" && req.user.centerId) {
    if (String(req.user.centerId) !== String(alert.centerId)) {
      return res.status(403).json({ message: "Forbidden: out of center scope" });
    }
  }

  if (alert.status === "RESOLVED") return res.status(400).json({ message: "Alert already resolved" });

  alert.status = "RESOLVED";
  alert.resolvedBy = req.user.id;
  alert.resolvedAt = new Date();
  await alert.save();

  return res.json({ alert });
}

