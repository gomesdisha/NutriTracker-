import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <button
          className="btn btn-outline-primary btn-sm d-lg-none me-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#ntSidebar"
          aria-controls="ntSidebar"
        >
          Menu
        </button>
        <Link className="navbar-brand fw-semibold" to="/">
          NutriTracker
        </Link>
        <div className="d-flex align-items-center gap-2">
          <span className="small d-none d-md-inline nt-muted">
            {user?.name} ({user?.role})
          </span>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

