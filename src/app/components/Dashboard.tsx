import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Flower2, Droplets, Heart, AlertTriangle, TrendingUp, Users,
  Activity, Scale, Baby, Milk, Shield,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
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
      <div className="relative overflow-hidden rounded-3xl h-[260px] lg:h-[320px] shadow-2xl border border-white/10">
        {/* Background Image */}
        <img
          src="https://t4.ftcdn.net/jpg/12/55/70/67/360_F_1255706772_VN5ObaaNkgoTLgtAIqiBmpZFTLC45EO8.jpg"
          alt="Gaushala"
          className="w-full h-full object-cover scale-105"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#081028]/95 via-[#0f172a]/80 to-[#0f172a]/30" />

        {/* Decorative Blur */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300/10 blur-3xl rounded-full" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-10">
          {/* Top Badge */}
          <div className="flex items-start justify-between">
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs lg:text-sm text-orange-200 tracking-[0.2em] uppercase font-semibold">
              Shree Somnath Temple Trust Gaushala
            </div>

            <div className="hidden md:flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 px-4 py-2 rounded-2xl backdrop-blur-md">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              Active Monitoring
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-none">
                {data?.total_cattle}
              </h1>

              <div className="h-12 w-[2px] bg-white/20" />

              <div>
                <p className="text-white text-lg lg:text-2xl font-semibold">
                  Total Cattle
                </p>
                <p className="text-orange-200 text-sm tracking-wide">
                  Gir Cattle Management System
                </p>
              </div>
            </div>

            <p className="text-white/75 text-sm lg:text-base leading-relaxed max-w-2xl">
              Currently managing{" "}
              <span className="text-white font-semibold">{data?.all_cattle_data} active cattle</span>{" "}
              across multiple generations with real-time monitoring of health,
              milk production, breeding, and lineage tracking.
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
          </div>

          {/* Increased height from 200 to 380 for better interaction */}
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart
              data={data?.month_wise_milk_production || []}
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
              { icon: <Droplets className="w-3.5 h-3.5 text-saffron" />, l: "Avg Milk/Cow", v: `${kpiData.avgMilkPerCow}L/day` },
              { icon: <Shield className="w-3.5 h-3.5 text-green-500" />, l: "Top Breed Score", v: `${topBreed[0]?.totalBreedScore}/10` },
              { icon: <Flower2 className="w-3.5 h-3.5 text-navy" />, l: "Dry Cows", v: kpiData.dryCows },
              { icon: <Heart className="w-3.5 h-3.5 text-pink-500" />, l: "Healthy", v: kpiData.healthyCows },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <h3 className="mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-saffron" /> Top Milking Cows
          </h3>
          <div className="space-y-2">
            {/* {topMilkers.map((cow, i) => (
              <div key={cow.id} onClick={() => setSelectedCow(cow)} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <ImageWithFallback src={cow.image} alt={cow.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-saffron/30" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-saffron text-white flex items-center justify-center"
                    style={{ fontSize: '0.55rem', fontWeight: 700 }}>{i + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="truncate">{cow.name}</p>
                  <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{cow.tagNumber} &bull; Gen {cow.generation}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-saffron">{cow.dailyMilk}L</p>
                  <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">per day</p>
                </div>
              </div>
            ))} */}

            {data?.top_10_milking_cattle.map((cow, i) => (
              <div key={cow.id ?? i} onClick={() => setSelectedCow(cow)} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="relative">
                  {/* <ImageWithFallback src={cow.image} alt={cow.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-saffron/30" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-saffron text-white flex items-center justify-center"
                    style={{ fontSize: '0.55rem', fontWeight: 700 }}>{i + 1}</div> */}
                  <div>
                    <SiHappycow size={40} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="truncate">{cow.name}</p>
                  <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{cow.tagNumber} &bull; Gen {cow.generation}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-saffron">{cow.total_milk} L</p>
                  <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">per day</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <h3 className="mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-navy" /> Top Breed Scores
          </h3>
          <div className="space-y-2">
            {/* {topBreed.map((cow, i) => (
              <div key={cow.id} onClick={() => setSelectedCow(cow)} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <ImageWithFallback src={cow.image} alt={cow.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-navy/30" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-navy text-white flex items-center justify-center"
                    style={{ fontSize: '0.55rem', fontWeight: 700 }}>{i + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="truncate">{cow.name}</p>
                  <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{cow.tagNumber} &bull; {cow.status}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-navy">{cow.totalBreedScore}</p>
                  <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-navy to-saffron"
                      style={{ width: `${cow.totalBreedScore * 10}%` }} />
                  </div>
                </div>
              </div>
            ))} */}

            {data?.top_10_fit_cattle.map((cow, i) => (
              <div key={cow.id ?? i} onClick={() => setSelectedCow(cow)} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <div>
                    <SiHappycow size={40} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-navy text-white flex items-center justify-center"
                    style={{ fontSize: '0.55rem', fontWeight: 700 }}>{i + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="truncate">{cow.name}</p>
                  <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{cow.tag_number}  &bull;  Gen {cow.generation}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-navy">{cow.total_score}</p>
                  <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-navy to-saffron"
                      style={{ width: `${cow.total_score * 0.5}%` }} />
                  </div>
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
    </div>
  );
}