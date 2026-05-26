import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard.jsx";
import axios from "../../api/axios.js";
import GrowthTrendChart from "../growth/GrowthTrendChart.jsx";

export default function SupervisorDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const month = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const { data } = await axios.get(`/supervisor/summary?month=${month}`);
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load summary");
      }
    })();
  }, [month]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return <div className="text-muted">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">Supervisor Dashboard</h4>
          <small className="text-muted">Month: {month}</small>
        </div>
        <Link to="/supervisor/alerts" className="btn btn-outline-primary">
          View Alerts
        </Link>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3">
          <StatCard title="Total Children" value={summary.totalChildren} tone="primary" />
        </div>
        <div className="col-12 col-md-3">
          <StatCard title="Severe" value={summary.severeCount} tone="danger" />
        </div>
        <div className="col-12 col-md-3">
          <StatCard title="Moderate" value={summary.moderateCount} tone="warning" />
        </div>
        <div className="col-12 col-md-3">
          <StatCard title="Open Alerts" value={summary.openAlerts} tone="dark" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card nt-card">
            <div className="card-body">
              <h6 className="mb-2">Monthly Trend (last 6 months)</h6>
              <div style={{ height: 320 }}>
                <GrowthTrendChart data={summary.monthlyTrend || []} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card nt-card">
            <div className="card-body">
              <h6 className="mb-2">Center-wise malnutrition</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Center</th>
                      <th className="text-end">Sev</th>
                      <th className="text-end">Mod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.centerWise || []).map((c) => (
                      <tr key={c.centerId}>
                        <td className="text-truncate" style={{ maxWidth: 220 }}>
                          {c.centerName}
                        </td>
                        <td className="text-end text-danger fw-semibold">{c.severe}</td>
                        <td className="text-end text-warning fw-semibold">{c.moderate}</td>
                      </tr>
                    ))}
                    {(summary.centerWise || []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-muted">
                          No data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

