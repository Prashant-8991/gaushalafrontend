import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Flower2, Droplets, Heart, AlertTriangle, TrendingUp, Users,
  Activity, Scale, Baby, Milk, Shield, Maximize2, X, FileSpreadsheet, Loader2,
  ArrowUp, ArrowDown, CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine,
} from "recharts";
import { kpiData, heroImage, herdImage, cows, Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";
import { useQuery } from "@tanstack/react-query";
import { SiHappycow } from "react-icons/si";
import type { DashboardApiResponse } from "../types/dashboardResponse";


const STATUS_COLORS = ["#FF6B00", "#E91E63", "#4FC3F7", "#1B3A6B", "#9E9E9E"];
const SOURCE_COLORS = ["#28a745", "#FF6B00", "#1B3A6B", "#8B5CF6"];
const GEN_COLORS = ["#0F2340", "#1B3A6B", "#FF6B00", "#FF9933", "#FFC107"];

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
}

interface MilkDailyRow {
  tag_number: string;
  name: string;
  date: string;
  milk: number;
}

function KPICard({ icon, label, value, subtitle, gradient }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-saffron/10 p-4 hover:shadow-lg hover:shadow-saffron/5 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground mb-1">{label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-foreground">{value}</p>
          {subtitle && <p style={{ fontSize: '0.7rem' }} className="text-saffron mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [isPresentFilter, setIsPresentFilter] = useState<number | null>(null);

  const getDashboardData = async (): Promise<DashboardApiResponse> => {
    const url = isPresentFilter === null ? `${API_BASE}/dashboard` : `${API_BASE}/dashboard?is_present=${isPresentFilter}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    return response.json() as Promise<DashboardApiResponse>;
  }

  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard', isPresentFilter],
    queryFn: getDashboardData
  });

  // Hero counts — always show true active vs total, independent of herd filter
  const { data: heroData } = useQuery({
    queryKey: ['dashboard-hero'],
    queryFn: async (): Promise<DashboardApiResponse> => {
      const res = await fetch(`${API_BASE}/dashboard?is_present=1`);
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    },
    staleTime: 30000,
  });

  interface TopMilkerCurrentMonth {
    tag_number: string;
    name: string;
    total_milk: number;
    avg_milk: number | null;
    days_logged: number | null;
    gender: string | null;
    animal_type: string | null;
  }

  const getTopMilkersCurrentMonth = async (): Promise<TopMilkerCurrentMonth[]> => {
    const res = await fetch(`${API_BASE}/dashboard/top-milkers-current-month`);
    if (!res.ok) throw new Error("Failed to fetch top milkers");
    return res.json();
  };

  const { data: currentMonthMilkers } = useQuery({
    queryKey: ["top-milkers-current-month"],
    queryFn: getTopMilkersCurrentMonth,
  });

  interface BottomMilkerCurrentMonth {
    tag_number: string;
    name: string;
    total_milk: number;
    avg_milk: number | null;
    days_logged: number | null;
    gender: string | null;
    animal_type: string | null;
  }

  const getBottomMilkersCurrentMonth = async (): Promise<BottomMilkerCurrentMonth[]> => {
    const res = await fetch(`${API_BASE}/dashboard/bottom-milkers-current-month`);
    if (!res.ok) throw new Error("Failed to fetch bottom milkers");
    return res.json();
  };

  const { data: currentMonthBottomMilkers } = useQuery({
    queryKey: ["bottom-milkers-current-month"],
    queryFn: getBottomMilkersCurrentMonth,
  });


  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [fsChart, setFsChart] = useState(false);
  const [showMilkTable, setShowMilkTable] = useState(false);
  const [milkTableMode, setMilkTableMode] = useState<"summary" | "daily">("daily");
  const [sortKey, setSortKey] = useState<number | "total">("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getMilkingCurrentMonth = async (): Promise<TopMilkerCurrentMonth[]> => {
    const res = await fetch(`${API_BASE}/dashboard/milking-current-month`);
    if (!res.ok) throw new Error("Failed to fetch current month milking data");
    return res.json();
  };

  const {
    data: milkingCurrentMonth,
    isLoading: milkTableLoading,
    error: milkTableError,
  } = useQuery({
    queryKey: ["milking-current-month"],
    queryFn: getMilkingCurrentMonth,
    enabled: fsChart && showMilkTable,
  });

  const getMilkDailyCurrentMonth = async (): Promise<MilkDailyRow[]> => {
    const res = await fetch(`${API_BASE}/dashboard/milk-daily-current-month`);
    if (!res.ok) throw new Error("Failed to fetch daily milk data");
    return res.json();
  };

  const {
    data: milkDaily,
    isLoading: milkDailyLoading,
    error: milkDailyError,
  } = useQuery({
    queryKey: ["milk-daily-current-month"],
    queryFn: getMilkDailyCurrentMonth,
    enabled: fsChart && showMilkTable,
  });

  const currentMonthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Pivot daily rows into one row per cow: { tag, name, days: {1:4.5, ...}, total }
  const dailyByCow: { tag_number: string; name: string; days: Record<number, number>; total: number }[] = [];
  {
    const index = new Map<string, number>();
    (milkDaily || []).forEach(r => {
      const day = parseInt(r.date.slice(8, 10), 10);
      let i = index.get(r.tag_number);
      if (i === undefined) {
        i = dailyByCow.length;
        index.set(r.tag_number, i);
        dailyByCow.push({ tag_number: r.tag_number, name: r.name || "—", days: {}, total: 0 });
      }
      const entry = dailyByCow[i];
      entry.days[day] = (entry.days[day] || 0) + r.milk;
      entry.total += r.milk;
    });
  }

  const todayDay = now.getDate();
  // Days that have at least one milk record across all cows. Days with none are
  // treated as "no data for this day" and rendered as "-".
  const daysWithData = new Set<number>();
  dailyByCow.forEach(cow => Object.keys(cow.days).forEach(k => daysWithData.add(Number(k))));
  const dailySorted = [...dailyByCow].sort((a, b) => {
    const va = sortKey === "total" ? a.total : (a.days[sortKey] ?? -1);
    const vb = sortKey === "total" ? b.total : (b.days[sortKey] ?? -1);
    return sortDir === "asc" ? va - vb : vb - va;
  });
  const visibleDayColumns = selectedDay != null ? [selectedDay] : dayColumns;

  const handleDayClick = (d: number) => {
    if (selectedDay === d) {
      setSelectedDay(null);
      setSortKey("total");
    } else {
      setSelectedDay(d);
      setSortKey(d);
    }
  };

  const exportMilkingXLSX = () => {
    const wb = XLSX.utils.book_new();

    if (milkTableMode === "daily") {
      const header = ["Tag", "Name", ...visibleDayColumns.map(d => `Day ${d}`), "Total"];
      const aoa = [
        header,
        ...dailySorted.map(cow => [
          cow.tag_number,
          cow.name,
          ...visibleDayColumns.map(d => cow.days[d] ?? ""),
          +cow.total.toFixed(1),
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = [{ wch: 14 }, { wch: 24 }, ...visibleDayColumns.map(() => ({ wch: 6 })), { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, "Daily Milk");
    } else {
      const rows = (milkingCurrentMonth || []).map((r, i) => ({
        "Sr No": i + 1,
        "Tag Number": r.tag_number,
        "Name": r.name,
        "Gender": r.gender || "",
        "Animal Type": r.animal_type || "",
        "Total Milk (L)": r.total_milk,
        "Avg Milk (L)": r.avg_milk ?? "",
        "Days Logged": r.days_logged ?? "",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
    }

    const suffix = milkTableMode === "daily" ? "daily_milk" : "milking_summary";
    XLSX.writeFile(wb, `${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const milkMonthly = data?.month_wise_milk_production || [];
  const milkAvg = milkMonthly.length
    ? +(milkMonthly.reduce((s: number, m: any) => s + (m.total_milk || 0), 0) / milkMonthly.length).toFixed(0)
    : null;

  // Compact, readable X-axis labels (handles YYYY-MM and YYYY-MM-DD) and an
  // adaptive interval so labels never overlap regardless of data volume.
  const MILK_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatMilkMonth = (val: string | null) => {
    if (!val) return "";
    let m = /^(\d{4})-(\d{2})$/.exec(val);
    if (m) return `${MILK_MONTHS[parseInt(m[2], 10) - 1]} '${m[1].slice(2)}`;
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(val);
    if (m) return `${parseInt(m[3], 10)} ${MILK_MONTHS[parseInt(m[2], 10) - 1]}`;
    return val;
  };
  const tickIntervalFor = (count: number, target: number) =>
    count <= target ? 0 : Math.ceil(count / target) - 1;
  const milkTickInterval = tickIntervalFor(milkMonthly.length, 10);
  const fsMilkTickInterval = tickIntervalFor(milkMonthly.length, 16);

  const topMilkers = cows
    .filter(c => c.dailyMilk > 0)
    .sort((a, b) => b.dailyMilk - a.dailyMilk)
    .slice(0, 8);

  const topBreed = [...cows]
    .sort((a, b) => b.totalBreedScore - a.totalBreedScore)
    .slice(0, 5);

  if (isLoading) {
    return "Loading ......"
  }

  if (error) {
    return `Error: ${error}`
  }


  const statusDistribution = [
    {
      "status": "Milking", count: data?.total_milking_cow,
    },
    {
      "status": "Pregnant", count: data?.total_pregnant_cow
    },
    {
      "status": "Calves", count: (data?.total_male_calf + data?.total_female_calf)
    },
    {
      "status": "Bull", count: data?.total_bull
    },
    {
      "status": "OX", count: data?.total_ox
    }
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="relative overflow-hidden rounded-[32px] h-[300px] lg:h-[360px] border border-white/10 shadow-2xl group">

        {/* Background Image */}
        <img
          src="https://t4.ftcdn.net/jpg/12/55/70/67/360_F_1255706772_VN5ObaaNkgoTLgtAIqiBmpZFTLC45EO8.jpg"
          alt="Gaushala"
          className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
        />

        {/* Main Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071021]/95 via-[#0b1324]/85 to-[#0b1324]/40" />

        {/* Glow Effects */}
        <div className="absolute -top-16 right-0 w-72 h-72 bg-orange-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-0 w-72 h-72 bg-amber-300/10 blur-3xl rounded-full" />

        {/* Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-6 lg:p-10">

          {/* Top Section */}
          <div className="flex items-start justify-between gap-4">

            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/10 rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-orange-300" />
              <span className="text-[11px] lg:text-xs uppercase tracking-[0.25em] text-orange-100 font-semibold">
                Shree Somnath Temple Trust Gaushala
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 backdrop-blur-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-200">
                Active Monitoring
              </span>
            </div>

          </div>

          {/* Bottom Content */}
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Gir Cattle
              <span className="block bg-gradient-to-r from-orange-200 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            <p className="text-sm lg:text-base leading-relaxed text-white/70 max-w-2xl">
              Monitoring{" "}
              <span className="text-white font-semibold">{heroData?.total_cattle ?? data?.total_cattle ?? "—"} active cattle</span>{" "}
              while maintaining lifecycle records for{" "}
              <span className="text-orange-300 font-semibold">
                {heroData?.all_cattle_data ?? data?.all_cattle_data ?? "—"} total registered cattle
              </span>
              , including health tracking, breeding analytics, and milk production management.
            </p>

          </div>
        </div>
      </div>

      {/* Global Present Filter */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-saffron/10 p-3 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-saffron" /> Herd Filter:
        </span>
        <button onClick={() => setIsPresentFilter(1)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${isPresentFilter === 1 ? "bg-green-500 text-white border-green-500 shadow" : "bg-white text-muted-foreground border-saffron/20 hover:border-green-300"}`}>Present</button>
        <button onClick={() => setIsPresentFilter(0)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${isPresentFilter === 0 ? "bg-red-500 text-white border-red-500 shadow" : "bg-white text-muted-foreground border-saffron/20 hover:border-red-300"}`}>Not Present</button>
        {isPresentFilter !== null && <button onClick={() => setIsPresentFilter(null)} className="ml-auto text-xs text-saffron hover:text-saffron-dark font-medium">Clear → All</button>}
        <span className="text-[0.65rem] text-muted-foreground ml-2 hidden sm:inline">{isPresentFilter === 1 ? "Showing present cattle" : isPresentFilter === 0 ? "Showing not present cattle" : "Showing all cattle"}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div onClick={() => navigate("/list-cattle/all")} className="cursor-pointer">
          <KPICard icon={<Flower2 className="w-5 h-5 text-white" />} label="Total Herd" value={data?.total_cattle}
            subtitle={`${data?.total_female_cattle}F / ${data?.total_male_cattle}M`} gradient="bg-gradient-to-br from-saffron to-saffron-dark" />
        </div>
        <div onClick={() => navigate("/list-cattle/milking")} className="cursor-pointer">
          <KPICard icon={<Milk className="w-5 h-5 text-white" />} label="Milking" value={data?.total_milking_cow}
            subtitle=" ." gradient="bg-gradient-to-br from-navy to-navy-dark" />
        </div>
        <KPICard icon={<Baby className="w-5 h-5 text-white" />} label="Pregnant" value={data?.total_pregnant_cow}
          subtitle="Expecting calves" gradient="bg-gradient-to-br from-pink-500 to-pink-700" />
        <KPICard icon={<Heart className="w-5 h-5 text-white" />} label="Calves" value={data?.total_male_calf + data?.total_female_calf}
          subtitle={`${data?.total_female_calf}F / ${data?.total_male_calf}M`} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart Card */}
        <div className="lg:col-span-2 h-full relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
              <TrendingUp className="w-5 h-5 text-saffron" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Monthly Milk Production (Liters)
            </h3>
            <button onClick={() => setFsChart(true)} className="ml-auto p-1.5 rounded-lg hover:bg-orange-50 transition-colors" title="Full Screen"><Maximize2 className="w-4 h-4 text-saffron/50 hover:text-saffron" /></button>
          </div>

          {milkAvg != null && <p className="text-xs text-slate-400 -mt-4 mb-4">Average: <span className="font-semibold text-navy">{milkAvg} L</span></p>}

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart
              data={milkMonthly}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMilkMonth}
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={milkTickInterval}
                minTickGap={24}
                angle={-35}
                textAnchor="end"
                height={70}
                tickMargin={12}
                padding={{ left: 12, right: 12 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)"
                }}
              />
              {milkAvg != null && <ReferenceLine y={milkAvg} stroke="#1B3A6B" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${milkAvg} L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 11 }} />}
              <Area
                type="monotone"
                dataKey="total_milk"
                stroke="#FF6B00"
                strokeWidth={3}
                fill="url(#milkG)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#FF6B00" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Card */}
        <div className="h-full flex flex-col relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
          {/* Decorative Background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Herd Status
                </h3>
                <p className="text-xs text-slate-500">
                  Live cattle distribution overview
                </p>
              </div>
            </div>
            {/* Total Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200">
              Total: {data?.total_cattle}
            </div>
          </div>

          {/* Chart */}
          <div className="relative flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <defs>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.15" />
                  </filter>
                </defs>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                  stroke="transparent"
                  filter="url(#shadow)"
                >
                  {statusDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[i]}
                      className="hover:opacity-80 transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <h2 className="text-3xl font-black text-slate-800">
                {data?.total_cattle}
              </h2>
              <p className="text-xs tracking-wide uppercase text-slate-500 font-medium">
                Total Cattle
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {statusDistribution.map((s, i) => (
              <div
                key={s.status}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-sm px-4 py-3 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: STATUS_COLORS[i] }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {s.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">
                    {s.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-saffron" />
            <h3>Source Breakdown</h3>
          </div>
          {/* <ResponsiveContainer width="100%" height={160}>
            <BarChart data={kpiData.sourceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="source" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {kpiData.sourceDistribution.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer> */}
          <ResponsiveContainer width="100%" height={160}>
            {/* Fallback to an empty array so Recharts doesn't complain during loading */}
            <BarChart data={data?.source_breakdown || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="acquisition_type" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />

              {/* Corrected dataKey to match your API response */}
              <Bar dataKey="total_cattle" radius={[6, 6, 0, 0]}>
                {/* Added safe optional chaining (?.) before map */}
                {data?.source_breakdown?.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    /* Added modulo (%) to prevent crashing if there are more bars than colors */
                    fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-navy" />
            <h3>Generations</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            {/* Fallback to an empty array so Recharts doesn't complain during loading */}
            <BarChart data={data?.generation || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />

              {/* Fix 1: Changed dataKey from "gen" to "generation" */}
              <YAxis dataKey="generation" type="category" tick={{ fontSize: 9 }} width={90} />

              <Tooltip />

              {/* Fix 2: Changed dataKey from "count" to "total_cattle" */}
              <Bar dataKey="total_cattle" radius={[0, 6, 6, 0]}>

                {/* Fix 3: Changed the mapping source to match your actual data */}
                {data?.generation?.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={GEN_COLORS[i % GEN_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 overflow-hidden">
          <div className="h-32">
            <ImageWithFallback src={herdImage} alt="Herd" className="w-full h-full object-cover" />
          </div>
          <div className="p-4 space-y-2">
            {[
              { icon: <Droplets className="w-3.5 h-3.5 text-saffron" />, l: "Avg Milk/Cow", v: `${data?.average_milk_by_per_cattle.average_milk_by_per_cattle}L/day` },
              { icon: <Shield className="w-3.5 h-3.5 text-green-500" />, l: "Top Breed Score", v: `${data?.top_10_fit_cattle[0].total_score}/10` },
            ].map(s => (
              <div key={s.l} className="flex items-center justify-between py-1 border-b border-saffron/5 last:border-0">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span style={{ fontSize: '0.78rem' }} className="text-muted-foreground">{s.l}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Top Milking Cows */}
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg shadow-orange-100/50">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Droplets className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-lg">Top Milking Cows</h3>
                <p className="text-xs text-orange-100">
                  Highest milk production leaderboard
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {data?.top_10_milking_cattle.map((cow, i) => (
              <div
                key={cow.id ?? i}
                onClick={() => setSelectedCow(cow)}
                className="
            group
            flex items-center gap-4
            rounded-2xl
            border border-gray-100
            bg-gradient-to-r from-white to-orange-50/40
            p-4
            cursor-pointer
            hover:shadow-xl
            hover:-translate-y-1
            transition-all duration-300
          "
              >
                {/* Rank */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <SiHappycow size={32} className="text-orange-600" />
                  </div>

                  <div className="
              absolute -top-2 -right-2
              w-6 h-6 rounded-full
              bg-gradient-to-r from-orange-500 to-amber-500
              text-white text-xs font-bold
              flex items-center justify-center
              shadow-lg
            ">
                    {i + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {cow.name}
                  </h4>

                  <p className="text-xs text-muted-foreground">
                    #{cow.tagNumber} • Gen {cow.generation}
                  </p>
                </div>

                <div className="text-right">
                  <div className="
              px-3 py-1
              rounded-full
              bg-orange-100
              text-orange-700
              font-bold
              text-sm
            ">
                    {cow.total_milk} L
                  </div>

                  <p className="text-[10px] mt-1 text-muted-foreground">
                    Total Milk
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Breed Scores */}
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-100/50">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Shield className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Top Breed Scores
                </h3>

                <p className="text-xs text-blue-100">
                  Highest breed fitness ranking
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {data?.top_10_fit_cattle.map((cow, i) => (
              <div
                key={cow.tag_number ?? i}
                onClick={() => setSelectedCow(cow)}
                className="
            group
            flex items-center gap-4
            rounded-2xl
            border border-gray-100
            bg-gradient-to-r from-white to-blue-50/40
            p-4
            cursor-pointer
            hover:shadow-xl
            hover:-translate-y-1
            transition-all duration-300
          "
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <SiHappycow size={32} className="text-blue-700" />
                  </div>

                  <div className="
              absolute -top-2 -right-2
              w-6 h-6 rounded-full
              bg-gradient-to-r from-blue-700 to-indigo-700
              text-white text-xs font-bold
              flex items-center justify-center
              shadow-lg
            ">
                    {i + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {cow.name}
                  </h4>

                  <p className="text-xs text-muted-foreground">
                    #{cow.tag_number} • Gen {cow.generation}
                  </p>

                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="
                  h-full rounded-full
                  bg-gradient-to-r
                  from-blue-600
                  via-indigo-500
                  to-orange-400
                "
                      style={{
                        width: `${(cow.total_score / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="
            w-14 h-14 rounded-full
            bg-gradient-to-br
            from-blue-700
            to-indigo-700
            text-white
            flex flex-col
            items-center
            justify-center
            shadow-lg
          ">
                  <span className="font-bold text-lg leading-none">
                    {Number(cow.total_score).toFixed(2)}
                  </span>

                  <span className="text-[9px] opacity-80">
                    /10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Top 10 Milking Cows — Current Month ───── */}
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Top 10 Milking Cows — Current Month</h3>
              <p className="text-xs text-emerald-100">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} leaderboard by total milk
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {currentMonthMilkers && currentMonthMilkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              {currentMonthMilkers.map((cow, i) => (
                <button
                  key={cow.tag_number}
                  onClick={() => navigate(`/cattle/${encodeURIComponent(cow.tag_number)}`)}
                  className="group relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-emerald-50/40 p-3 text-left hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${i === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600" : i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" : i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-700" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
                      <SiHappycow size={24} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[0.6rem] font-bold flex items-center justify-center shadow">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{cow.name}</p>
                    <p className="text-[0.6rem] text-muted-foreground">#{cow.tag_number}</p>
                    <p className="text-[0.55rem] text-muted-foreground">{cow.animal_type || cow.gender || ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      {cow.total_milk} L
                    </div>
                    {cow.avg_milk != null && (
                      <p className="text-[0.5rem] mt-0.5 text-muted-foreground">
                        Avg {cow.avg_milk} L/day
                      </p>
                    )}
                    {cow.days_logged != null && (
                      <p className="text-[0.5rem] text-muted-foreground">
                        {cow.days_logged} days
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Droplets className="w-10 h-10 text-emerald-300 mb-2" />
              <p className="text-sm text-muted-foreground">No milk data recorded for this month yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ───── Bottom 10 Milking Cows — Current Month ───── */}
      <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-lg shadow-rose-100/50">
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Bottom 10 Milking Cows — Current Month</h3>
              <p className="text-xs text-rose-100">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} cows with lowest milk production
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {currentMonthBottomMilkers && currentMonthBottomMilkers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              {currentMonthBottomMilkers.map((cow, i) => (
                <button
                  key={cow.tag_number}
                  onClick={() => navigate(`/cattle/${encodeURIComponent(cow.tag_number)}`)}
                  className="group relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-rose-50/40 p-3 text-left hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${i === 0 ? "bg-gradient-to-br from-rose-500 to-rose-700" : i === 1 ? "bg-gradient-to-br from-orange-400 to-orange-600" : i === 2 ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-rose-400 to-pink-600"}`}>
                      <SiHappycow size={24} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white text-[0.6rem] font-bold flex items-center justify-center shadow">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{cow.name}</p>
                    <p className="text-[0.6rem] text-muted-foreground">#{cow.tag_number}</p>
                    <p className="text-[0.55rem] text-muted-foreground">{cow.animal_type || cow.gender || ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                      {cow.total_milk} L
                    </div>
                    {cow.avg_milk != null && (
                      <p className="text-[0.5rem] mt-0.5 text-muted-foreground">
                        Avg {cow.avg_milk} L/day
                      </p>
                    )}
                    {cow.days_logged != null && (
                      <p className="text-[0.5rem] text-muted-foreground">
                        {cow.days_logged} days
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Droplets className="w-10 h-10 text-rose-300 mb-2" />
              <p className="text-sm text-muted-foreground">No milk data recorded for this month yet.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>

      {fsChart && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => { setFsChart(false); setShowMilkTable(false); }}>
          <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
            <h2 className="text-white text-lg font-bold">
              {showMilkTable ? `Current Month Milking Cattle — ${currentMonthLabel}` : "Herd Monthly Milk Production (Liters)"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMilkTable(v => !v)}
                title={showMilkTable ? "Show chart" : "Show current month milking data"}
                className={`p-2 rounded-xl transition-colors ${showMilkTable ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white/10 hover:bg-white/20"}`}
              >
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => { setFsChart(false); setShowMilkTable(false); }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-hidden" onClick={e => e.stopPropagation()}>
            {showMilkTable ? (
              <div className="h-full flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                  <div>
                    <h3 className="text-white font-semibold">
                      {milkTableMode === "daily" ? "Daily Milk Data (every day)" : "Current Month Milking Cattle"}
                    </h3>
                    <p className="text-white/50 text-xs">
                      {currentMonthLabel} • {milkTableMode === "daily"
                        ? `${dailyByCow.length} cows × ${daysInMonth} days`
                        : `${milkingCurrentMonth?.length ?? 0} cows with milk logs`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl bg-white/10 p-1">
                      <button
                        onClick={() => setMilkTableMode("summary")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${milkTableMode === "summary" ? "bg-white text-gray-900" : "text-white/70 hover:text-white"}`}
                      >Summary</button>
                      <button
                        onClick={() => setMilkTableMode("daily")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${milkTableMode === "daily" ? "bg-white text-gray-900" : "text-white/70 hover:text-white"}`}
                      >Daily</button>
                    </div>

                    {milkTableMode === "daily" && (
                      <>
                        <div className="flex rounded-xl bg-white/10 p-1">
                          <button
                            onClick={() => setSortDir("asc")}
                            title="Sort ascending"
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sortDir === "asc" ? "bg-white text-gray-900" : "text-white/70 hover:text-white"}`}
                          ><ArrowUp className="w-3 h-3" /> Asc</button>
                          <button
                            onClick={() => setSortDir("desc")}
                            title="Sort descending"
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sortDir === "desc" ? "bg-white text-gray-900" : "text-white/70 hover:text-white"}`}
                          ><ArrowDown className="w-3 h-3" /> Desc</button>
                        </div>

                        {selectedDay != null && (
                          <button
                            onClick={() => { setSelectedDay(null); setSortKey("total"); }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-saffron/20 text-saffron-light text-xs font-semibold hover:bg-saffron/30 transition-colors"
                            title="Clear date filter"
                          >
                            <CalendarDays className="w-3.5 h-3.5" /> Day {selectedDay}
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={exportMilkingXLSX}
                      disabled={milkTableMode === "daily"
                        ? (milkDailyLoading || dailyByCow.length === 0)
                        : (milkTableLoading || !milkingCurrentMonth || milkingCurrentMonth.length === 0)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export Excel
                    </button>
                  </div>
                </div>

                {milkTableMode === "summary" ? (
                  milkTableLoading ? (
                    <div className="flex-1 flex items-center justify-center gap-2 text-white/70">
                      <Loader2 className="w-6 h-6 animate-spin" /> Loading milking data...
                    </div>
                  ) : milkTableError ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-300">
                      <AlertTriangle className="w-8 h-8" />
                      <p className="text-sm">Failed to load current month milking data</p>
                    </div>
                  ) : !milkingCurrentMonth || milkingCurrentMonth.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
                      No milking records for {currentMonthLabel}
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto rounded-xl border border-white/10">
                      <table className="w-full text-sm text-white">
                        <thead className="sticky top-0 z-10 bg-white/10 backdrop-blur">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Tag</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Gender</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Animal Type</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">Total Milk (L)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">Avg Milk (L)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">Days Logged</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milkingCurrentMonth.map((r, i) => (
                            <tr key={r.tag_number ?? i} className="border-t border-white/[0.06] hover:bg-white/[0.04]">
                              <td className="px-4 py-3 text-white/50">{i + 1}</td>
                              <td className="px-4 py-3 font-mono text-saffron-light">{r.tag_number}</td>
                              <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${r.gender?.toLowerCase() === "male" ? "bg-blue-500/20 text-blue-200" : "bg-pink-500/20 text-pink-200"}`}>
                                  {r.gender || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-white/70">{r.animal_type || "—"}</td>
                              <td className="px-4 py-3 text-right font-semibold text-emerald-300">{r.total_milk}</td>
                              <td className="px-4 py-3 text-right text-white/70">{r.avg_milk ?? "—"}</td>
                              <td className="px-4 py-3 text-right text-white/70">{r.days_logged ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  milkDailyLoading ? (
                    <div className="flex-1 flex items-center justify-center gap-2 text-white/70">
                      <Loader2 className="w-6 h-6 animate-spin" /> Loading daily milk data...
                    </div>
                  ) : milkDailyError ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-300">
                      <AlertTriangle className="w-8 h-8" />
                      <p className="text-sm">Failed to load daily milk data</p>
                    </div>
                  ) : dailyByCow.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
                      No daily milk records for {currentMonthLabel}
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto rounded-xl border border-white/10">
                      <table className={`w-full text-xs text-white border-collapse ${selectedDay == null ? "min-w-[1100px]" : ""}`}>
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gray-800">
                            <th className="sticky left-0 z-20 bg-gray-800 px-3 py-2 text-left font-semibold uppercase tracking-wider text-white/60">Tag</th>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-white/60 min-w-[140px]">Name</th>
                            {visibleDayColumns.map(d => {
                              const isToday = d === todayDay;
                              const isSelected = selectedDay === d;
                              return (
                                <th key={d} className={`px-2 py-2 text-center font-semibold ${isToday
                                  ? "text-saffron bg-saffron/15"
                                  : isSelected
                                    ? "text-emerald-200 bg-emerald-500/15"
                                    : "text-white/60"}`}>
                                  <button onClick={() => handleDayClick(d)} className="hover:underline" title={isToday ? "Today — click to filter/sort" : "Click to show this date only"}>
                                    {d}{isToday && <span className="block text-[0.5rem] font-normal text-saffron-light">today</span>}
                                  </button>
                                </th>
                              );
                            })}
                            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-emerald-300 cursor-pointer" onClick={() => setSortKey("total")} title="Sort by total">
                              Total {sortKey === "total" && (sortDir === "asc" ? "↑" : "↓")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailySorted.map(cow => (
                            <tr key={cow.tag_number} className="border-t border-white/[0.06] hover:bg-white/[0.04]">
                              <td className="sticky left-0 z-10 bg-gray-900 px-3 py-2 font-mono text-saffron-light whitespace-nowrap">{cow.tag_number}</td>
                              <td className="px-3 py-2 font-medium whitespace-nowrap max-w-[180px] truncate">{cow.name}</td>
                              {visibleDayColumns.map(d => {
                                const isFuture = d > todayDay;
                                const isNull = cow.days[d] == null;
                                if (isFuture) {
                                  return <td key={d} className="px-2 py-2 text-center text-transparent select-none">&nbsp;</td>;
                                }
                                if (!daysWithData.has(d)) {
                                  return <td key={d} className="px-2 py-2 text-center text-white/30">-</td>;
                                }
                                return (
                                  <td key={d} className={`px-2 py-2 text-center ${isNull
                                    ? "bg-red-500/20 text-red-300 font-semibold"
                                    : d === todayDay
                                      ? "bg-saffron/[0.07] text-white/80"
                                      : "text-white/80"}`}>
                                    {isNull ? 0 : cow.days[d]}
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 text-right font-semibold text-emerald-300">{+cow.total.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={milkMonthly} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs>
                    <linearGradient id="fsMilkG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMilkMonth}
                    tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                    interval={fsMilkTickInterval}
                    minTickGap={28}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                    tickMargin={12}
                    padding={{ left: 16, right: 16 }}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "13px" }} labelStyle={{ color: "#fff" }} />
                  {milkAvg != null && <ReferenceLine y={milkAvg} stroke="#1B3A6B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Average ${milkAvg} L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 13, fontWeight: "bold" }} />}
                  <Area type="monotone" dataKey="total_milk" stroke="#FF6B00" strokeWidth={3} fill="url(#fsMilkG)" dot={{ r: 3, fill: "#FF6B00" }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {!showMilkTable && (
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
              <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#FF6B00" }} /><span className="text-white/70 text-sm">Total Milk Per Month</span></div>
              {milkAvg != null && <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: "#1B3A6B", border: "1px dashed #1B3A6B" }} /><span className="text-white/70 text-sm">Average ({milkAvg} L)</span></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}