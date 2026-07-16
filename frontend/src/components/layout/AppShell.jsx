import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar.jsx";

export default function AppShell() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f8fafc" }}>
      <AppNavbar />
      <main className="flex-grow-1 p-3 p-lg-4 container-xl" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}

