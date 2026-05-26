import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppShell() {
  return (
    <>
      <AppNavbar />
      {/* Sidebar renders both desktop + off-canvas mobile */}
      <Sidebar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-2 p-0 d-none d-lg-block" />
          <div className="col-12 col-lg-10 py-3">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

