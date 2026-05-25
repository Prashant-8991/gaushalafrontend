import { useState } from "react";
import { AnimatePresence, resolveMotionValue } from "motion/react";
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
  const getDashboardData = async (): Promise<DashboardApiResponse> => {
    const response = await fetch("http://localhost:8000/dashboard");

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

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="relative rounded-2xl overflow-hidden h-44 lg:h-52">
        <ImageWithFallback src={heroImage} alt="Somnath Temple" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 lg:px-10">
          <div>
            <p style={{ fontSize: '0.7rem' }} className="text-saffron-light tracking-widest uppercase mb-1">
              Somnath Temple Trust Gaushala &bull; Pure Gir Breed
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }} className="text-white mb-1">
              {kpiData.totalCows} Sacred Cows
            </h1>
            <p style={{ fontSize: '0.8rem' }} className="text-white/70 max-w-lg">
              Managing a herd of {kpiData.totalCows} Gir cows across {5} generations.{" "}
              {kpiData.milkingCows} milking, {kpiData.pregnantCows} pregnant, {kpiData.calves} calves,{" "}
              {kpiData.bulls} bulls. Avg breed score: {kpiData.avgBreedScore}/10.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={<Flower2 className="w-5 h-5 text-white" />} label="Total Herd" value={data?.total_cattle}
          subtitle={`${data?.total_female_cattle}F / ${data?.total_male_cattle}M`} gradient="bg-gradient-to-br from-saffron to-saffron-dark" />
        <KPICard icon={<Milk className="w-5 h-5 text-white" />} label="Milking" value={data?.total_milking_cow}
          subtitle={`${kpiData.totalMilkToday}L/day total`} gradient="bg-gradient-to-br from-navy to-navy-dark" />
        <KPICard icon={<Baby className="w-5 h-5 text-white" />} label="Pregnant" value={data?.total_pregnant_cow}
          subtitle="Expecting calves" gradient="bg-gradient-to-br from-pink-500 to-pink-700" />
        <KPICard icon={<Heart className="w-5 h-5 text-white" />} label="Calves" value={data?.total_male_calf + data?.total_female_calf}
          subtitle={`${data?.total_female_calf}F / ${data?.total_male_calf}M`} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
        <KPICard icon={<Shield className="w-5 h-5 text-white" />} label="Breed Score" value={`${kpiData.avgBreedScore}`}
          subtitle="Avg out of 10" gradient="bg-gradient-to-br from-green-500 to-green-700" />
        <KPICard icon={<AlertTriangle className="w-5 h-5 text-white" />} label="Under Treatment" value={kpiData.underTreatment}
          subtitle={`${kpiData.vaccinatedCows} vaccinated`} gradient="bg-gradient-to-br from-red-500 to-red-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-saffron/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-saffron" />
            <h3>Monthly Milk Production (Liters)</h3>
          </div>
          {/* <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={kpiData.monthlyMilk}>
              <defs>
                <linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="liters" stroke="#FF6B00" strokeWidth={2} fill="url(#milkG)" />
            </AreaChart>
          </ResponsiveContainer> */}

          <ResponsiveContainer width="100%" height={200}>
            {/* Fix 1: Added || [] so the chart doesn't crash while React Query is loading */}
            <AreaChart data={data?.month_wise_milk_production || []}>
              <defs>
                <linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              {/* Fix 2: If you used my second query, the key is "display_month". 
        If you used the first query, change this back to "month". */}
              <XAxis
                dataKey="month"          /* 1. Must exactly match your JSON key */
                tick={{ fontSize: 11 }}
                interval={0}             /* 2. Forces Recharts to show EVERY single label */
                angle={-45}              /* 3. (Optional) Angles the text so 11 months don't overlap */
                textAnchor="end"         /* 4. (Optional) Aligns the angled text nicely */
                height={60}              /* 5. (Optional) Gives the angled text enough room at the bottom */
              />

              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />

              {/* Fix 3: Your SQL query aliases the sum as "total_milk", not "liters" */}
              <Area
                type="monotone"
                dataKey="total_milk"
                stroke="#FF6B00"
                strokeWidth={2}
                fill="url(#milkG)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-navy" />
            <h3>Herd Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={kpiData.statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                paddingAngle={3} dataKey="count" nameKey="status">
                {kpiData.statusDistribution.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {kpiData.statusDistribution.map((s, i) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">{s.status} ({s.count})</span>
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