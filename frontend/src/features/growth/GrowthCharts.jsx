import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

const statusColor = (status) =>
  status === "SEVERE" ? "#dc3545" : status === "MODERATE" ? "#ffc107" : "#198754";

function getWhoMedians(ageMonths) {
  const weightPts = [
    { m: 0, v: 3.3 },
    { m: 6, v: 7.9 },
    { m: 12, v: 9.6 },
    { m: 24, v: 12.2 },
    { m: 36, v: 14.3 },
    { m: 48, v: 16.3 },
    { m: 60, v: 18.3 }
  ];
  
  const heightPts = [
    { m: 0, v: 50.0 },
    { m: 6, v: 67.0 },
    { m: 12, v: 76.0 },
    { m: 24, v: 87.0 },
    { m: 36, v: 96.0 },
    { m: 48, v: 103.0 },
    { m: 60, v: 110.0 }
  ];

  const interpolate = (pts, age) => {
    if (age <= pts[0].m) return pts[0].v;
    if (age >= pts[pts.length - 1].m) return pts[pts.length - 1].v;
    let i = 0;
    while (i < pts.length - 1 && !(age >= pts[i].m && age <= pts[i + 1].m)) i++;
    const left = pts[i];
    const right = pts[i + 1];
    const t = (age - left.m) / (right.m - left.m);
    return left.v + (right.v - left.v) * t;
  };

  return {
    whoWeight: Number(interpolate(weightPts, ageMonths).toFixed(1)),
    whoHeight: Number(interpolate(heightPts, ageMonths).toFixed(1))
  };
}

export default function GrowthCharts({ history }) {
  const data = (history || []).map((e) => {
    const medians = getWhoMedians(e.ageMonths || 0);
    return {
      date: new Date(e.measuredAt).toLocaleDateString(),
      weightKg: e.weightKg,
      heightCm: e.heightCm,
      status: e.status,
      whoWeightMedian: medians.whoWeight,
      whoHeightMedian: medians.whoHeight
    };
  });

  const latest = data.length ? data[data.length - 1] : null;

  return (
    <div className="row g-3">
      {/* Weight Chart */}
      <div className="col-12 col-lg-6">
        <div className="card nt-card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="mb-2 fw-bold text-slate-800">Weight trend vs WHO Median</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, (dataMax) => Math.max(10, Math.ceil(dataMax) + 2)]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="weightKg" stroke="#0d6efd" strokeWidth={3} name="Recorded Weight (kg)" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="whoWeightMedian" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} name="WHO Std Median" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {latest && (
              <div className="mt-2 small text-slate-600">
                Latest status:{" "}
                <span className="fw-bold" style={{ color: statusColor(latest.status) }}>
                  {latest.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Height Chart */}
      <div className="col-12 col-lg-6">
        <div className="card nt-card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="mb-2 fw-bold text-slate-800">Height trend vs WHO Median</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, (dataMax) => Math.max(80, Math.ceil(dataMax) + 5)]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="heightCm" stroke="#10b981" strokeWidth={3} name="Recorded Height (cm)" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="whoHeightMedian" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} name="WHO Std Median" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
