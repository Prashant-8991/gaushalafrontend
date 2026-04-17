import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
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
import {
  gaushalaApi,
  DashboardSummary,
  MonthlyMilkResponse,
  TopMilkersResponse,
  MilkTodayResponse,
  SourceBreakdownResponse,
} from "../api/gaushalaApi";

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
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [apiSummary, setApiSummary] = useState<DashboardSummary | null>(null);
  const [apiMonthlyMilk, setApiMonthlyMilk] = useState<MonthlyMilkResponse | null>(null);
  const [apiTopMilkers, setApiTopMilkers] = useState<TopMilkersResponse | null>(null);
  const [apiMilkToday, setApiMilkToday] = useState<MilkTodayResponse | null>(null);
  const [apiSourceBreakdown, setApiSourceBreakdown] = useState<SourceBreakdownResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      gaushalaApi.getDashboardSummary(),
      gaushalaApi.getMonthlyMilk(12),
      gaushalaApi.getTopMilkers(30, 8),
      gaushalaApi.getMilkToday(),
      gaushalaApi.getSourceBreakdown(),
    ]).then((results) => {
      if (cancelled) return;

      const [summaryR, monthlyR, topR, todayR, sourceR] = results;
      if (summaryR.status === "fulfilled") setApiSummary(summaryR.value);
      if (monthlyR.status === "fulfilled") setApiMonthlyMilk(monthlyR.value);
      if (topR.status === "fulfilled") setApiTopMilkers(topR.value);
      if (todayR.status === "fulfilled") setApiMilkToday(todayR.value);
      if (sourceR.status === "fulfilled") setApiSourceBreakdown(sourceR.value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCows: string | number = apiSummary?.present_in_gaushala ?? "Soon";
  const milkingCows: string | number = apiSummary?.milking_cattle ?? "Soon";
  const pregnantCows: string | number = apiSummary?.pregnant_cattle ?? "Soon";

  const totalMilkToday: string | number =
    apiMilkToday?.total_liters != null ? +apiMilkToday.total_liters.toFixed(1) : "Soon";

  const avgMilkPerCow: string | number =
    apiMilkToday?.total_liters != null && apiSummary?.milking_cattle
      ? +(apiMilkToday.total_liters / Math.max(1, apiSummary.milking_cattle)).toFixed(1)
      : "Soon";

  const parseIsoYmd = (isoYmd: string): Date => {
    // Avoid timezone issues with "YYYY-MM-DD" parsing.
    const [y, m, d] = isoYmd.split("-").map((x) => Number(x));
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };

  const monthKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  };

  const monthLabel = (d: Date): string => {
    const mon = d.toLocaleString(undefined, { month: "short" });
    const yy = String(d.getFullYear()).slice(-2);
    return `${mon} '${yy}`;
  };

  const buildLastMonths = (count: number): Date[] => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const months: Date[] = [];
    for (let i = count - 1; i >= 0; i--) {
      months.push(new Date(end.getFullYear(), end.getMonth() - i, 1));
    }
    return months;
  };

  const monthlyMilkChartData = apiMonthlyMilk
    ? (() => {
      const litersByMonth = new Map<string, number>();
      for (const p of apiMonthlyMilk.points ?? []) {
        const d = parseIsoYmd(p.month);
        litersByMonth.set(monthKey(d), p.liters);
      }

      return buildLastMonths(12).map((d) => {
        const key = monthKey(d);
        return {
          month: monthLabel(d),
          liters: litersByMonth.get(key) ?? 0,
        };
      });
    })()
    : [];

  const topMilkers = (apiTopMilkers?.items ?? [])
    .map((m) => {
      const matched = cows.find((c) => c.tagNumber === m.tag_number);
      return {
        tagNumber: m.tag_number,
        name: m.name ?? matched?.name ?? m.tag_number,
        liters: m.liters,
        image: matched?.image ?? herdImage,
        cow: matched ?? null,
      };
    })
    .slice(0, 8);

  const topBreed = [...cows]
    .sort((a, b) => b.totalBreedScore - a.totalBreedScore)
    .slice(0, 5);

  const sourceBreakdownData = (apiSourceBreakdown?.items ?? []).map((it) => ({
    source: it.acquisition_type,
    count: it.count,
  }));

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
              {totalCows} Sacred Cows
            </h1>
            {apiSummary ? (
              <p style={{ fontSize: '0.8rem' }} className="text-white/70 max-w-lg">
                Managing a herd of {apiSummary.present_in_gaushala} Gir cows across {5} generations.{" "}
                {apiSummary.milking_cattle} milking, {apiSummary.pregnant_cattle} pregnant.
              </p>
            ) : (
              <p style={{ fontSize: '0.8rem' }} className="text-white/70 max-w-lg">
                Live herd metrics will appear here soon.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={<Flower2 className="w-5 h-5 text-white" />} label="Total Herd" value={totalCows}
          subtitle={`${kpiData.femaleCount}F / ${kpiData.maleCount}M`} gradient="bg-gradient-to-br from-saffron to-saffron-dark" />
        <KPICard icon={<Milk className="w-5 h-5 text-white" />} label="Milking" value={milkingCows}
          subtitle={typeof totalMilkToday === "number" ? `${totalMilkToday}L/day total` : "Soon"} gradient="bg-gradient-to-br from-navy to-navy-dark" />
        <KPICard icon={<Baby className="w-5 h-5 text-white" />} label="Pregnant" value={pregnantCows}
          subtitle="Expecting calves" gradient="bg-gradient-to-br from-pink-500 to-pink-700" />
        <KPICard icon={<Heart className="w-5 h-5 text-white" />} label="Calves" value={kpiData.calves}
          subtitle="Young ones" gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
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
          {apiMonthlyMilk ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyMilkChartData}>
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
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Soon
            </div>
          )}
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
          {apiSourceBreakdown && sourceBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sourceBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="source" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sourceBreakdownData.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground">Soon</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-navy" />
            <h3>Generations</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={kpiData.generationDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="gen" type="category" tick={{ fontSize: 9 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {kpiData.generationDistribution.map((_, i) => (
                  <Cell key={i} fill={GEN_COLORS[i]} />
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
              { icon: <Droplets className="w-3.5 h-3.5 text-saffron" />, l: "Avg Milk/Cow", v: typeof avgMilkPerCow === "number" ? `${avgMilkPerCow}L/day` : "Soon" },
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
          {topMilkers.length > 0 ? (
            <div className="space-y-2">
              {topMilkers.map((m, i) => (
                <div
                  key={m.tagNumber}
                  onClick={() => {
                    if (m.cow) setSelectedCow(m.cow);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg bg-muted/30 transition-colors ${m.cow ? "cursor-pointer hover:bg-muted/50" : "cursor-default"
                    }`}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={m.image}
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-saffron/30"
                    />
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-saffron text-white flex items-center justify-center"
                      style={{ fontSize: '0.55rem', fontWeight: 700 }}
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="truncate">{m.name}</p>
                    <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{m.tagNumber} &bull; last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-saffron">{m.liters.toFixed(1)}L</p>
                    <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-muted-foreground">Soon</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-saffron/10 p-5">
          <h3 className="mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-navy" /> Top Breed Scores
          </h3>
          <div className="space-y-2">
            {topBreed.map((cow, i) => (
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