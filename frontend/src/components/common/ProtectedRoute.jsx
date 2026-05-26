import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";

export default function ProtectedRoute({ allow }) {
  const { isAuthed, user } = useAuth();

  if (!isAuthed) return <Navigate to="/login" replace />;
  if (allow && user && !allow.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

