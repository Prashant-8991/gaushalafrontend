import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

/* ─── Inline loader — for queries, panels ─── */
export function Loader({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizes = { sm: 16, md: 20, lg: 28 };
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: s * 1.6, height: s * 1.6 }}>
        <svg
          width={s * 1.6}
          height={s * 1.6}
          viewBox="0 0 32 32"
          className="animate-spin"
          style={{ animationDuration: "1.2s" }}
        >
          <circle
            cx="16" cy="16" r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="60 30"
            className="text-saffron"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-saffron">
          <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="14" rx="5" ry="4" />
            <circle cx="12" cy="9" r="2.5" />
            <path d="M9 7 7 5M15 7l2-2" />
          </svg>
        </span>
      </div>
      {label && <p className="text-[0.78rem] text-muted-foreground">{label}</p>}
    </div>
  );
}

/* ─── Page loader — full screen, used while initial queries load ─── */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <CowLoaderMark size={56} />
      <div className="flex flex-col items-center gap-1">
        <p className="text-[0.85rem] font-medium text-foreground">{label}</p>
        <p className="text-[0.7rem] text-muted-foreground tracking-wide">Somnath Gaushala</p>
      </div>
    </div>
  );
}

/* ─── Full-screen boot loader (used on app start) ─── */
export function BootLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ["Loading herd data", "Syncing records", "Preparing dashboard"];

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 14 + 4;
        if (next >= 100) {
          clearInterval(t);
          return 100;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (progress > 30 && progress < 70) setPhase(1);
    else if (progress >= 70) setPhase(2);
    else setPhase(0);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
    >
      <BackgroundGrid />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white shadow-lg shadow-saffron/30">
            <Logo size={20} />
          </div>
          <div>
            <p className="text-[1.05rem] font-semibold text-foreground tracking-tight">Somnath Gaushala</p>
            <p className="text-[0.7rem] text-muted-foreground tracking-wider uppercase">Temple Trust</p>
          </div>
        </div>

        <CowLoaderMark size={72} />

        <div className="w-64 flex flex-col items-center gap-3">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-saffron to-saffron-light"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[0.78rem] text-muted-foreground"
            >
              {phases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Animated cow loader mark (the centerpiece) ─── */
export function CowLoaderMark({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Soft glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(220,79,10,0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Spinning orbit ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{ borderTopColor: "#DC4F0A", borderRightColor: "rgba(220,79,10,0.3)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
      {/* Cow silhouette inside */}
      <div className="absolute inset-0 flex items-center justify-center text-saffron">
        <motion.svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="12" cy="14" rx="5" ry="4" />
          <circle cx="12" cy="9" r="2.5" />
          <path d="M9 7 7 5M15 7l2-2" />
          <ellipse cx="10.5" cy="9" rx="0.4" ry="0.6" fill="currentColor" />
          <ellipse cx="13.5" cy="9" rx="0.4" ry="0.6" fill="currentColor" />
          <path d="M10.5 10.7c.4.3 1.1.5 1.5.5s1.1-.2 1.5-.5" />
          <path d="M7 17v-1M17 17v-1" />
        </motion.svg>
      </div>
    </div>
  );
}

/* ─── Background grid (used in boot loader) ─── */
function BackgroundGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#14171F_1px,transparent_1px),linear-gradient(to_bottom,#14171F_1px,transparent_1px)] bg-[size:48px_48px]" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(220,79,10,0.06) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Logo (small) ─── */
function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="9" cy="11" rx="0.7" ry="1.1" fill="currentColor" />
      <ellipse cx="15" cy="11" rx="0.7" ry="1.1" fill="currentColor" />
      <path d="M8 7c-1-1.5-2-1.5-2.5-1" />
      <path d="M16 7c1-1.5 2-1.5 2.5-1" />
      <path d="M10.5 14.5c.5.5 1 .7 1.5.7s1-.2 1.5-.7" />
      <path d="M9 17c1 .8 2 .8 3 0M12 17c1 .8 2 .8 3 0" />
    </svg>
  );
}

/* ─── Section transition (use between route changes) ─── */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
