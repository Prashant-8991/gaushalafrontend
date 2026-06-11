import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, GitBranch, Clock, Bell, Menu, LogOut,
  HandHeart, Sun, Moon, ClipboardList, UserCog, PlusCircle,
  Droplets, Search, Command, ChevronDown,
} from "lucide-react";
import { Toaster } from "./ui/sonner";
import { CardThemeProvider, useCardTheme } from "./CardThemeContext";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./icons/icons";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/genealogy", icon: GitBranch, label: "Genealogy" },
  { to: "/timeline", icon: Clock, label: "Timeline" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/donations", icon: HandHeart, label: "Donations" },
];

const adminNavItems = [
  { to: "/admin/herd", icon: ClipboardList, label: "Herd" },
  { to: "/admin/register", icon: PlusCircle, label: "Register" },
  { to: "/admin/daily", icon: Droplets, label: "Daily Ops" },
  { to: "/admin/users", icon: UserCog, label: "Users" },
];

export function Layout() {
  return (
    <CardThemeProvider>
      <LayoutInner />
    </CardThemeProvider>
  );
}

const ROLE_META: Record<string, { label: string; dot: string }> = {
  admin:   { label: "Administrator", dot: "bg-saffron" },
  manager: { label: "Manager",       dot: "bg-navy dark:bg-blue-400" },
  viewer:  { label: "Viewer",        dot: "bg-muted-foreground" },
};

function LayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cardTheme, toggleCardTheme } = useCardTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-out flex flex-col border-r border-sidebar-border/60 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-4 py-4 border-b border-sidebar-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white">
              <Logo size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.78rem] font-semibold text-white leading-tight tracking-tight">Somnath Gaushala</p>
              <p className="text-[0.65rem] text-sidebar-foreground/50 leading-tight mt-0.5">Temple Trust</p>
            </div>
          </div>
        </div>

        <div className="px-3 pt-3">
          <button className="w-full flex items-center gap-2 px-2.5 h-8 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-sidebar-foreground/55 text-[0.78rem] transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.6rem] bg-white/5 text-sidebar-foreground/50 font-mono">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2.5 mb-1.5 text-[0.6rem] uppercase tracking-[0.12em] font-medium text-sidebar-foreground/35">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[0.82rem] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-sidebar-foreground/65 hover:text-white hover:bg-white/[0.04] hover:translate-x-0.5"
                }`
              }
              end={item.to === "/"}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-saffron"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon className={`w-[1.05rem] h-[1.05rem] shrink-0 ${isActive ? "text-saffron" : ""} transition-transform group-hover:scale-110`} strokeWidth={1.6} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {(user?.role === "admin" || user?.role === "manager") && (
            <>
              <div className="pt-4 pb-1.5 px-2.5">
                <p className="text-[0.6rem] uppercase tracking-[0.12em] font-medium text-sidebar-foreground/35">Administration</p>
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[0.82rem] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-sidebar-foreground/65 hover:text-white hover:bg-white/[0.04] hover:translate-x-0.5"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-saffron" />}
                      <item.icon className={`w-[1.05rem] h-[1.05rem] shrink-0 ${isActive ? "text-saffron" : ""} transition-transform group-hover:scale-110`} strokeWidth={1.6} />
                      <span className="flex-1">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {user && (
          <div className="p-3 border-t border-sidebar-border/60">
            <div className="group flex items-center gap-2.5 p-2 rounded-md hover:bg-white/[0.04] transition-colors">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white font-semibold text-[0.7rem]">
                  {user.initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${ROLE_META[user.role]?.dot} border-2 border-sidebar`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8rem] font-medium text-white truncate leading-tight">{user.displayName}</p>
                <p className="text-[0.65rem] text-sidebar-foreground/50 leading-tight mt-0.5">{ROLE_META[user.role]?.label}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded text-sidebar-foreground/40 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-12 bg-background/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden -ml-1 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:block text-[0.78rem] text-muted-foreground">
              <span className="text-foreground font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <span className="mx-1.5 text-border">·</span>
              <span>{new Date().toLocaleDateString("en-IN", { year: "numeric" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleCardTheme}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
              title={cardTheme === "light" ? "Dark mode" : "Light mode"}
            >
              {cardTheme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => navigate("/alerts")}
              className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
              title="Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-border mx-1.5" />

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 pl-1 pr-2 h-8 rounded-md hover:bg-muted transition-colors group"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white font-semibold text-[0.68rem]">
                    {user.initials}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${ROLE_META[user.role]?.dot} border-2 border-background`} />
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}
