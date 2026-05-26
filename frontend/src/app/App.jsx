import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

import AppShell from "../components/layout/AppShell.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

import Login from "../features/auth/Login.jsx";
import Signup from "../features/auth/Signup.jsx";
import Forbidden from "../features/misc/Forbidden.jsx";
import NotFound from "../features/misc/NotFound.jsx";

import AdminDashboard from "../features/dashboards/AdminDashboard.jsx";
import WorkerDashboard from "../features/dashboards/WorkerDashboard.jsx";
import SupervisorDashboard from "../features/dashboards/SupervisorDashboard.jsx";

import ChildCreate from "../features/children/ChildCreate.jsx";
import ChildProfile from "../features/children/ChildProfile.jsx";
import AlertsList from "../features/alerts/AlertsList.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "WORKER") return <Navigate to="/worker" replace />;
  return <Navigate to="/supervisor" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route element={<ProtectedRoute allow={["ADMIN", "WORKER", "SUPERVISOR"]} />}>
            <Route element={<AppShell />}>
              <Route path="/admin" element={<ProtectedRoute allow={["ADMIN"]} />}>
                <Route index element={<AdminDashboard />} />
              </Route>

              <Route path="/worker" element={<ProtectedRoute allow={["WORKER"]} />}>
                <Route index element={<WorkerDashboard />} />
                <Route path="children/new" element={<ChildCreate />} />
                <Route path="children/:id" element={<ChildProfile />} />
              </Route>

              <Route path="/supervisor" element={<ProtectedRoute allow={["SUPERVISOR", "ADMIN"]} />}>
                <Route index element={<SupervisorDashboard />} />
                <Route path="alerts" element={<AlertsList />} />
                <Route path="children/:id" element={<ChildProfile />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

