import { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "manager" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isPendingApproval: boolean;
  pendingEmail: string;
  pendingName: string;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; pending?: boolean }>;
  logout: () => void;
  isAdmin: boolean;
  isAdminOrManager: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isPendingApproval: false,
  pendingEmail: "",
  pendingName: "",
  loginWithGoogle: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
  isAdminOrManager: false,
});

const STORAGE_KEY = "gaushala_auth";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored).user as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored).token as string) : null;
    } catch {
      return null;
    }
  });
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingName, setPendingName] = useState("");

  const loginWithGoogle = useCallback(async (idToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();

      if (data.status === "pending_approval") {
        setIsPendingApproval(true);
        setPendingEmail(data.email);
        setPendingName(data.full_name);
        return { success: false, pending: true };
      }

      if (res.ok && data.access_token) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          picture: data.user.picture,
          role: data.user.role as UserRole,
          is_verified: data.user.is_verified,
          is_active: data.user.is_active,
        };
        setUser(authUser);
        setToken(data.access_token);
        setIsPendingApproval(false);
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: authUser, token: data.access_token })
        );
        return { success: true };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsPendingApproval(false);
    setPendingEmail("");
    setPendingName("");
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isAdmin = user?.role === "admin";
  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isPendingApproval,
        pendingEmail,
        pendingName,
        loginWithGoogle,
        logout,
        isAdmin,
        isAdminOrManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
