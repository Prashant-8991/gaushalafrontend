import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdminOrManager() {
  const { user, isAdminOrManager } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminOrManager) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
