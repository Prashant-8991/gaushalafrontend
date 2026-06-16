import { useState } from "react";
import { useNavigate } from "react-router";
import { Flower2 } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setError("");
    const result = await loginWithGoogle(credentialResponse.credential);
    setLoading(false);
    if (result.success) {
      navigate("/", { replace: true });
    } else if (result.pending) {
      navigate("/pending-approval", { replace: true });
    } else {
      setError("Authentication failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FFFDF8] px-4"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-saffron/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-navy/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shadow-lg shadow-saffron/30 mb-4">
            <Flower2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-foreground font-bold tracking-wide" style={{ fontSize: "1.4rem" }}>
            GauShala
          </h1>
          <p className="text-muted-foreground tracking-widest uppercase mt-0.5" style={{ fontSize: "0.65rem" }}>
            Somnath Temple Trust
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-saffron/10 shadow-xl shadow-saffron/5 p-8">
          <h2 className="text-foreground font-semibold mb-1" style={{ fontSize: "1.05rem" }}>
            Sign in to your account
          </h2>
          <p className="text-muted-foreground mb-6" style={{ fontSize: "0.78rem" }}>
            Use your Google account to access the dashboard.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5 mb-4" style={{ fontSize: "0.78rem" }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-8 h-8 border-3 border-saffron/30 border-t-saffron rounded-full animate-spin" />
              <span className="ml-3 text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                Signing in...
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
                theme="outline"
              />
            </div>
          )}
        </div>

        <div className="mt-5 bg-white/60 rounded-xl border border-saffron/10 px-4 py-3">
          <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
            New users require admin approval before accessing the dashboard. After your first login, an administrator will review and approve your account.
          </p>
        </div>
      </div>
    </div>
  );
}
