import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios.js";

function StatusBadge({ status }) {
  const cls =
    status === "SEVERE" ? "bg-danger" : status === "MODERATE" ? "bg-warning text-dark" : "bg-success";
  return <span className={`badge ${cls}`}>{status || "NORMAL"}</span>;
}

export default function WorkerDashboard() {
  const [children, setChildren] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return children;
    return children.filter((c) => (c.name || "").toLowerCase().includes(s) || (c.childId || "").toLowerCase().includes(s));
  }, [children, q]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("/children");
        setChildren(data.children || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load children");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">Anganwadi Worker Dashboard</h4>
          <small className="text-muted">Children under your center</small>
        </div>
        <Link to="/worker/children/new" className="btn btn-primary">
          + Register Child
        </Link>
      </div>

      <div className="card nt-card mb-3">
        <div className="card-body">
          <input
            className="form-control"
            placeholder="Search by name or child ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="card nt-card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Child ID</th>
                    <th>Center</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted">{c.childId}</td>
                      <td className="text-muted">{c.centerId?.code || "-"}</td>
                      <td>
                        <StatusBadge status={c.latestStatus} />
                      </td>
                      <td className="text-end">
                        <Link className="btn btn-sm btn-outline-primary" to={`/children/${c._id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-muted">
                        No children found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

