import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";
import { Mail, Lock, Activity, ShieldAlert } from "lucide-react";

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
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3" style={{ background: "radial-gradient(circle at top left, #e8f5e9 0%, #edf2f7 60%, #edf4ee 100%)" }}>
      <div className="container" style={{ maxWidth: 940 }}>
        <div className="row g-4 align-items-stretch">
          
          {/* Info Card */}
          <div className="col-12 col-lg-6">
            <div className="card nt-card nt-glass-card h-100 p-3 border-0 shadow-lg">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <span className="navbar-brand fw-extrabold fs-3 text-teal-800 d-flex align-items-center gap-2 mb-2">
                    <Activity className="text-success animate-pulse" size={28} />
                    NutriTracker
                  </span>
                  <div className="text-teal-900 fw-medium small mb-4">
                    Anganwadi Nutrition Monitoring Portal
                  </div>
                  <p className="small text-slate-600 mb-4" style={{ lineHeight: "1.6" }}>
                    Welcome to the central portal for child growth tracking. Use role-based accounts to register children, record weight/height, track status, and monitor alerts.
                  </p>
                </div>

                <div className="p-3 rounded-3 bg-white shadow-sm border border-light mt-auto">
                  <div className="fw-semibold text-slate-800 small mb-2 d-flex align-items-center gap-1">
                    <ShieldAlert size={15} className="text-teal-600" />
                    Quick-Access Demo Portals
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" style={{ borderRadius: "6px" }} onClick={() => fillDemo("ADMIN")}>
                      Admin Account
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-primary" style={{ borderRadius: "6px" }} onClick={() => fillDemo("WORKER")}>
                      Worker Portal
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-primary" style={{ borderRadius: "6px" }} onClick={() => fillDemo("SUPERVISOR")}>
                      Supervisor Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="col-12 col-lg-6">
            <div className="card nt-card h-100 p-3 border-0 shadow-lg">
              <div className="card-body d-flex flex-column justify-content-center">
                <h4 className="fw-bold text-slate-900 mb-1">Sign In</h4>
                <div className="text-muted small mb-4">Enter your credentials below</div>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <form onSubmit={onSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label small fw-semibold text-slate-700">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={16} />
                      </span>
                      <input
                        className="form-control border-start-0 ps-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@nutri.local"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold text-slate-700">Security Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        className="form-control border-start-0 ps-0"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary mt-2 py-2 fw-semibold" disabled={loading}>
                    {loading ? "Verifying Credentials..." : "Access Dashboard"}
                  </button>
                </form>

                <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
                  <span className="small text-muted">New Anganwadi worker?</span>
                  <Link to="/signup" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: "6px" }}>
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

