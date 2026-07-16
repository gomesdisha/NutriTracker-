import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard.jsx";
import axios from "../../api/axios.js";
import GrowthTrendChart from "../growth/GrowthTrendChart.jsx";
import { X, ArrowRight } from "lucide-react";

export default function SupervisorDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  
  // Interactive Children List Filter
  const [selectedFilter, setSelectedFilter] = useState(null); // { status?: string, centerId?: string, label: string }
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

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

  // Load children when a filter is clicked
  useEffect(() => {
    if (!selectedFilter) {
      setFilteredChildren([]);
      return;
    }
    (async () => {
      setLoadingChildren(true);
      try {
        let url = "/children";
        const queryParams = [];
        if (selectedFilter.status) queryParams.push(`status=${selectedFilter.status}`);
        if (selectedFilter.centerId) queryParams.push(`centerId=${selectedFilter.centerId}`);
        
        if (queryParams.length) {
          url += `?${queryParams.join("&")}`;
        }
        const { data } = await axios.get(url);
        setFilteredChildren(data.children || []);
      } catch (err) {
        console.error("Failed to load children for filter", err);
      } finally {
        setLoadingChildren(false);
      }
    })();
  }, [selectedFilter]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return <div className="text-muted">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0 fw-bold text-slate-900">Supervisor Dashboard</h4>
          <small className="text-muted">Aggregated stats for month: {month}</small>
        </div>
        <Link to="/supervisor/alerts" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          Monitor Alerts
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards (Interactive) */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3" style={{ cursor: "pointer" }} onClick={() => setSelectedFilter({ label: "All Registered Children" })}>
          <StatCard title="Total Children (Click to view)" value={summary.totalChildren} tone="primary" />
        </div>
        <div className="col-12 col-md-3" style={{ cursor: "pointer" }} onClick={() => setSelectedFilter({ status: "SEVERE", label: "Severe Malnutrition" })}>
          <StatCard title="Severe (Click to view)" value={summary.severeCount} tone="danger" />
        </div>
        <div className="col-12 col-md-3" style={{ cursor: "pointer" }} onClick={() => setSelectedFilter({ status: "MODERATE", label: "Moderate Malnutrition" })}>
          <StatCard title="Moderate (Click to view)" value={summary.moderateCount} tone="warning" />
        </div>
        <div className="col-12 col-md-3">
          <Link to="/supervisor/alerts" style={{ textDecoration: "none" }}>
            <StatCard title="Open Alerts (Click to resolve)" value={summary.openAlerts} tone="dark" />
          </Link>
        </div>
      </div>

      {/* Filtered Children Table (Conditional) */}
      {selectedFilter && (
        <div className="card nt-card mb-4 border-0 shadow-sm" style={{ borderLeft: "4px solid var(--nt-primary)" }}>
          <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-slate-800">
              {selectedFilter.label} <span className="badge bg-teal-50 text-teal-800 ms-2">{filteredChildren.length} children</span>
            </h6>
            <button className="btn-close" onClick={() => setSelectedFilter(null)} aria-label="Close"></button>
          </div>
          <div className="card-body pt-1">
            {loadingChildren ? (
              <div className="text-muted small py-3">Loading children details...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Child Name</th>
                      <th>Child ID</th>
                      <th>Center Code</th>
                      <th>Latest Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChildren.map((c) => (
                      <tr key={c._id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td className="text-muted small">{c.childId}</td>
                        <td className="text-muted small">{c.centerId?.code || "-"}</td>
                        <td>
                          <span className={`badge ${c.latestStatus === "SEVERE" ? "bg-danger" : c.latestStatus === "MODERATE" ? "bg-warning text-dark" : "bg-success"}`}>
                            {c.latestStatus || "NORMAL"}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: "0.8rem" }} to={`/children/${c._id}`}>
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredChildren.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-muted text-center py-4">
                          No children match this criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Charts & Center Breakdowns */}
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card nt-card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3 fw-bold text-slate-800">Monthly Trend (last 6 months)</h6>
              <div style={{ height: 320 }}>
                <GrowthTrendChart data={summary.monthlyTrend || []} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card nt-card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3 fw-bold text-slate-800">Center-wise malnutrition</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Center (Click to view)</th>
                      <th className="text-end">Sev</th>
                      <th className="text-end">Mod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.centerWise || []).map((c) => (
                      <tr
                        key={c.centerId}
                        style={{ cursor: "pointer" }}
                        className="hover-row-highlight"
                        onClick={() => setSelectedFilter({ centerId: c.centerId, label: `Children at ${c.centerName}` })}
                      >
                        <td className="text-truncate fw-semibold" style={{ maxWidth: 180 }}>
                          {c.centerName}
                        </td>
                        <td className="text-end text-danger fw-bold">{c.severe}</td>
                        <td className="text-end text-warning fw-bold">{c.moderate}</td>
                      </tr>
                    ))}
                    {(summary.centerWise || []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-muted py-3 text-center">
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
