import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
