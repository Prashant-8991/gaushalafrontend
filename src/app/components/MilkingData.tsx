import { useEffect, useState } from "react";
import { Droplets, Loader2, AlertTriangle, Calendar, BarChart3, Maximize2, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

type DailyPoint = { date: string; day: number; milk: number | null };
type MonthlyPoint = { month: string; month_num: number; month_name: string; milk: number | null };
type YearlyPoint = { year: string; milk: number };

export function MilkingData({ tag }: { tag: string }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [view, setView] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [daily, setDaily] = useState<{ records: DailyPoint[]; total: number | null; average: number | null } | null>(null);
  const [monthly, setMonthly] = useState<{ records: MonthlyPoint[]; total: number | null; average: number | null } | null>(null);
  const [yearly, setYearly] = useState<{ records: YearlyPoint[]; total: number | null; average: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const years = Array.from({ length: 12 }, (_, i) => currentYear - 10 + i).filter(y => y <= currentYear + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    if (isFullscreen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (!tag) return;
    let cancelled = false;
    setLoading(true); setError(null);
    let url = "";
    if (view === "daily") url = `${base}/cattle/${encodeURIComponent(tag)}/milk/daily?year=${year}&month=${month}`;
    else if (view === "monthly") url = `${base}/cattle/${encodeURIComponent(tag)}/milk/monthly?year=${year}`;
    else url = `${base}/cattle/${encodeURIComponent(tag)}/milk/yearly`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => {
        if (cancelled) return;
        if (view === "daily") setDaily(d);
        else if (view === "monthly") setMonthly(d);
        else setYearly(d);
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [tag, view, year, month]);

  const hasDailyData = daily && daily.records.some(r => r.milk != null);
  const hasMonthlyData = monthly && monthly.records.some(r => r.milk != null);
  const hasYearlyData = yearly && yearly.records.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-muted/30 border border-saffron/10">
        <button onClick={() => setView("daily")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === "daily" ? "bg-saffron text-white shadow" : "bg-white border border-saffron/20 hover:bg-saffron/5"}`}>Daily</button>
        <button onClick={() => setView("monthly")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === "monthly" ? "bg-saffron text-white shadow" : "bg-white border border-saffron/20 hover:bg-saffron/5"}`}>Monthly</button>
        <button onClick={() => setView("yearly")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === "yearly" ? "bg-saffron text-white shadow" : "bg-white border border-saffron/20 hover:bg-saffron/5"}`}>Yearly</button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {(view === "daily" || view === "monthly") && (
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {view === "daily" && (
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20">
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          )}
          <button onClick={() => setIsFullscreen(true)} className="p-2 rounded-lg border border-saffron/20 bg-white hover:bg-saffron/5 transition-colors" title="Full Screen"><Maximize2 className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-saffron animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading milking data...</span></div>
      ) : error ? (
        <div className="flex flex-col items-center py-10 text-center border border-dashed rounded-xl bg-red-50/50"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p className="text-sm font-medium">Failed to load milking data</p><p className="text-xs text-muted-foreground">{error}</p></div>
      ) : view === "daily" ? (
        !hasDailyData ? (
          <div className="text-center py-10 border border-dashed rounded-xl bg-muted/10"><Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" /><p className="text-sm text-muted-foreground">No milk data available for {MONTHS.find(m => m.value === month)?.label} {year}</p></div>
        ) : (
          <>
            <div className="bg-muted/30 rounded-xl p-4 border border-saffron/10">
              <p className="text-xs text-muted-foreground mb-2">Daily — {MONTHS.find(m => m.value === month)?.label} {year} {daily?.average != null && <span>· Avg: <span className="text-saffron font-semibold">{daily.average} L</span></span>} {daily?.total != null && <span>· Total: <span className="font-semibold">{daily.total} L</span></span>}</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={daily!.records} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="milkDailyG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} interval={0} label={{ value: "Day", position: "insideBottom", offset: -2, fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} label={{ value: "Milk (L)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v: any) => v == null ? "No data" : `${v} L`} labelFormatter={(l: any) => `Day ${l} — ${year}-${String(month).padStart(2, "0")}-${String(l).padStart(2, "0")}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  {daily?.average != null && <ReferenceLine y={daily.average} stroke="#1B3A6B" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${daily.average}L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 10 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={2} fill="url(#milkDailyG)" dot={{ r: 2, fill: "#FF9933" }} activeDot={{ r: 5 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-saffron/5 rounded-xl p-3 text-center border border-saffron/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Total</p><p className="text-lg font-bold text-saffron">{daily?.total ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
              <div className="bg-navy/5 rounded-xl p-3 text-center border border-navy/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Average / Day</p><p className="text-lg font-bold text-navy">{daily?.average ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
            </div>
          </>
        )
      ) : view === "monthly" ? (
        !hasMonthlyData ? (
          <div className="text-center py-10 border border-dashed rounded-xl bg-muted/10"><BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" /><p className="text-sm text-muted-foreground">No milk data available for {year}</p></div>
        ) : (
          <>
            <div className="bg-muted/30 rounded-xl p-4 border border-saffron/10">
              <p className="text-xs text-muted-foreground mb-2">Monthly — {year} {monthly?.average != null && <span>· Avg: <span className="text-saffron font-semibold">{monthly.average} L</span></span>} {monthly?.total != null && <span>· Total: <span className="font-semibold">{monthly.total} L</span></span>}</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthly!.records.map(r => ({ name: r.month_name, full: r.month, milk: r.milk }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="milkMonthlyG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} />
                  <Tooltip formatter={(v: any) => v == null ? "No data" : `${v} L`} labelFormatter={(l: any) => `${l} ${year}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  {monthly?.average != null && <ReferenceLine y={monthly.average} stroke="#1B3A6B" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${monthly.average}L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 10 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={2} fill="url(#milkMonthlyG)" dot={{ r: 3, fill: "#FF9933" }} activeDot={{ r: 5 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-saffron/5 rounded-xl p-3 text-center border border-saffron/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Total {year}</p><p className="text-lg font-bold text-saffron">{monthly?.total ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
              <div className="bg-navy/5 rounded-xl p-3 text-center border border-navy/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Avg / Month</p><p className="text-lg font-bold text-navy">{monthly?.average ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
            </div>
          </>
        )
      ) : (
        !hasYearlyData ? (
          <div className="text-center py-10 border border-dashed rounded-xl bg-muted/10"><Droplets className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" /><p className="text-sm text-muted-foreground">No yearly milk data available</p></div>
        ) : (
          <>
            <div className="bg-muted/30 rounded-xl p-4 border border-saffron/10">
              <p className="text-xs text-muted-foreground mb-2">Yearly — All years {yearly?.average != null && <span>· Avg: <span className="text-saffron font-semibold">{yearly.average} L</span></span>} {yearly?.total != null && <span>· Total: <span className="font-semibold">{yearly.total} L</span></span>}</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={yearly!.records} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="milkYearlyG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} />
                  <Tooltip formatter={(v: any) => `${v} L`} labelFormatter={(l: any) => `Year ${l}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  {yearly?.average != null && <ReferenceLine y={yearly.average} stroke="#1B3A6B" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${yearly.average}L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 10 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={2} fill="url(#milkYearlyG)" dot={{ r: 3, fill: "#FF9933" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-saffron/5 rounded-xl p-3 text-center border border-saffron/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Total (All Years)</p><p className="text-lg font-bold text-saffron">{yearly?.total ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
              <div className="bg-navy/5 rounded-xl p-3 text-center border border-navy/10"><p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Avg / Year</p><p className="text-lg font-bold text-navy">{yearly?.average ?? "—"} <span className="text-xs font-normal text-muted-foreground">L</span></p></div>
            </div>
          </>
        )
      )}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => setIsFullscreen(false)}>
          <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur shrink-0">
            <h2 className="text-white text-lg font-bold flex items-center gap-2"><Droplets className="w-5 h-5 text-saffron" />{tag} — Milking Data — {view === "daily" ? `Daily ${MONTHS.find(m => m.value === month)?.label} ${year}` : view === "monthly" ? `Monthly ${year}` : "Yearly"}</h2>
            <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-white/5 border-y border-white/10 shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setView("daily")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${view === "daily" ? "bg-saffron text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>Daily</button>
            <button onClick={() => setView("monthly")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${view === "monthly" ? "bg-saffron text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>Monthly</button>
            <button onClick={() => setView("yearly")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${view === "yearly" ? "bg-saffron text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>Yearly</button>
            <div className="ml-auto flex gap-2">
              {(view === "daily" || view === "monthly") && (
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-white text-sm border-0 focus:outline-none">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
              {view === "daily" && (
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-white text-sm border-0 focus:outline-none">
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="flex-1 p-6 min-h-0 flex flex-col" onClick={e => e.stopPropagation()}>
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-saffron animate-spin" /><span className="ml-2 text-white/70">Loading...</span></div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p>{error}</p></div>
            ) : view === "daily" && hasDailyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily!.records} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs><linearGradient id="fsDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.5} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} label={{ value: "Day", position: "insideBottom", offset: -10, fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(v: any) => v == null ? "No data" : `${v} L`} labelFormatter={(l: any) => `Day ${l} — ${year}-${String(month).padStart(2, "0")}-${String(l).padStart(2, "0")}`} />
                  {daily?.average != null && <ReferenceLine y={daily.average} stroke="#1B3A6B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Avg ${daily.average}L`, position: "insideTopRight", fill: "#FF9933", fontSize: 13 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={3} fill="url(#fsDaily)" dot={{ r: 3, fill: "#FF9933" }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : view === "monthly" && hasMonthlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly!.records.map(r => ({ name: r.month_name, milk: r.milk }))} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs><linearGradient id="fsMonthly" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.5} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(v: any) => v == null ? "No data" : `${v} L`} />
                  {monthly?.average != null && <ReferenceLine y={monthly.average} stroke="#1B3A6B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Avg ${monthly.average}L`, position: "insideTopRight", fill: "#FF9933", fontSize: 13 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={3} fill="url(#fsMonthly)" dot={{ r: 3, fill: "#FF9933" }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : view === "yearly" && hasYearlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearly!.records} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs><linearGradient id="fsYearly" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.5} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(v: any) => `${v} L`} />
                  {yearly?.average != null && <ReferenceLine y={yearly.average} stroke="#1B3A6B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Avg ${yearly.average}L`, position: "insideTopRight", fill: "#FF9933", fontSize: 13 }} />}
                  <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={3} fill="url(#fsYearly)" dot={{ r: 3, fill: "#FF9933" }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/60">No data available for selected period</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-2"><div className="w-4 h-1 rounded bg-[#FF9933]" /><span className="text-white/70 text-sm">Milk Production</span></div>
            {((view === "daily" && daily?.average != null) || (view === "monthly" && monthly?.average != null) || (view === "yearly" && yearly?.average != null)) && (
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded bg-[#1B3A6B] border border-dashed border-white/30" /><span className="text-white/70 text-sm">Average</span></div>
            )}
            <span className="text-white/50 text-sm ml-auto">Press Esc or click outside to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
