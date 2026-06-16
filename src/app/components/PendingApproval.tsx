import { useNavigate } from "react-router";
import { Flower2, Clock, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function PendingApproval() {
  const { pendingEmail, pendingName, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
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

        <div className="bg-white rounded-2xl border border-saffron/10 shadow-xl shadow-saffron/5 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-foreground font-semibold mb-2" style={{ fontSize: "1.05rem" }}>
            Pending Approval
          </h2>

          <p className="text-muted-foreground mb-4" style={{ fontSize: "0.82rem" }}>
            Your account is pending admin approval. Please wait for an administrator to approve your account.
          </p>

          {pendingName && (
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <p className="text-foreground font-medium" style={{ fontSize: "0.82rem" }}>
                {pendingName}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                {pendingEmail}
              </p>
            </div>
          )}

          <p className="text-muted-foreground mb-6" style={{ fontSize: "0.72rem" }}>
            You will be able to access the dashboard once an administrator approves your account.
          </p>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border hover:bg-muted/30 text-muted-foreground transition-colors"
            style={{ fontSize: "0.85rem" }}
          >
            <LogOut className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
