import { useState } from "react";
import { useNavigate } from "react-router";
import { Flower2, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

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
      if (ok) {
        navigate("/", { replace: true });
      } else {
        setError("Invalid username or password. Please try again.");
      }
    }, 400);
  };

  const inputCls =
    "w-full h-10 rounded-lg border border-saffron/20 bg-[#FFF8F0] px-3 py-1 text-sm text-foreground outline-none transition-[color,box-shadow] focus:ring-[3px] focus:ring-saffron/30 focus:border-saffron placeholder:text-muted-foreground/50";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FFFDF8] px-4"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-saffron/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-navy/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shadow-lg shadow-saffron/30 mb-4">
            <Flower2 className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-foreground font-bold tracking-wide"
            style={{ fontSize: "1.4rem" }}
          >
            GauShala
          </h1>
          <p
            className="text-muted-foreground tracking-widest uppercase mt-0.5"
            style={{ fontSize: "0.65rem" }}
          >
            Somnath Temple Trust
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-saffron/10 shadow-xl shadow-saffron/5 p-8">
          <h2
            className="text-foreground font-semibold mb-1"
            style={{ fontSize: "1.05rem" }}
          >
            Sign in to your account
          </h2>
          <p
            className="text-muted-foreground mb-6"
            style={{ fontSize: "0.78rem" }}
          >
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5"
              >
                Username
              </label>
              <input
                autoFocus
                required
                className={inputCls}
                placeholder="e.g. admin"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                autoComplete="username"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className={inputCls + " pr-10"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5" style={{ fontSize: "0.78rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors shadow-md shadow-saffron/25 mt-2"
              style={{ fontSize: "0.88rem" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Mock Google button */}
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-3 border border-border bg-white hover:bg-muted/20 disabled:opacity-40 disabled:cursor-not-allowed text-foreground py-2.5 rounded-lg transition-colors"
            style={{ fontSize: "0.85rem" }}
            title="Google sign-in is not configured"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Hint */}
        <div className="mt-5 bg-white/60 rounded-xl border border-saffron/10 px-4 py-3">
          <p className="text-muted-foreground font-medium mb-2" style={{ fontSize: "0.7rem" }}>
            Demo Credentials
          </p>
          <div className="space-y-1">
            {[
              { u: "admin",   p: "admin123",   r: "Admin"   },
              { u: "manager", p: "manager123", r: "Manager" },
              { u: "viewer",  p: "viewer123",  r: "Viewer"  },
            ].map(row => (
              <button
                key={row.u}
                type="button"
                onClick={() => { setUsername(row.u); setPassword(row.p); setError(""); }}
                className="w-full flex items-center justify-between rounded-md px-2 py-1 hover:bg-saffron/5 transition-colors text-left"
              >
                <span className="text-foreground font-mono" style={{ fontSize: "0.72rem" }}>
                  {row.u} / {row.p}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-white font-medium ${
                    row.r === "Admin"   ? "bg-saffron"  :
                    row.r === "Manager" ? "bg-navy"     : "bg-gray-400"
                  }`}
                  style={{ fontSize: "0.6rem" }}
                >
                  {row.r}
                </span>
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-2" style={{ fontSize: "0.62rem" }}>
            Click a row to auto-fill credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
