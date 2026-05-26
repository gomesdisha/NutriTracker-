import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios.js";
import { useAuth } from "../../app/AuthContext.jsx";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    centerId: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/public/centers");
        setCenters(data.centers || []);
      } catch {
        setCenters([]);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/signup", form);
      // After signup, log in to get token attached + route to worker dashboard
      await login(form.email, form.password);
      navigate("/worker");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="card nt-card">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <h4 className="mb-1">Create Worker Account</h4>
              <div className="text-muted">Signup is available only for Anganwadi Workers.</div>
            </div>
            <Link to="/login" className="btn btn-outline-secondary btn-sm">
              Back to login
            </Link>
          </div>

          <hr />

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Full name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                type="email"
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                type="password"
                minLength={6}
                required
              />
              <div className="form-text">Minimum 6 characters.</div>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={form.centerId}
                onChange={(e) => setForm((s) => ({ ...s, centerId: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select center...
                </option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              {centers.length === 0 && (
                <div className="form-text text-danger">
                  Centers list is not available yet. Log in as Admin to create centers first, then refresh signup.
                </div>
              )}
            </div>

            <div className="col-12">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

