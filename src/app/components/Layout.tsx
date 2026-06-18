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
  PlusCircle,
  Droplets,
} from "lucide-react";
import { Toaster } from "./ui/sonner";
import { CardThemeProvider, useCardTheme } from "./CardThemeContext";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/genealogy", icon: GitBranch, label: "Genealogy" },
  // { to: "/timeline", icon: Clock, label: "Timeline" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/donations", icon: HandHeart, label: "Donations" },
];

  const adminNavItems = [
  { to: "/admin/herd", icon: ClipboardList, label: "Herd Management" },
  { to: "/admin/register", icon: PlusCircle, label: "Register Cattle" },
  { to: "/admin/daily", icon: Droplets, label: "Daily Operations" },
];

  const adminOnlyNavItems = [
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
  admin: "bg-saffron text-white",
  manager: "bg-navy text-white",
  viewer: "bg-gray-400 text-white",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function LayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cardTheme, toggleCardTheme } = useCardTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.full_name ? getInitials(user.full_name) : "??";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } flex flex-col shadow-2xl shadow-black/20`}
      >
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-saffron/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-saffron-light/5 blur-3xl" />
          <div className="relative p-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                <img
                  src="https://somnath.org/static/img/somnath-logo-light.png"
                  alt=""
                  width={80}
                  height={80}
                />
              </div>
              <div>
                <p
                  style={{ fontSize: "0.65rem" }}
                  className="text-saffron-light/80 tracking-wider uppercase font-medium"
                >
                  Shree Somnath Trust Gaushala
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-saffron/20 to-saffron/5 text-white shadow-sm shadow-saffron/10 border border-saffron/20"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"
                }`
              }
              end={item.to === "/"}
            >
              <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {item.label}
              </span>
            </NavLink>
          ))}

          {user && (user.role === "admin" || user.role === "manager") && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-3 text-sidebar-foreground/30 uppercase tracking-widest text-[0.6rem] font-semibold">
                  Administration
                </p>
              </div>

              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-saffron/20 to-saffron/5 text-white shadow-sm shadow-saffron/10 border border-saffron/20"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {item.label}
                  </span>
                </NavLink>
              ))}

              {user.role === "admin" && adminOnlyNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-saffron/20 to-saffron/5 text-white shadow-sm shadow-saffron/10 border border-saffron/20"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          {user && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 group hover:bg-white/8 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shrink-0 shadow-lg shadow-saffron/20">
                <span
                  className="text-white font-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sidebar-foreground font-medium truncate"
                  style={{ fontSize: "0.75rem" }}
                >
                  {user.full_name}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-white font-medium capitalize ${
                    ROLE_BADGE[user.role]
                  }`}
                  style={{ fontSize: "0.55rem" }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg hover:bg-white/10 text-sidebar-foreground/40 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="bg-white/5 rounded-xl p-3">
            <p style={{ fontSize: "0.7rem" }} className="text-sidebar-foreground/40">
              Somnath Temple Trust
            </p>
            <p style={{ fontSize: "0.7rem" }} className="text-saffron-light/70 font-medium">
              Gujarat, India
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <span
              style={{ fontSize: "0.8rem" }}
              className="text-muted-foreground font-medium"
            >
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
              className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 border border-border hover:border-saffron/30 hover:shadow-sm hover:shadow-saffron/5"
              title={
                cardTheme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {cardTheme === "light" ? (
                <Moon className="w-4 h-4 text-navy" />
              ) : (
                <Sun className="w-4 h-4 text-saffron-light" />
              )}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <span
                  className={`hidden sm:inline px-2.5 py-0.5 rounded-full text-white font-medium capitalize shadow-sm ${
                    ROLE_BADGE[user.role]
                  }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {user.role}
                </span>
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white font-bold shadow-lg shadow-saffron/20"
                  style={{ fontSize: "0.7rem" }}
                >
                  {initials}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}
