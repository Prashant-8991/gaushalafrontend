import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard,
  GitBranch,
  Clock,
  Bell,
  Menu,
  X,
  Flower2,
  Shield,
  Heart,
  HandHeart,
  Sun,
  Moon,
  ClipboardList,
  UserCog,
  LogOut,
} from "lucide-react";
import { CardThemeProvider, useCardTheme } from "./CardThemeContext";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/genealogy", icon: GitBranch, label: "Genealogy" },
  { to: "/breed-scoring", icon: Shield, label: "Breed Scoring" },
  { to: "/timeline", icon: Clock, label: "Timeline" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/donations", icon: HandHeart, label: "Donations" },
  // { to: "/memorial", icon: Heart, label: "Memorial Hall" },
];

const adminNavItems = [
  { to: "/admin/herd", icon: ClipboardList, label: "Herd Management" },
  { to: "/admin/users", icon: UserCog, label: "User Management" },
];

export function Layout() {
  return (
    <CardThemeProvider>
      <LayoutInner />
    </CardThemeProvider>
  );
}

const ROLE_BADGE: Record<string, string> = {
  admin:   "bg-saffron text-white",
  manager: "bg-navy text-white",
  viewer:  "bg-gray-400 text-white",
};

function LayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cardTheme, toggleCardTheme } = useCardTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-dark text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } flex flex-col`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center">
              <img src="https://somnath.org/static/img/somnath-logo-light.png" alt="" width={80} height={80} />
            </div>
            <div>
              <h2 className="text-white tracking-wide" style={{ fontSize: '1.1rem' }}>GauShala</h2>
              <p style={{ fontSize: '0.7rem' }} className="text-white/60 tracking-wider uppercase">Somnath Temple Trust</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-saffron text-white shadow-lg shadow-saffron/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
              end={item.to === "/"}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {(user?.role === "admin" || user?.role === "manager") && (
            <>
              <div className="pt-3 pb-1">
                <div className="border-t border-white/10 pt-3">
                  <p className="px-4 text-white/30 uppercase tracking-widest mb-1" style={{ fontSize: "0.6rem", fontWeight: 600 }}>
                    Administration
                  </p>
                </div>
              </div>

              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-saffron text-white shadow-lg shadow-saffron/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {user && (
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shrink-0">
                <span className="text-white font-bold" style={{ fontSize: "0.65rem" }}>{user.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate" style={{ fontSize: "0.75rem" }}>{user.displayName}</p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-white font-medium capitalize ${ROLE_BADGE[user.role]}`}
                  style={{ fontSize: "0.55rem" }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="bg-white/5 rounded-lg p-3">
            <p style={{ fontSize: '0.75rem' }} className="text-white/50">Somnath Temple Trust</p>
            <p style={{ fontSize: '0.75rem' }} className="text-saffron-light">Gujarat, India</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-saffron/10 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.8rem' }} className="text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCardTheme}
              className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors border border-saffron/10"
              title={cardTheme === "light" ? "Switch to dark cards" : "Switch to light cards"}
            >
              {cardTheme === "light" ? (
                <Moon className="w-4 h-4 text-navy" />
              ) : (
                <Sun className="w-4 h-4 text-saffron" />
              )}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <span
                  className={`hidden sm:inline px-2 py-0.5 rounded-full text-white font-medium capitalize ${ROLE_BADGE[user.role]}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {user.role}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white font-bold" style={{ fontSize: '0.65rem' }}>
                  {user.initials}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}