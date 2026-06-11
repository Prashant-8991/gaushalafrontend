import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { CowIcon, Logo } from "./icons/icons";
import { CowLoaderMark } from "./ui/loader";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      setLoading(false);
      if (ok) navigate("/", { replace: true });
      else setError("Invalid credentials. Please try again.");
    }, 600);
  };

  const inputCls =
    "w-full h-10 px-3 rounded-md bg-background border border-border text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10";

  return (
    <div
      className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background relative overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ─── Brand panel ─── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-navy-dark text-white p-14">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Floating glows */}
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-saffron/[0.05] blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-saffron/[0.04] blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating cow silhouettes (decorative) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/[0.04]"
              style={{
                left: `${10 + (i * 17) % 80}%`,
                top: `${15 + (i * 23) % 70}%`,
              }}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              <CowIcon size={60} strokeWidth={1} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white">
            <Logo size={20} />
          </div>
          <div>
            <p className="text-[0.85rem] font-semibold text-white tracking-tight">Somnath Gaushala</p>
            <p className="text-[0.65rem] text-white/40 tracking-wider uppercase mt-0.5">Management Console</p>
          </div>
        </motion.div>

        <div className="relative max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/20 mb-5">
              <Sparkles className="w-3 h-3 text-saffron-light" strokeWidth={2} />
              <span className="text-[0.65rem] font-medium text-saffron-light tracking-wide">श्री सोमनाथ गौशाला</span>
            </div>
            <h1 className="text-[2.75rem] font-semibold text-white leading-[1.05] tracking-[-0.028em]">
              Care, lineage,
              <br />
              <span className="bg-gradient-to-br from-saffron-light via-saffron to-amber-300 bg-clip-text text-transparent">
                in one ledger.
              </span>
            </h1>
            <p className="text-[0.95rem] text-white/55 leading-relaxed mt-5 max-w-sm">
              A quiet, focused workspace for tracking the health, breeding,
              and milk output of every Gir cow under the trust's care.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-12 max-w-sm"
          >
            {[
              { v: "201", l: "Active cattle" },
              { v: "404", l: "Total registered" },
              { v: "14", l: "Years of seva" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[1.85rem] font-semibold text-white metric leading-none">{s.v}</p>
                <p className="text-[0.7rem] text-white/40 mt-1.5 tracking-wide">{s.l}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative text-[0.7rem] text-white/30"
        >
          © {new Date().getFullYear()} Shree Somnath Temple Trust · Gujarat, India
        </motion.p>
      </div>

      {/* ─── Form panel ─── */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative">
        {/* Decorative glow on form panel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-saffron/[0.02] blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <CowLoaderMark size={64} />
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[0.85rem] text-muted-foreground"
              >
                Signing you in…
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[360px] relative"
            >
              <div className="lg:hidden flex flex-col items-center text-center mb-8">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white mb-3 shadow-lg shadow-saffron/20">
                  <Logo size={22} />
                </div>
                <p className="text-[0.7rem] tracking-widest uppercase text-muted-foreground font-medium">Somnath Temple Trust</p>
              </div>

              <div className="mb-9">
                <h1 className="text-[1.75rem] font-semibold text-foreground leading-tight tracking-[-0.022em]">
                  Welcome back
                </h1>
                <p className="text-[0.85rem] text-muted-foreground mt-1.5">
                  Use your credentials to access the dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1.5"
                >
                  <label className="block text-[0.8rem] font-medium text-foreground">Username</label>
                  <input
                    autoFocus required className={inputCls}
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(""); }}
                    autoComplete="username"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-[0.8rem] font-medium text-foreground">Password</label>
                    <button type="button" className="text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required type={showPassword ? "text" : "password"} className={inputCls + " pr-10"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 bg-destructive/[0.06] border border-destructive/15 text-destructive rounded-md px-3 py-2.5 text-[0.8rem]">
                        <span className="w-1 h-1 mt-2 rounded-full bg-destructive shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group w-full h-10 flex items-center justify-center gap-2 bg-foreground text-background rounded-md font-medium text-[0.875rem] hover:opacity-90 disabled:opacity-60 transition-all focus-ring relative overflow-hidden"
                >
                  <span className="relative inline-flex items-center gap-2">
                    Sign in
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-7 rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">Demo accounts</p>
                  <p className="text-[0.65rem] text-muted-foreground/60">click to fill</p>
                </div>
                <div className="space-y-0.5">
                  {[
                    { u: "admin",   p: "admin123",   r: "Admin",   color: "text-saffron" },
                    { u: "manager", p: "manager123", r: "Manager", color: "text-navy dark:text-blue-300" },
                    { u: "viewer",  p: "viewer123",  r: "Viewer",  color: "text-muted-foreground" },
                  ].map((row, i) => (
                    <motion.button
                      key={row.u}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.04 }}
                      whileHover={{ x: 2 }}
                      type="button"
                      onClick={() => { setUsername(row.u); setPassword(row.p); setError(""); }}
                      className="w-full flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <span className="font-mono text-[0.78rem] text-foreground">
                        {row.u} <span className="text-muted-foreground/40">·</span> {row.p}
                      </span>
                      <span className={`text-[0.65rem] font-medium ${row.color} group-hover:translate-x-0.5 transition-transform`}>{row.r}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
