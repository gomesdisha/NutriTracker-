import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "WORKER") navigate("/worker");
      else navigate("/supervisor");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(which) {
    if (which === "ADMIN") {
      setEmail("admin@nutri.local");
      setPassword("Admin@123");
    } else if (which === "WORKER") {
      setEmail("worker@nutri.local");
      setPassword("Worker@123");
    } else {
      setEmail("supervisor@nutri.local");
      setPassword("Supervisor@123");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 980 }}>
      <div className="row g-3 align-items-stretch">
        <div className="col-12 col-lg-6">
          <div className="card nt-card h-100">
            <div className="card-body">
              <h4 className="mb-1">NutriTracker</h4>
              <div className="text-muted mb-3">
                Nutrition Monitoring System for Anganwadi Children
              </div>

              <div className="small nt-muted mb-3">
                Use role-based accounts to register children, record height/weight, visualize growth trends,
                and generate malnutrition alerts for supervisors.
              </div>

              <div className="border rounded-3 p-3 bg-light">
                <div className="fw-semibold mb-2">Demo accounts (1-click fill)</div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo("ADMIN")}>
                    Admin
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo("WORKER")}>
                    Worker
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo("SUPERVISOR")}>
                    Supervisor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card nt-card h-100">
            <div className="card-body">
              <h5 className="mb-1">Sign in</h5>
              <div className="text-muted mb-4">Enter your credentials</div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={onSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nutri.local"
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="d-flex align-items-center justify-content-between mt-3">
                <div className="small text-muted">New Worker?</div>
                <Link to="/signup" className="btn btn-sm btn-outline-primary">
                  Create account
                </Link>
              </div>

              <div className="small text-muted mt-3">
                If you haven’t seeded users yet, run `npm run seed` in the project root.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

