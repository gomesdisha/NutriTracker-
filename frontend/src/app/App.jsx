import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";

import AppShell from "../components/layout/AppShell.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

import Login from "../features/auth/Login.jsx";
import Signup from "../features/auth/Signup.jsx";
import Landing from "../features/misc/Landing.jsx";
import Forbidden from "../features/misc/Forbidden.jsx";
import NotFound from "../features/misc/NotFound.jsx";

import AdminDashboard from "../features/dashboards/AdminDashboard.jsx";
import WorkerDashboard from "../features/dashboards/WorkerDashboard.jsx";
import SupervisorDashboard from "../features/dashboards/SupervisorDashboard.jsx";

import ChildCreate from "../features/children/ChildCreate.jsx";
import ChildProfile from "../features/children/ChildProfile.jsx";
import AlertsList from "../features/alerts/AlertsList.jsx";
import FoodGuide from "../features/misc/FoodGuide.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route element={<ProtectedRoute allow={["ADMIN", "WORKER", "SUPERVISOR"]} />}>
            <Route element={<AppShell />}>
              <Route path="food-guide" element={<FoodGuide />} />
              <Route path="children/:id" element={<ChildProfile />} />
              
              <Route path="/admin" element={<ProtectedRoute allow={["ADMIN"]} />}>
                <Route index element={<AdminDashboard />} />
              </Route>

              <Route path="/worker" element={<ProtectedRoute allow={["WORKER"]} />}>
                <Route index element={<WorkerDashboard />} />
                <Route path="children/new" element={<ChildCreate />} />
              </Route>

              <Route path="/supervisor" element={<ProtectedRoute allow={["SUPERVISOR", "ADMIN"]} />}>
                <Route index element={<SupervisorDashboard />} />
                <Route path="alerts" element={<AlertsList />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

