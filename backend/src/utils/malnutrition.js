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

function interpolateHeightCutoff(ageMonths) {
  // Reference cutoffs for height-for-age (cm)
  const pts = [
    { m: 0, severe: 42.0, moderate: 45.0 },
    { m: 6, severe: 58.0, moderate: 61.0 },
    { m: 12, severe: 67.0, moderate: 70.0 },
    { m: 24, severe: 76.0, moderate: 80.0 },
    { m: 36, severe: 84.0, moderate: 88.0 },
    { m: 48, severe: 91.0, moderate: 96.0 },
    { m: 60, severe: 97.0, moderate: 103.0 }
  ];
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

export function classifyGrowth({ dob, measuredAt, weightKg, heightCm }) {
  const ageMonths = monthsBetween(dob, measuredAt);
  const weightCutoff = interpolateCutoff(ageMonths);
  const heightCutoff = interpolateHeightCutoff(ageMonths);

  const reasons = [];
  let isSevere = false;
  let isModerate = false;

  // 1. Underweight classification (Weight-for-Age)
  if (weightKg < weightCutoff.severe) {
    isSevere = true;
    reasons.push("Severe Underweight");
  } else if (weightKg < weightCutoff.moderate) {
    isModerate = true;
    reasons.push("Underweight");
  }

  // 2. Stunting classification (Height-for-Age)
  if (heightCm) {
    if (heightCm < heightCutoff.severe) {
      isSevere = true;
      reasons.push("Severe Stunting");
    } else if (heightCm < heightCutoff.moderate) {
      isModerate = true;
      reasons.push("Stunting");
    }
  }

  // 3. Wasting & Overweight classification (Weight-for-Height / BMI)
  if (weightKg && heightCm) {
    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    if (bmi < 11.5) {
      isSevere = true;
      reasons.push("Severe Wasting");
    } else if (bmi < 13.0) {
      isModerate = true;
      reasons.push("Wasting");
    } else if (bmi > 18.0) {
      isModerate = true;
      reasons.push("Overweight");
    }
  }

  let status = "NORMAL";
  if (isSevere) status = "SEVERE";
  else if (isModerate) status = "MODERATE";

  if (reasons.length === 0) {
    reasons.push("Healthy / Normal Growth");
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

