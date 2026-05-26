import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../api/axios.js";
import { useAuth } from "../../app/AuthContext.jsx";
import GrowthCharts from "../growth/GrowthCharts.jsx";

function StatusBadge({ status }) {
  const cls =
    status === "SEVERE" ? "bg-danger" : status === "MODERATE" ? "bg-warning text-dark" : "bg-success";
  return <span className={`badge ${cls}`}>{status || "NORMAL"}</span>;
}

export default function ChildProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [child, setChild] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const canAddEntry = useMemo(() => user?.role === "WORKER" || user?.role === "ADMIN", [user]);

  const [entry, setEntry] = useState({
    measuredAt: new Date().toISOString().slice(0, 10),
    heightCm: "",
    weightKg: ""
  });

  async function load() {
    setError("");
    const [c, g] = await Promise.all([axios.get(`/children/${id}`), axios.get(`/growth/child/${id}`)]);
    setChild(c.data.child);
    setHistory(g.data.history || []);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load child profile");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addEntry(e) {
    e.preventDefault();
    if (!canAddEntry) return;
    setSaving(true);
    setError("");
    try {
      await axios.post("/growth", {
        childId: id,
        measuredAt: entry.measuredAt,
        heightCm: Number(entry.heightCm),
        weightKg: Number(entry.weightKg)
      });
      setEntry((s) => ({ ...s, heightCm: "", weightKg: "" }));
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add growth entry");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!child) return <div className="text-muted">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">{child.name}</h4>
          <small className="text-muted">
            Child ID: <span className="fw-semibold">{child.childId}</span> • Center:{" "}
            {child.centerId?.name ? `${child.centerId.name} (${child.centerId.code})` : "—"}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={child.latestStatus} />
          <Link className="btn btn-sm btn-outline-secondary" to={user?.role === "SUPERVISOR" ? "/supervisor" : "/worker"}>
            Back
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <div className="card nt-card">
            <div className="card-body">
              <h6 className="mb-2">Details</h6>
              <div className="small">
                <div>
                  <span className="text-muted">DOB:</span>{" "}
                  {new Date(child.dob).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted">Gender:</span> {child.gender}
                </div>
                <div className="mt-2">
                  <div className="text-muted">Parent</div>
                  <div>Father: {child.parent?.fatherName || "-"}</div>
                  <div>Mother: {child.parent?.motherName || "-"}</div>
                  <div>Phone: {child.parent?.phone || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          {canAddEntry && (
            <div className="card nt-card mb-3">
              <div className="card-body">
                <h6 className="mb-2">Add nutrition entry</h6>
                <form onSubmit={addEntry} className="row g-2 align-items-end">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={entry.measuredAt}
                      onChange={(e) => setEntry((s) => ({ ...s, measuredAt: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label">Height (cm)</label>
                    <input
                      className="form-control"
                      value={entry.heightCm}
                      onChange={(e) => setEntry((s) => ({ ...s, heightCm: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      className="form-control"
                      value={entry.weightKg}
                      onChange={(e) => setEntry((s) => ({ ...s, weightKg: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <button className="btn btn-primary w-100" disabled={saving}>
                      {saving ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>
                <div className="form-text">
                  Saving computes status (Normal/Moderate/Severe) and creates alerts automatically.
                </div>
              </div>
            </div>
          )}

          <GrowthCharts history={history} />
        </div>
      </div>

      <div className="card nt-card">
        <div className="card-body">
          <h6 className="mb-2">Growth history</h6>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-end">Height (cm)</th>
                  <th className="text-end">Weight (kg)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.measuredAt).toLocaleDateString()}</td>
                    <td className="text-end">{h.heightCm}</td>
                    <td className="text-end">{h.weightKg}</td>
                    <td>
                      <StatusBadge status={h.status} />
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      No entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

