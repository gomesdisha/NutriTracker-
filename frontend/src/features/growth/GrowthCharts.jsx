import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const statusColor = (status) =>
  status === "SEVERE" ? "#dc3545" : status === "MODERATE" ? "#ffc107" : "#198754";

export default function GrowthCharts({ history }) {
  const data = (history || []).map((e) => ({
    date: new Date(e.measuredAt).toLocaleDateString(),
    weightKg: e.weightKg,
    heightCm: e.heightCm,
    status: e.status
  }));

  const latest = data.length ? data[data.length - 1] : null;

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="card nt-card">
          <div className="card-body">
            <h6 className="mb-2">Weight trend</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, (dataMax) => Math.max(10, dataMax + 2)]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weightKg" stroke="#0d6efd" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {latest && (
              <div className="mt-2 small">
                Latest status:{" "}
                <span className="fw-semibold" style={{ color: statusColor(latest.status) }}>
                  {latest.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card nt-card">
          <div className="card-body">
            <h6 className="mb-2">Height trend</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, (dataMax) => Math.max(80, dataMax + 5)]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="heightCm" stroke="#20c997" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

