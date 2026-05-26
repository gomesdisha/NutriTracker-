function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function monthsBetween(dob, measuredAt) {
  const a = new Date(dob);
  const b = new Date(measuredAt);
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return clamp(months, 0, 72);
}

/**
 * Simplified, deterministic cutoffs (demo) for weight-for-age (kg).
 * Replace this with full WHO reference tables for production deployments.
 */
const WEIGHT_CUTOFFS = [
  { m: 0, severe: 2.0, moderate: 2.4 },
  { m: 6, severe: 5.0, moderate: 5.7 },
  { m: 12, severe: 6.6, moderate: 7.4 },
  { m: 24, severe: 8.5, moderate: 9.6 },
  { m: 36, severe: 10.0, moderate: 11.2 },
  { m: 48, severe: 11.3, moderate: 12.7 },
  { m: 60, severe: 12.5, moderate: 14.0 }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateCutoff(ageMonths) {
  const pts = WEIGHT_CUTOFFS;
  if (ageMonths <= pts[0].m) return pts[0];
  if (ageMonths >= pts[pts.length - 1].m) return pts[pts.length - 1];

  let i = 0;
  while (i < pts.length - 1 && !(ageMonths >= pts[i].m && ageMonths <= pts[i + 1].m)) i++;

  const left = pts[i];
  const right = pts[i + 1];
  const t = (ageMonths - left.m) / (right.m - left.m);

  return {
    m: ageMonths,
    severe: lerp(left.severe, right.severe, t),
    moderate: lerp(left.moderate, right.moderate, t)
  };
}

export function classifyGrowth({ dob, measuredAt, weightKg }) {
  const ageMonths = monthsBetween(dob, measuredAt);
  const cutoff = interpolateCutoff(ageMonths);

  const reasons = [];
  let status = "NORMAL";

  if (weightKg < cutoff.severe) {
    status = "SEVERE";
    reasons.push(`Weight below severe cutoff for age (~${cutoff.severe.toFixed(1)}kg)`);
  } else if (weightKg < cutoff.moderate) {
    status = "MODERATE";
    reasons.push(`Weight below moderate cutoff for age (~${cutoff.moderate.toFixed(1)}kg)`);
  }

  return { status, reasons, ageMonths };
}

/**
 * Alert rule: "No improvement in 3 entries"
 * - status does not improve from entry1 → entry3 AND weight is not increasing.
 */
export function shouldAlertNoImprovement(last3EntriesSortedAsc) {
  if (!Array.isArray(last3EntriesSortedAsc) || last3EntriesSortedAsc.length < 3) return false;

  const [a, , c] = last3EntriesSortedAsc;
  const rank = (s) => (s === "SEVERE" ? 0 : s === "MODERATE" ? 1 : 2);

  const statusNotImproving = rank(c.status) <= rank(a.status);
  const weightNotImproving = Number(c.weightKg) <= Number(a.weightKg);

  return statusNotImproving && weightNotImproving;
}

