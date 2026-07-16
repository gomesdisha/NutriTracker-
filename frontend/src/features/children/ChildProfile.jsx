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
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);

  const canAddEntry = useMemo(() => user?.role === "WORKER" || user?.role === "ADMIN", [user]);

  const [entry, setEntry] = useState({
    measuredAt: new Date().toISOString().slice(0, 10),
    heightCm: "",
    weightKg: ""
  });

  async function load() {
    setError("");
    try {
      const [c, g, a] = await Promise.all([
        axios.get(`/children/${id}`),
        axios.get(`/growth/child/${id}`),
        axios.get(`/alerts?childId=${id}`) // Fetch all alerts for child (unfiltered by status)
      ]);
      setChild(c.data.child);
      setHistory(g.data.history || []);
      setAlerts(a.data.alerts || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load child profile");
    }
  }

  const activeAlerts = useMemo(() => alerts.filter((alt) => alt.status !== "RESOLVED"), [alerts]);

  const ageString = useMemo(() => {
    if (!child?.dob) return "-";
    const dob = new Date(child.dob);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} years, ${months} months (${years * 12 + months} months)`;
  }, [child]);

  const dietRecommendations = useMemo(() => {
    const latestEntry = history[history.length - 1];
    if (!latestEntry || latestEntry.status === "NORMAL") return null;

    const reasons = latestEntry.reasons || [];
    const recommendations = [];

    let isStunted = false;
    let isWasted = false;
    let isUnderweight = false;
    let isOverweight = false;

    reasons.forEach((r) => {
      const lower = r.toLowerCase();
      if (lower.includes("stunting")) isStunted = true;
      if (lower.includes("wasting")) isWasted = true;
      if (lower.includes("underweight")) isUnderweight = true;
      if (lower.includes("overweight")) isOverweight = true;
    });

    if (isUnderweight || isWasted) {
      recommendations.push({
        type: "Energy & Protein (Weight/Wasting)",
        foods: [
          { name: "Kichdi", query: "Kichdi" },
          { name: "Dal", query: "Dal" },
          { name: "Peanuts", query: "Peanut" },
          { name: "Banana", query: "Banana" }
        ],
        desc: "High-calorie, nutrient-dense foods to support healthy weight gain."
      });
    }

    if (isStunted) {
      recommendations.push({
        type: "Growth & Micronutrients (Height/Stunting)",
        foods: [
          { name: "Ragi", query: "Ragi" },
          { name: "Milk", query: "Milk" },
          { name: "Egg", query: "Egg" },
          { name: "Paneer", query: "Paneer" }
        ],
        desc: "Calcium, Vitamin D, and high-quality protein to support linear height growth."
      });
    }

    if (isOverweight) {
      recommendations.push({
        type: "Balanced & High Fiber (Overweight)",
        foods: [
          { name: "Dal", query: "Dal" },
          { name: "Green Veg", query: "Vegetables" },
          { name: "Oats", query: "Oats" }
        ],
        desc: "Low-calorie, fiber-rich options to support healthy metabolic development."
      });
    }

    return recommendations;
  }, [history]);

  async function ackAlert(alertId) {
    try {
      await axios.patch(`/alerts/${alertId}/ack`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to acknowledge alert");
    }
  }

  async function resolveAlert(alertId) {
    try {
      await axios.patch(`/alerts/${alertId}/resolve`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resolve alert");
    }
  }

  // Offline queue syncing function
  async function syncQueue() {
    const queue = JSON.parse(localStorage.getItem("nutritracker_offline_queue") || "[]");
    if (queue.length === 0) return;

    let successCount = 0;
    let failedList = [];

    for (const item of queue) {
      try {
        await axios.post("/growth", item);
        successCount++;
      } catch (err) {
        console.error("Failed to sync offline entry:", err);
        // Discard 400 validation failures so the queue does not block, but alert the user
        if (err.response?.status === 400) {
          successCount++;
          failedList.push(item);
        }
      }
    }

    const remaining = queue.slice(successCount);
    localStorage.setItem("nutritracker_offline_queue", JSON.stringify(remaining));
    setOfflineQueueLength(remaining.length);

    if (failedList.length > 0) {
      setError(`Sync Alert: ${failedList.length} entry was rejected by the server (check boundaries: Height must be 30-130cm, Weight 1-40kg).`);
    }

    if (successCount > 0) {
      await load();
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();

    // Listen to network status
    function handleOnline() {
      setIsOnline(true);
      syncQueue();
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const queue = JSON.parse(localStorage.getItem("nutritracker_offline_queue") || "[]");
    setOfflineQueueLength(queue.length);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addEntry(e) {
    e.preventDefault();
    if (!canAddEntry) return;
    setSaving(true);
    setError("");

    const newEntry = {
      childId: id,
      measuredAt: entry.measuredAt,
      heightCm: Number(entry.heightCm),
      weightKg: Number(entry.weightKg)
    };

    if (!navigator.onLine) {
      // Save locally to offline queue
      const queue = JSON.parse(localStorage.getItem("nutritracker_offline_queue") || "[]");
      queue.push(newEntry);
      localStorage.setItem("nutritracker_offline_queue", JSON.stringify(queue));
      setOfflineQueueLength(queue.length);
      setEntry((s) => ({ ...s, heightCm: "", weightKg: "" }));
      setSaving(false);
      return;
    }

    try {
      await axios.post("/growth", newEntry);
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
      {/* Offline Status Banners */}
      {!isOnline && (
        <div className="alert alert-warning py-2 mb-3 small d-flex align-items-center justify-content-between border-0 shadow-sm" style={{ borderRadius: "8px" }}>
          <span>⚠️ You are currently <strong>Offline</strong>. New growth entries will be saved locally.</span>
        </div>
      )}
      {offlineQueueLength > 0 && (
        <div className="alert alert-info py-2 mb-3 small d-flex align-items-center justify-content-between border-0 shadow-sm" style={{ borderRadius: "8px" }}>
          <span>🔄 {offlineQueueLength} growth entries queued to sync. {isOnline ? "Syncing now..." : "Will sync when internet returns."}</span>
          {isOnline && <button className="btn btn-xs btn-outline-primary py-0 px-2 fs-7" onClick={syncQueue}>Sync Now</button>}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-3 print-no-show">
        <div>
          <h4 className="mb-0 fw-bold">{child.name}</h4>
          <small className="text-muted">
            Child ID: <span className="fw-semibold">{child.childId}</span> • Center:{" "}
            {child.centerId?.name ? `${child.centerId.name} (${child.centerId.code})` : "—"}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={child.latestStatus} />
          <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
            Print Report
          </button>
          <Link className="btn btn-sm btn-outline-secondary" to={user?.role === "SUPERVISOR" ? "/supervisor" : "/worker"}>
            Back
          </Link>
        </div>
      </div>

      {/* Printable Heading (Only visible in Print) */}
      <div className="d-none print-only-show border-bottom pb-3 mb-4">
        <h2 className="fw-bold mb-0">NutriTracker Growth Report</h2>
        <div className="text-muted small">Anganwadi Integrated Growth Monitoring Program</div>
      </div>

      {activeAlerts.length > 0 && (
        <div className="alert alert-danger mb-3 p-3 shadow-sm border-0 d-flex flex-column gap-2 print-no-show" style={{ borderRadius: "12px" }}>
          {activeAlerts.map((alt) => (
            <div key={alt._id} className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${alt.status === "OPEN" ? "bg-danger" : "bg-warning text-dark"}`}>
                  {alt.status === "OPEN" ? "MALNUTRITION ALERT" : "ACKNOWLEDGED ALERT"}
                </span>
                <span className="fw-semibold text-danger">{alt.message}</span>
              </div>
              {(user?.role === "SUPERVISOR" || user?.role === "ADMIN") && (
                <div className="btn-group">
                  {alt.status === "OPEN" && (
                    <button className="btn btn-sm btn-outline-warning py-1 px-2 fs-7" onClick={() => ackAlert(alt._id)}>
                      Ack
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-success py-1 px-2 fs-7" onClick={() => resolveAlert(alt._id)}>
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <div className="card nt-card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3 fw-bold text-slate-800">Child Details</h6>
              <div className="small d-grid gap-2">
                <div>
                  <span className="text-muted">DOB:</span>{" "}
                  <strong>{new Date(child.dob).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-muted">Current Age:</span>{" "}
                  <strong>{ageString}</strong>
                </div>
                <div>
                  <span className="text-muted">Gender:</span> <strong>{child.gender === "M" ? "Male" : child.gender === "F" ? "Female" : "Other"}</strong>
                </div>
                <div className="mt-2 pt-2 border-top">
                  <div className="text-muted small fw-semibold mb-1">Parent Information</div>
                  <div>Father: <strong>{child.parent?.fatherName || "-"}</strong></div>
                  <div>Mother: <strong>{child.parent?.motherName || "-"}</strong></div>
                  <div>Phone: <strong>{child.parent?.phone || "-"}</strong></div>
                  <div>Address: <strong>{child.parent?.address || "-"}</strong></div>
                </div>

                {history.length > 0 && (
                  <div className="mt-2 pt-2 border-top">
                    <div className="text-muted small fw-semibold mb-1">Latest WHO Indicators</div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {(history[history.length - 1].reasons || []).map((reason, idx) => (
                        <span key={idx} className={`badge ${reason.includes("Normal") || reason.includes("Healthy") ? "bg-success" : "bg-warning text-dark"}`}>
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dietRecommendations && dietRecommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-top print-no-show">
                    <div className="text-muted small fw-bold mb-2 text-teal-800" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                      POSHAN DIET SUGGESTIONS
                    </div>
                    <div className="d-grid gap-2">
                      {dietRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-light p-2 rounded border border-light" style={{ borderLeft: "3px solid var(--nt-primary) !important" }}>
                          <div className="fw-semibold small text-teal-900 mb-1">{rec.type}</div>
                          <div className="text-muted mb-2" style={{ fontSize: "0.7rem", lineHeight: "1.2" }}>{rec.desc}</div>
                          <div className="d-flex flex-wrap gap-1">
                            {rec.foods.map((food, fIdx) => (
                              <Link
                                key={fIdx}
                                className="badge bg-teal-100 text-teal-900 border border-teal-200 text-decoration-none py-1 px-2 hover-badge"
                                style={{ fontSize: "0.68rem" }}
                                to={`/food-guide?search=${encodeURIComponent(food.query)}`}
                              >
                                🔍 {food.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8 print-no-show">
          {canAddEntry && (
            <div className="card nt-card mb-3 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="mb-2 fw-bold text-slate-800">Record Growth Entry</h6>
                <form onSubmit={addEntry} className="row g-2 align-items-end">
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-slate-700">Measurement Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={entry.measuredAt}
                      onChange={(e) => setEntry((s) => ({ ...s, measuredAt: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label small fw-semibold text-slate-700">Height (cm)</label>
                    <input
                      className="form-control"
                      value={entry.heightCm}
                      onChange={(e) => setEntry((s) => ({ ...s, heightCm: e.target.value }))}
                      placeholder="e.g. 85.5"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label small fw-semibold text-slate-700">Weight (kg)</label>
                    <input
                      className="form-control"
                      value={entry.weightKg}
                      onChange={(e) => setEntry((s) => ({ ...s, weightKg: e.target.value }))}
                      placeholder="e.g. 12.4"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={saving}>
                      {saving ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <GrowthCharts history={history} />
        </div>
      </div>

      {/* Growth History Table */}
      <div className="card nt-card border-0 shadow-sm mt-3">
        <div className="card-body">
          <h6 className="mb-3 fw-bold text-slate-800">Growth & Nutrition History</h6>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-end">Height (cm)</th>
                  <th className="text-end">Weight (kg)</th>
                  <th>Age (Months)</th>
                  <th>Status</th>
                  <th>WHO Growth Indicators</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.measuredAt).toLocaleDateString()}</td>
                    <td className="text-end fw-semibold">{h.heightCm}</td>
                    <td className="text-end fw-semibold">{h.weightKg}</td>
                    <td>{h.ageMonths} months</td>
                    <td>
                      <StatusBadge status={h.status} />
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(h.reasons || []).map((reason, idx) => (
                          <span key={idx} className={`badge ${reason.includes("Normal") || reason.includes("Healthy") ? "bg-success" : "bg-warning text-dark"}`} style={{ fontSize: "0.7rem" }}>
                            {reason}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-muted py-4 text-center">
                      No measurements recorded yet.
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
