import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios.js";

function TypeBadge({ type }) {
  const map = {
    SEVERE_MALNUTRITION: { label: "Severe", cls: "bg-danger" },
    NO_IMPROVEMENT: { label: "No improvement", cls: "bg-warning text-dark" }
  };
  const v = map[type] || { label: type, cls: "bg-secondary" };
  return <span className={`badge ${v.cls}`}>{v.label}</span>;
}

function StatusBadge({ status }) {
  const cls =
    status === "OPEN"
      ? "bg-danger"
      : status === "ACKNOWLEDGED"
        ? "bg-warning text-dark"
        : "bg-success";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await axios.get("/alerts?status=OPEN");
    setAlerts(data.alerts || []);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        await load();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function ack(id) {
    await axios.patch(`/alerts/${id}/ack`);
    await load();
  }

  async function resolve(id) {
    await axios.patch(`/alerts/${id}/resolve`);
    await load();
  }

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">Alerts</h4>
          <small className="text-muted">Open malnutrition alerts</small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => load()}>
          Refresh
        </button>
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
                    <th>Type</th>
                    <th>Child</th>
                    <th>Center</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <TypeBadge type={a.type} />
                      </td>
                      <td>
                        <div className="fw-semibold">{a.childId?.name || "-"}</div>
                        <div className="text-muted small">{a.childId?.childId || ""}</div>
                      </td>
                      <td className="text-muted">
                        {a.centerId?.code ? `${a.centerId.code}` : "-"}
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="text-muted">{a.message}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link className="btn btn-sm btn-outline-primary" to={`/supervisor/children/${a.childId?._id}`}>
                            View
                          </Link>
                          <button className="btn btn-sm btn-outline-warning" onClick={() => ack(a._id)}>
                            Ack
                          </button>
                          <button className="btn btn-sm btn-outline-success" onClick={() => resolve(a._id)}>
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-muted">
                        No open alerts.
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

