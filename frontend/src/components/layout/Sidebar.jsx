import { NavLink } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `list-group-item list-group-item-action ${isActive ? "active" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="nt-sidebar d-none d-lg-block">
        <div className="nt-sidebar-header">
          <div className="fw-semibold">Menu</div>
          <div className="nt-sidebar-role small">Role: {user?.role}</div>
        </div>

        <div className="list-group list-group-flush">
          {user?.role === "ADMIN" && <Item to="/admin" label="Admin Dashboard" />}
          {user?.role === "WORKER" && (
            <>
              <Item to="/worker" label="Worker Dashboard" />
              <Item to="/worker/children/new" label="Register Child" />
            </>
          )}
          {(user?.role === "SUPERVISOR" || user?.role === "ADMIN") && (
            <>
              <Item to="/supervisor" label="Supervisor Dashboard" />
              <Item to="/supervisor/alerts" label="Alerts" />
            </>
          )}
          <Item to="/food-guide" label="Food Guide" />
        </div>
      </div>

      {/* Mobile off-canvas sidebar */}
      <div
        className="offcanvas offcanvas-start d-lg-none nt-sidebar"
        tabIndex="-1"
        id="ntSidebar"
        aria-labelledby="ntSidebarLabel"
      >
        <div className="offcanvas-header border-0">
          <div>
            <div className="fw-semibold" id="ntSidebarLabel">
              NutriTracker
            </div>
            <div className="nt-sidebar-role small">Role: {user?.role}</div>
          </div>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body p-0">
          <div className="list-group list-group-flush">
            {user?.role === "ADMIN" && <Item to="/admin" label="Admin Dashboard" />}
            {user?.role === "WORKER" && (
              <>
                <Item to="/worker" label="Worker Dashboard" />
                <Item to="/worker/children/new" label="Register Child" />
              </>
            )}
            {(user?.role === "SUPERVISOR" || user?.role === "ADMIN") && (
              <>
                <Item to="/supervisor" label="Supervisor Dashboard" />
                <Item to="/supervisor/alerts" label="Alerts" />
              </>
            )}
            <Item to="/food-guide" label="Food Guide" />
          </div>
        </div>
      </div>
    </>
  );
}

