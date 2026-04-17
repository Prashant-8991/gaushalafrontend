import { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "manager" | "viewer";

export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: Array<{ username: string; password: string; displayName: string; role: UserRole; initials: string }> = [
  { username: "admin",   password: "admin123",   role: "admin",   displayName: "Prakashbhai Joshi",  initials: "PJ" },
  { username: "manager", password: "manager123", role: "manager", displayName: "Hemlata Patel",      initials: "HP" },
  { username: "viewer",  password: "viewer123",  role: "viewer",  displayName: "Dineshbhai Chauhan", initials: "DC" },
];

const SESSION_KEY = "gaushala_auth_user";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = (username: string, password: string): boolean => {
    const match = MOCK_USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!match) return false;
    const authUser: AuthUser = {
      username: match.username,
      displayName: match.displayName,
      role: match.role,
      initials: match.initials,
    };
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
