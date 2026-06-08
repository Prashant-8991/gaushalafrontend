import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Flower2, Droplets, Heart, AlertTriangle, TrendingUp, Users,
  Activity, Scale, Baby, Milk, Shield, Maximize2, X,
} from "lucide-react";
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

  const getDashboardData = async (): Promise<DashboardApiResponse> => {
    const response = await fetch(`${API_BASE}/dashboard`);

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    // Type casting the JSON response ensures TS knows what this data looks like
    return response.json() as Promise<DashboardApiResponse>;
  }

  // 3. Changed the queryKey to match the data being fetched
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData
  });


  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [fsChart, setFsChart] = useState(false);

  const milkMonthly = data?.month_wise_milk_production || [];
  const milkAvg = milkMonthly.length
    ? +(milkMonthly.reduce((s: number, m: any) => s + (m.total_milk || 0), 0) / milkMonthly.length).toFixed(0)
    : null;

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
              <span className="text-white font-semibold">201 active cattle</span>{" "}
              while maintaining lifecycle records for{" "}
              <span className="text-orange-300 font-semibold">
                404 total registered cattle
              </span>
              , including health tracking, breeding analytics, and milk production management.
            </p>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div onClick={() => navigate("/list-cattle/all")} className="cursor-pointer">
          <KPICard icon={<Flower2 className="w-5 h-5 text-white" />} label="Total Herd" value={data?.total_cattle}
            subtitle={`${data?.total_female_cattle}F / ${data?.total_male_cattle}M`} gradient="bg-gradient-to-br from-saffron to-saffron-dark" />
        </div>
        <div onClick={() => navigate("/list-cattle/milking")} className="cursor-pointer">
          <KPICard icon={<Milk className="w-5 h-5 text-white" />} label="Milking" value={data?.total_milking_cow}
            subtitle={`${kpiData.totalMilkToday}L/day total`} gradient="bg-gradient-to-br from-navy to-navy-dark" />
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
                tick={{ fontSize: 12, fill: "#64748b" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
                dy={10}
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
                key={cow.id ?? i}
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

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>

      {fsChart && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => setFsChart(false)}>
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <h2 className="text-white text-lg font-bold">Herd Monthly Milk Production (Liters)</h2>
            <button onClick={() => setFsChart(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-1 p-6" onClick={e => e.stopPropagation()}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milkMonthly} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                <defs>
                  <linearGradient id="fsMilkG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} angle={-45} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "13px" }} labelStyle={{ color: "#fff" }} />
                {milkAvg != null && <ReferenceLine y={milkAvg} stroke="#1B3A6B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Average ${milkAvg} L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 13, fontWeight: "bold" }} />}
                <Area type="monotone" dataKey="total_milk" stroke="#FF6B00" strokeWidth={3} fill="url(#fsMilkG)" dot={{ r: 3, fill: "#FF6B00" }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#FF6B00" }} /><span className="text-white/70 text-sm">Total Milk Per Month</span></div>
            {milkAvg != null && <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: "#1B3A6B", border: "1px dashed #1B3A6B" }} /><span className="text-white/70 text-sm">Average ({milkAvg} L)</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}