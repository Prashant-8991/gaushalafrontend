import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  TrendingUp, Users, ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles, Activity, Shield,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { kpiData, herdImage, Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";
import { useQuery } from "@tanstack/react-query";
import type { DashboardApiResponse } from "../types/dashboardResponse";
import { CowIcon, MilkDrop, HeartIcon, BabyIcon, Drop, PregnantIcon } from "./icons/icons";
import { PageLoader, CowLoaderMark } from "./ui/loader";

const STATUS_COLORS = ["#DC4F0A", "#142E55", "#0F7A3D", "#7C3AED", "#6B6759"];
const SOURCE_COLORS = ["#DC4F0A", "#142E55", "#0F7A3D", "#7C3AED"];

/* ─── Animated counter ─── */
function AnimatedNumber({ value, duration = 1.2, className = "" }: { value: number | null | undefined; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const target = value ?? 0;
    const start = ref.current;
    const startTime = performance.now();
    let frame: number;
    const tick = (t: number) => {
      const elapsed = (t - startTime) / (duration * 1000);
      const v = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - v, 3);
      const current = Math.round(start + (target - start) * eased);
      setDisplay(current);
      if (v < 1) frame = requestAnimationFrame(tick);
      else ref.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span className={`metric ${className}`}>{display}</span>;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
  hint?: string;
  trend?: { value: number; positive: boolean };
  index: number;
  onClick?: () => void;
}

function KPICard({ icon, label, value, hint, trend, index, onClick }: KPICardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`group w-full text-left surface p-5 hover-lift focus-ring relative overflow-hidden ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        <span className="text-muted-foreground/40 group-hover:text-saffron transition-colors shrink-0">
          {icon}
        </span>
      </div>
      <p className="text-[2rem] font-semibold text-foreground leading-none mt-4">
        <AnimatedNumber value={value ?? 0} />
      </p>
      <div className="flex items-center gap-1.5 mt-3 min-h-[1rem]">
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-[0.7rem] font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
            {trend.positive ? <ArrowUpRight className="w-3 h-3" strokeWidth={2} /> : <ArrowDownRight className="w-3 h-3" strokeWidth={2} />}
            <span className="metric">{trend.value}%</span>
          </span>
        )}
        {hint && <span className="text-[0.7rem] text-muted-foreground truncate">{hint}</span>}
      </div>
    </motion.button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const getDashboardData = async (): Promise<DashboardApiResponse> => {
    const response = await fetch(`${API_BASE}/dashboard`);
    if (!response.ok) throw new Error(`An error occurred: ${response.statusText}`);
    return response.json() as Promise<DashboardApiResponse>;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

  const milkMonthly = data?.month_wise_milk_production || [];
  const milkAvg = milkMonthly.length
    ? +(milkMonthly.reduce((s: number, m: any) => s + (m.total_milk || 0), 0) / milkMonthly.length).toFixed(0)
    : null;

  if (isLoading) return <PageLoader label="Loading dashboard…" />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="surface p-8 text-center max-w-md"
        >
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">{String(error)}</p>
        </motion.div>
      </div>
    );
  }

  const statusDistribution = [
    { status: "Milking",  count: data?.total_milking_cow },
    { status: "Pregnant", count: data?.total_pregnant_cow },
    { status: "Calves",   count: (data?.total_male_calf ?? 0) + (data?.total_female_calf ?? 0) },
    { status: "Bulls",    count: data?.total_bull },
    { status: "Oxen",     count: data?.total_ox },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* ─── Header strip ─── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-saffron/10 border border-saffron/20">
              <Sparkles className="w-2.5 h-2.5 text-saffron" strokeWidth={2} />
              <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-saffron">Overview</span>
            </span>
          </div>
          <h1 className="text-[1.65rem] font-semibold text-foreground leading-tight tracking-[-0.022em]">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} — <span className="metric text-foreground"><AnimatedNumber value={data?.total_cattle ?? 0} /></span> cattle monitored
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[0.78rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </span>
          <span className="text-border">·</span>
          <span>Updated just now</span>
        </div>
      </motion.div>

      {/* ─── KPI row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<CowIcon size={16} strokeWidth={1.6} />}
          label="Total herd"
          value={data?.total_cattle}
          hint={`${data?.total_female_cattle ?? 0} ♀ · ${data?.total_male_cattle ?? 0} ♂`}
          trend={{ value: 4.2, positive: true }}
          index={0}
          onClick={() => navigate("/list-cattle/all")}
        />
        <KPICard
          icon={<MilkDrop size={16} strokeWidth={1.6} />}
          label="Milking"
          value={data?.total_milking_cow}
          hint={`${kpiData.totalMilkToday} L/day`}
          trend={{ value: 8.1, positive: true }}
          index={1}
          onClick={() => navigate("/list-cattle/milking")}
        />
        <KPICard
          icon={<PregnantIcon size={16} strokeWidth={1.6} />}
          label="Pregnant"
          value={data?.total_pregnant_cow}
          hint="Expecting calves"
          index={2}
        />
        <KPICard
          icon={<BabyIcon size={16} strokeWidth={1.6} />}
          label="Calves"
          value={(data?.total_male_calf ?? 0) + (data?.total_female_calf ?? 0)}
          hint={`${data?.total_female_calf ?? 0} ♀ · ${data?.total_male_calf ?? 0} ♂`}
          index={3}
        />
      </div>

      {/* ─── Main charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="surface p-6 flex flex-col"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Production</p>
              <h3 className="text-[1.05rem] font-semibold text-foreground tracking-[-0.01em] mt-1.5">Monthly milk output</h3>
            </div>
            <div className="flex items-center gap-3 text-[0.72rem]">
              {milkAvg != null && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-px bg-muted-foreground" />
                  <span className="text-muted-foreground">Avg <span className="text-foreground font-medium metric">{milkAvg} L</span></span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 rounded bg-saffron" />
                <span className="text-muted-foreground">Output</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] mt-5 -mx-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={milkMonthly} margin={{ top: 6, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC4F0A" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#DC4F0A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={6} />
                <YAxis axisLine={false} tickLine={false} width={36} />
                <Tooltip cursor={{ stroke: "#DC4F0A", strokeWidth: 1, strokeDasharray: "2 2" }} />
                <Area
                  type="monotone"
                  dataKey="total_milk"
                  stroke="#DC4F0A"
                  strokeWidth={2}
                  fill="url(#milkG)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="surface p-6 flex flex-col"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">Distribution</p>
              <h3 className="text-[1.05rem] font-semibold text-foreground tracking-[-0.01em] mt-1.5">Herd by status</h3>
            </div>
            <span className="text-[0.72rem] text-muted-foreground metric"><AnimatedNumber value={data?.total_cattle} /> total</span>
          </div>

          <div className="relative flex-1 min-h-[180px] mt-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={74}
                  paddingAngle={2} dataKey="count" nameKey="status"
                  stroke="none"
                  animationDuration={1200}
                >
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[1.6rem] font-semibold text-foreground metric leading-none">
                <AnimatedNumber value={data?.total_cattle} />
              </p>
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground mt-1.5">cattle</p>
            </div>
          </div>

          <div className="space-y-1.5 mt-5 pt-4 border-t border-border">
            {statusDistribution.map((s, i) => (
              <motion.div
                key={s.status}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex items-center justify-between text-[0.82rem]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{s.status}</span>
                </div>
                <span className="font-semibold text-foreground metric">{s.count ?? 0}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Insight row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="surface p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">Source breakdown</p>
            <span className="text-[0.7rem] text-muted-foreground">by acquisition</span>
          </div>
          <div className="flex-1 min-h-[140px] -mx-2">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data?.source_breakdown || []} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="acquisition_type" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="total_cattle" radius={[3, 3, 0, 0]} maxBarSize={36} animationDuration={1200}>
                  {(data?.source_breakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="surface p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">Generations</p>
            <span className="text-[0.7rem] text-muted-foreground">foundation → F4</span>
          </div>
          <div className="flex-1 min-h-[140px] -mx-2">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data?.generation || []} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="generation" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={70} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="total_cattle" radius={[0, 3, 3, 0]} maxBarSize={14} animationDuration={1200}>
                  {(data?.generation ?? []).map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="surface overflow-hidden flex flex-col"
        >
          <div className="relative h-32 overflow-hidden">
            <ImageWithFallback src={herdImage} alt="Herd" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-5 right-5">
              <p className="text-[0.6rem] uppercase tracking-wider text-white/70 font-medium">Quick insight</p>
              <p className="text-white text-[0.95rem] font-medium tracking-tight">Avg per cow</p>
            </div>
          </div>
          <div className="p-4 space-y-2.5 flex-1">
            {[
              { icon: <Drop size={13} strokeWidth={1.8} />, l: "Avg milk / cow / day", v: `${data?.average_milk_by_per_cattle?.average_milk_by_per_cattle ?? 0} L` },
              { icon: <Shield size={13} strokeWidth={1.8} />, l: "Top breed score", v: `${data?.top_10_fit_cattle?.[0]?.total_score ?? 0}/10` },
              { icon: <Activity size={13} strokeWidth={1.8} />, l: "Avg per cow · total", v: `${data?.average_milk_by_per_cattle?.average_milk_by_per_cattle ?? 0} L` },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="flex items-center justify-between text-[0.8rem]"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-saffron">{s.icon}</span>
                  <span>{s.l}</span>
                </div>
                <span className="font-semibold text-foreground metric">{s.v}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Leaderboards ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="surface overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <MilkDrop size={14} className="text-saffron" strokeWidth={1.6} />
              <h3 className="text-[0.95rem] font-semibold text-foreground tracking-[-0.01em]">Top milkers</h3>
            </div>
            <button
              onClick={() => navigate("/list-cattle/milking")}
              className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-0.5 group"
            >
              View all
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex-1">
            {(data?.top_10_milking_cattle ?? []).slice(0, 6).map((cow, i) => (
              <motion.button
                key={cow.id ?? i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedCow(cow)}
                whileHover={{ x: 2 }}
                className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-muted/40 transition-colors text-left group border-b border-border/40 last:border-0"
              >
                <span className="w-5 text-[0.7rem] font-medium text-muted-foreground/40 metric">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-8 h-8 rounded-md bg-saffron/10 text-saffron ring-1 ring-saffron/20 flex items-center justify-center shrink-0">
                  <CowIcon size={16} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.88rem] font-medium text-foreground truncate leading-tight">{cow.name}</p>
                  <p className="text-[0.7rem] text-muted-foreground tabular">
                    {cow.tagNumber} · Gen {cow.generation}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.92rem] font-semibold text-foreground metric">{cow.total_milk} L</p>
                  <p className="text-[0.62rem] text-muted-foreground uppercase tracking-wider">total</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-saffron group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="surface overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Shield size={14} className="text-navy dark:text-blue-300" strokeWidth={1.6} />
              <h3 className="text-[0.95rem] font-semibold text-foreground tracking-[-0.01em]">Top breed scores</h3>
            </div>
            <button
              onClick={() => navigate("/genealogy")}
              className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-0.5 group"
            >
              View all
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex-1">
            {(data?.top_10_fit_cattle ?? []).slice(0, 6).map((cow, i) => (
              <motion.button
                key={cow.id ?? i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedCow(cow)}
                whileHover={{ x: 2 }}
                className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-muted/40 transition-colors text-left group border-b border-border/40 last:border-0"
              >
                <span className="w-5 text-[0.7rem] font-medium text-muted-foreground/40 metric">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-8 h-8 rounded-md bg-navy/10 text-navy flex items-center justify-center shrink-0 ring-1 ring-navy/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20">
                  <Shield size={16} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.88rem] font-medium text-foreground truncate leading-tight">{cow.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-navy to-saffron"
                        initial={{ width: 0 }}
                        animate={{ width: `${(cow.total_score / 10) * 100}%` }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-[0.7rem] text-muted-foreground metric shrink-0">{Number(cow.total_score).toFixed(1)}/10</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-saffron group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>
    </div>
  );
}
