import mongoose from "mongoose";
import Child from "../models/Child.js";
import Alert from "../models/Alert.js";
import GrowthEntry from "../models/GrowthEntry.js";
import Center from "../models/Center.js";

function parseMonth(monthStr) {
  // monthStr = "YYYY-MM"
  if (!monthStr) return null;
  const [y, m] = String(monthStr).split("-").map((x) => Number(x));
  if (!y || !m || m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end, y, m };
}

function scopeCenterIds(req) {
  if (req.user.role === "ADMIN") return null; // all
  if (req.user.role === "SUPERVISOR" && req.user.centerId) return [new mongoose.Types.ObjectId(req.user.centerId)];
  return null;
}

export async function summary(req, res) {
  const month = parseMonth(req.query.month);
  const centerScope = scopeCenterIds(req);

  const childFilter = { isActive: true };
  if (centerScope) childFilter.centerId = { $in: centerScope };

  const [totalChildren, severeCount, moderateCount] = await Promise.all([
    Child.countDocuments(childFilter),
    Child.countDocuments({ ...childFilter, latestStatus: "SEVERE" }),
    Child.countDocuments({ ...childFilter, latestStatus: "MODERATE" })
  ]);

  const alertFilter = { status: "OPEN" };
  if (centerScope) alertFilter.centerId = { $in: centerScope };
  const openAlerts = await Alert.countDocuments(alertFilter);

  // Center-wise severe/moderate counts
  const centerWiseAgg = await Child.aggregate([
    { $match: childFilter },
    {
      $group: {
        _id: { centerId: "$centerId", status: "$latestStatus" },
        count: { $sum: 1 }
      }
    }
  ]);

  const centerIds = [...new Set(centerWiseAgg.map((x) => String(x._id.centerId)))];
  const centers = await Center.find({ _id: { $in: centerIds } }).select("name code").lean();
  const centerMap = new Map(centers.map((c) => [String(c._id), c]));

  const centerWise = [];
  const byCenter = new Map();
  for (const row of centerWiseAgg) {
    const cId = String(row._id.centerId);
    const entry = byCenter.get(cId) || { centerId: cId, centerName: centerMap.get(cId)?.name || "Unknown", severe: 0, moderate: 0 };
    if (row._id.status === "SEVERE") entry.severe = row.count;
    if (row._id.status === "MODERATE") entry.moderate = row.count;
    byCenter.set(cId, entry);
  }
  for (const v of byCenter.values()) centerWise.push(v);
  centerWise.sort((a, b) => (b.severe + b.moderate) - (a.severe + a.moderate));

  // Monthly trend: last 6 months (by growth entries)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
  }

  const start6 = new Date(Date.UTC(months[0].y, months[0].m - 1, 1));
  const end6 = new Date(Date.UTC(months[months.length - 1].y, months[months.length - 1].m, 1));

  const geFilter = { measuredAt: { $gte: start6, $lt: end6 } };
  if (centerScope) geFilter.centerId = { $in: centerScope };

  const trendAgg = await GrowthEntry.aggregate([
    { $match: geFilter },
    {
      $group: {
        _id: { y: { $year: "$measuredAt" }, m: { $month: "$measuredAt" }, status: "$status" },
        count: { $sum: 1 }
      }
    }
  ]);

  const trendMap = new Map();
  for (const row of trendAgg) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, "0")}`;
    const cur = trendMap.get(key) || { month: key, severe: 0, moderate: 0, normal: 0 };
    if (row._id.status === "SEVERE") cur.severe = row.count;
    if (row._id.status === "MODERATE") cur.moderate = row.count;
    if (row._id.status === "NORMAL") cur.normal = row.count;
    trendMap.set(key, cur);
  }

  const monthlyTrend = months.map(({ y, m }) => {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    return trendMap.get(key) || { month: key, severe: 0, moderate: 0, normal: 0 };
  });

  // Optional: month window stats (if provided)
  let monthWindow = null;
  if (month) {
    const wf = { measuredAt: { $gte: month.start, $lt: month.end } };
    if (centerScope) wf.centerId = { $in: centerScope };
    const entriesThisMonth = await GrowthEntry.countDocuments(wf);
    monthWindow = { month: `${month.y}-${String(month.m).padStart(2, "0")}`, entriesThisMonth };
  }

  return res.json({
    totalChildren,
    severeCount,
    moderateCount,
    openAlerts,
    centerWise,
    monthlyTrend,
    monthWindow
  });
}

