import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy, Star, TrendingUp, TrendingDown, Minus, Search, Filter,
  Info, ChevronDown, Award, Heart, Droplets, Scale, Activity, AlertTriangle, Shield, BarChart3, X, Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface BestCattleMetrics {
  milk: number | null;
  reproduction: number | null;
  physical: number | null;
  weight: number | null;
  consistency: number | null;
}

interface BestCattleItem {
  rank: number;
  tag_number: string;
  name: string | null;
  breed: string;
  gender: string | null;
  age_years: number | null;
  age_display: string;
  overall_score: number;
  data_completeness: number;
  metrics: BestCattleMetrics;
  reasons: string[];
  warnings: string[];
  key_reason: string;
  trend: string;
  is_present: number | null;
  has: Record<string, boolean>;
  herd_comparison: {
    milk_avg: number | null;
    herd_milk_avg: number;
    milk_diff: number | null;
    milk_pct: number | null;
    phys_score: number | null;
    herd_phys_avg: number | null;
  };
}

interface BestCattleResponse {
  summary: {
    total_cattle: number;
    evaluated_cattle: number;
    average_score: number;
    weights: Record<string, number>;
  };
  top_cattle: BestCattleItem[];
  methodology: {
    description: string;
    weights: Record<string, number>;
    limitations: string[];
    sources: string[];
  };
}

function ScoreBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const v = value ?? 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value != null ? `${value.toFixed(1)}` : "—"}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, v)}%`, background: color }} />
      </div>
    </div>
  );
}

export function BestCattle() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"overall_score" | "milk" | "reproduction">("overall_score");
  const [selected, setSelected] = useState<BestCattleItem | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [limit] = useState(50);

  const queryKey = ["best-cattle", search, breedFilter, limit];
  const { data, isLoading, error } = useQuery<BestCattleResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (breedFilter !== "all") params.set("breed", breedFilter);
      params.set("limit", String(limit));
      const res = await fetch(`${API_BASE}/best-cattle?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
  });

  const sorted = useMemo(() => {
    if (!data?.top_cattle) return [];
    const arr = [...data.top_cattle];
    if (sortBy === "milk") arr.sort((a, b) => (b.metrics.milk ?? 0) - (a.metrics.milk ?? 0));
    else if (sortBy === "reproduction") arr.sort((a, b) => (b.metrics.reproduction ?? 0) - (a.metrics.reproduction ?? 0));
    else arr.sort((a, b) => b.overall_score - a.overall_score);
    return arr;
  }, [data, sortBy]);

  const top = sorted[0];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="font-semibold">Failed to load best cattle</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-saffron via-saffron to-saffron-dark rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-2">
                <Trophy className="w-7 h-7" /> Best Performing Cattle
              </h1>
              <p className="text-white/80 text-sm mt-2 max-w-2xl">
                Identify cattle with the strongest overall performance based on milk production, reproduction, physical condition and weight trends.
                <span className="block text-xs text-white/60 mt-1">Score is a performance indicator based on available records — not a veterinary diagnosis or genetic breeding value.</span>
              </p>
            </div>
            <button onClick={() => setShowMethodology(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium backdrop-blur">
              <Info className="w-4 h-4" /> How is score calculated?
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                placeholder="Search by tag or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/15 border border-white/20 placeholder:text-white/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <select value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-sm focus:outline-none">
              <option value="all" className="text-black">All Breeds</option>
              <option value="Gir" className="text-black">Gir</option>
              <option value="BULL" className="text-black">BULL</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-sm focus:outline-none">
              <option value="overall_score" className="text-black">Sort: Overall</option>
              <option value="milk" className="text-black">Sort: Milk</option>
              <option value="reproduction" className="text-black">Sort: Reproduction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-saffron/10 p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cattle</p>
            <p className="text-2xl font-bold">{data.summary.total_cattle}</p>
          </div>
          <div className="bg-white rounded-xl border border-saffron/10 p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Evaluated</p>
            <p className="text-2xl font-bold text-saffron">{data.summary.evaluated_cattle}</p>
          </div>
          <div className="bg-white rounded-xl border border-saffron/10 p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Score</p>
            <p className="text-2xl font-bold text-navy">{data.summary.average_score}</p>
          </div>
        </div>
      )}

      {/* Top Performing Cattle */}
      {top && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-sm font-bold tracking-widest text-amber-700 flex items-center gap-2">🏆 TOP PERFORMING CATTLE</h2>
            <div className="mt-4 flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">#{top.rank}</div>
                  <div>
                    <h3 className="font-bold text-lg">{top.tag_number} {top.name && `— ${top.name}`}</h3>
                    <p className="text-xs text-muted-foreground">{top.breed} • {top.age_display} • {top.gender}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-black text-amber-600">{top.overall_score}<span className="text-sm font-normal">/100</span></p>
                    <p className="text-xs text-muted-foreground">{top.data_completeness}% data</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <ScoreBar label="Milk" value={top.metrics.milk} color="#FF9933" />
                  <ScoreBar label="Reproduction" value={top.metrics.reproduction} color="#E91E63" />
                  <ScoreBar label="Physical" value={top.metrics.physical} color="#4CAF50" />
                  <ScoreBar label="Weight" value={top.metrics.weight} color="#1B3A6B" />
                  <ScoreBar label="Consistency" value={top.metrics.consistency} color="#9C27B0" />
                </div>
              </div>
              <div className="flex-1 bg-white rounded-xl p-4 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Why is this cattle good?</h4>
                <ul className="space-y-1.5">
                  {top.reasons.map((r, i) => (
                    <li key={i} className="text-xs flex gap-1.5"><span className="text-green-500">✓</span><span>{r}</span></li>
                  ))}
                </ul>
                {top.warnings.length > 0 && (
                  <>
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mt-3 mb-1">Areas to watch</h4>
                    <ul className="space-y-1">
                      {top.warnings.map((w, i) => (
                        <li key={i} className="text-xs flex gap-1.5"><span className="text-amber-500">⚠</span><span>{w}</span></li>
                      ))}
                    </ul>
                  </>
                )}
                <button onClick={() => setSelected(top)} className="mt-3 w-full py-2 rounded-xl bg-saffron text-white text-sm font-semibold hover:opacity-90">View Details →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Table */}
      <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden">
        <div className="p-4 border-b border-saffron/10 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-saffron" /> Ranking</h3>
          <span className="text-xs text-muted-foreground">{sorted.length} cattle</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr className="text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">Rank</th>
                <th className="px-3 py-2 text-left">Tag</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Breed</th>
                <th className="px-3 py-2 text-left">Age</th>
                <th className="px-3 py-2 text-left">Overall</th>
                <th className="px-3 py-2 text-left">Milk</th>
                <th className="px-3 py-2 text-left">Repro</th>
                <th className="px-3 py-2 text-left">Physical</th>
                <th className="px-3 py-2 text-left">Weight</th>
                <th className="px-3 py-2 text-left">Data%</th>
                <th className="px-3 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.tag_number} onClick={() => setSelected(c)} className="border-b hover:bg-saffron/5 cursor-pointer">
                  <td className="px-3 py-2 font-bold">#{c.rank}</td>
                  <td className="px-3 py-2 font-mono text-xs">{c.tag_number}</td>
                  <td className="px-3 py-2">{c.name || "—"}</td>
                  <td className="px-3 py-2 text-xs">{c.breed}</td>
                  <td className="px-3 py-2 text-xs">{c.age_display}</td>
                  <td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-saffron text-white text-xs font-bold">{c.overall_score}</span></td>
                  <td className="px-3 py-2 text-xs">{c.metrics.milk ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{c.metrics.reproduction ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{c.metrics.physical ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{c.metrics.weight ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{c.data_completeness}%</td>
                  <td className="px-3 py-2 text-xs max-w-[200px] truncate" title={c.key_reason}>{c.key_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-bold">{selected.tag_number} — {selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-5xl font-black text-saffron">{selected.overall_score}<span className="text-lg font-normal text-muted-foreground">/100</span></p>
                <p className="text-xs text-muted-foreground">Overall Score • {selected.data_completeness}% data completeness</p>
                <p className="text-xs mt-1"><span className={`px-2 py-1 rounded-full text-xs ${selected.trend === "improving" ? "bg-green-100 text-green-700" : selected.trend === "declining" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{selected.trend}</span></p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2">Score Breakdown</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: "Milk", A: selected.metrics.milk ?? 0, fullMark: 100 },
                      { subject: "Repro", A: selected.metrics.reproduction ?? 0, fullMark: 100 },
                      { subject: "Physical", A: selected.metrics.physical ?? 0, fullMark: 100 },
                      { subject: "Weight", A: selected.metrics.weight ?? 0, fullMark: 100 },
                      { subject: "Consistency", A: selected.metrics.consistency ?? 0, fullMark: 100 },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="A" stroke="#FF9933" fill="#FF9933" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  <ScoreBar label="Milk" value={selected.metrics.milk} color="#FF9933" />
                  <ScoreBar label="Reproduction" value={selected.metrics.reproduction} color="#E91E63" />
                  <ScoreBar label="Physical" value={selected.metrics.physical} color="#4CAF50" />
                  <ScoreBar label="Weight" value={selected.metrics.weight} color="#1B3A6B" />
                  <ScoreBar label="Consistency" value={selected.metrics.consistency} color="#9C27B0" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-sm text-amber-800">Why is this cattle good?</h4>
                <ul className="mt-2 space-y-1">
                  {selected.reasons.map((r, i) => <li key={i} className="text-xs flex gap-2"><span className="text-green-600">✓</span><span>{r}</span></li>)}
                </ul>
                {selected.warnings.length > 0 && (
                  <>
                    <h4 className="font-bold text-sm text-red-700 mt-3">Areas to watch</h4>
                    <ul className="mt-1 space-y-1">
                      {selected.warnings.map((w, i) => <li key={i} className="text-xs flex gap-2"><span className="text-amber-600">⚠</span><span>{w}</span></li>)}
                    </ul>
                  </>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border">
                <h4 className="font-bold text-sm">Herd Comparison</h4>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between"><span>Milk</span><span>{selected.herd_comparison.milk_avg ?? "—"} vs herd {selected.herd_comparison.herd_milk_avg} L/day {selected.herd_comparison.milk_pct != null ? `(${selected.herd_comparison.milk_pct > 0 ? "+" : ""}${selected.herd_comparison.milk_pct}%)` : ""}</span></div>
                  <div className="flex justify-between"><span>Physical</span><span>{selected.herd_comparison.phys_score ?? "—"} vs herd {selected.herd_comparison.herd_phys_avg ?? "—"}</span></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setSelected(null); navigate(`/cattle/${selected.tag_number}`); }} className="flex-1 py-2 rounded-xl bg-saffron text-white font-semibold">View Profile</button>
                <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-xl border">Close</button>
              </div>

              <p className="text-[0.65rem] text-muted-foreground text-center">Score is a performance indicator based on available records — not a veterinary diagnosis or genetic breeding value.</p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowMethodology(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">How is the score calculated?</h3>
              <button onClick={() => setShowMethodology(false)} className="p-2 hover:bg-muted rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong>Milk Performance (35%)</strong> — avg daily milk relative to herd, consistency, trend. High milk is good but consistency is rewarded.</p>
              <p><strong>Reproductive Performance (25%)</strong> — calvings, calving interval (ideal 365-425d per FAO), pregnancy success.</p>
              <p><strong>Physical Condition (20%)</strong> — latest physical score, desirability (7-9 ideal for Gir), stability.</p>
              <p><strong>Weight Performance (10%)</strong> — avg weight vs herd, stability, trend (BWC concept).</p>
              <p><strong>Consistency (10%)</strong> — CV of milk/weight/physical, rewards stable performance.</p>
              <div className="bg-muted/30 rounded-xl p-3 mt-2">
                <p className="font-semibold text-xs">Weights (configurable)</p>
                {data?.methodology?.weights && Object.entries(data.methodology.weights).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs"><span>{k}</span><span>{(Number(v) * 100).toFixed(0)}%</span></div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Normalized via min-max with 5th/95th percentile clipping to handle outliers, then weighted sum renormalized for missing data. Sources: USDA NM$ 2025, ICAR, FAO, NDDB.</p>
              <p className="text-xs text-muted-foreground">Limitations: Age/lactation uses generation/age as proxy; health limited to physical scores; longevity uses calving count. Young cattle compared via avg not total milk.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
