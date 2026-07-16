import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";
import { Activity } from "lucide-react";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark border-bottom py-2 px-3 px-lg-4 shadow-sm" style={{ background: "linear-gradient(135deg, #0f766e, #0d5c56)" }}>
      <div className="container-fluid">
        {/* Logo and Brand */}
        <Link className="navbar-brand fw-bold fs-4 text-white d-flex align-items-center gap-2" to="/">
          <Activity className="text-warning animate-pulse" size={24} style={{ filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))" }} />
          <span>NutriTracker</span>
        </Link>

        {/* Hamburger Toggle (Mobile Only) */}
        {user && (
          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#topNavbarContent"
            aria-controls="topNavbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
          </button>
        )}

        {/* Collapsible Content */}
        {user && (
          <div className="collapse navbar-collapse" id="topNavbarContent">
            {/* Nav Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-4 mt-2 mt-lg-0">
              {user.role === "ADMIN" && (
                <li className="nav-item">
                  <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/admin") ? "active-nav-link" : "hover-nav-link"}`} to="/admin">
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {user.role === "WORKER" && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/worker") ? "active-nav-link" : "hover-nav-link"}`} to="/worker">
                      Worker Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/worker/children/new") ? "active-nav-link" : "hover-nav-link"}`} to="/worker/children/new">
                      Register Child
                    </Link>
                  </li>
                </>
              )}
              {(user.role === "SUPERVISOR" || user.role === "ADMIN") && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/supervisor") ? "active-nav-link" : "hover-nav-link"}`} to="/supervisor">
                      Supervisor Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/supervisor/alerts") ? "active-nav-link" : "hover-nav-link"}`} to="/supervisor/alerts">
                      Alerts
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <Link className={`nav-link px-3 py-2 py-lg-1 rounded-3 ${isLinkActive("/food-guide") ? "active-nav-link" : "hover-nav-link"}`} to="/food-guide">
                  Food Guide
                </Link>
              </li>
            </ul>

            {/* Profile Info & Logout */}
            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0 border-top border-teal-600 pt-3 pt-lg-0 border-lg-0">
              <span className="small text-warning fw-semibold px-2 px-lg-0">
                {user.name} ({user.role})
              </span>
              <button
                className="btn btn-warning btn-sm px-3 w-100 w-lg-auto fw-bold"
                style={{ color: "#0f766e" }}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
