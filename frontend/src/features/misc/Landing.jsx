import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";
import { Activity, ShieldAlert, Award, Database, Cpu, Layout } from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  // If already logged in, redirect straight to their dashboard
  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "WORKER") return <Navigate to="/worker" replace />;
    return <Navigate to="/supervisor" replace />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <header className="navbar navbar-expand-lg border-bottom px-3 px-lg-5">
        <div className="container-fluid d-flex justify-content-between">
          <span className="navbar-brand fw-bold fs-4 text-teal-800 d-flex align-items-center gap-2">
            <Activity className="text-success" size={24} />
            NutriTracker
          </span>
          <Link to="/login" className="btn btn-primary px-4">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow-1 d-flex align-items-center py-5 px-3 px-lg-5">
        <div className="container-fluid">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <span className="badge bg-success-subtle text-success fs-7 mb-3 px-3 py-2">
                Anganwadi Child Monitoring System
              </span>
              <h1 className="display-4 fw-extrabold text-slate-900 mb-3" style={{ letterSpacing: "-1.5px", lineHeight: "1.1" }}>
                Interactive Growth Monitoring & <span className="text-teal-700">Malnutrition Alerts</span>
              </h1>
              <p className="fs-5 text-slate-600 mb-4" style={{ maxWidth: 540 }}>
                A modern MERN application designed for rural Anganwadi centers to record heights/weights, visualize growth curves, and alert supervisors of severe child malnutrition instantly.
              </p>
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-primary btn-lg px-4 fs-6">
                  Launch Demo Application
                </Link>
                <Link to="/signup" className="btn btn-outline-secondary btn-lg px-4 fs-6">
                  Register Worker
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card nt-card p-4 nt-glass-card shadow-lg border-0">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Layout className="text-teal-700" size={20} />
                  Role-Based Workflows
                </h5>
                <div className="d-grid gap-3">
                  <div className="d-flex align-items-start gap-3 p-3 rounded bg-white shadow-sm border border-light">
                    <div className="p-2 bg-success-subtle text-success rounded-3">
                      <Activity size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold text-slate-800">Anganwadi Worker</div>
                      <div className="small text-muted">Register children, record weight/height, and see real-time status.</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 p-3 rounded bg-white shadow-sm border border-light">
                    <div className="p-2 bg-danger-subtle text-danger rounded-3">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold text-slate-800">Supervisor Portal</div>
                      <div className="small text-muted">Acknowledge malnutrition alerts, monitor multiple centers, and view aggregated trends.</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 p-3 rounded bg-white shadow-sm border border-light">
                    <div className="p-2 bg-primary-subtle text-primary rounded-3">
                      <Award size={18} />
                    </div>
                    <div>
                      <div className="fw-semibold text-slate-800">Central Admin</div>
                      <div className="small text-muted">Manage system users, register and monitor Anganwadi center locations.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Footer */}
      <section className="bg-white border-top py-4 px-3 px-lg-5">
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="text-muted small">
            Designed by Disha Gomes
          </div>
          <div className="d-flex align-items-center gap-4">
            <span className="small text-muted d-flex align-items-center gap-1">
              <Cpu size={14} className="text-teal-700" />
              React & Vite
            </span>
            <span className="small text-muted d-flex align-items-center gap-1">
              <Database size={14} className="text-teal-700" />
              MongoDB & Mongoose
            </span>
            <span className="small text-muted d-flex align-items-center gap-1">
              <Activity size={14} className="text-teal-700" />
              Recharts API
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
