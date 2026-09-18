import { useEffect, useMemo, useState } from "react";
import {
  Scale, TrendingUp, TrendingDown, Minus, Maximize2, X,
} from "lucide-react";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

export interface WeightRecord { date: string; weight: number; }

export interface WeightTimelineData {
  tag_number: string;
  name: string | null;
  date_of_birth: string | null;
  current_weight: number | null;
  average_weight: number | null;
  max_weight: number | null;
  min_weight: number | null;
  records: WeightRecord[];
}

function fmt(d: string): string {
  const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-saffron/10 bg-gradient-to-br from-saffron/5 to-navy/5 p-3 text-center">
      <p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-lg font-bold" style={{ color: accent || "inherit" }}>{value}</p>
      {sub && <p className="text-[0.6rem] text-muted-foreground">{sub}</p>}
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function WeightChart({ data }: { data: WeightTimelineData }) {
  const [fs, setFs] = useState(false);
  const [forecast, setForecast] = useState<{ date: string; value: number }[] | null>(null);
  const [fitted, setFitted] = useState<{ date: string; value: number }[] | null>(null);
  const [metrics, setMetrics] = useState<{ mae?: number; rmse?: number } | null>(null);

  const records = useMemo(() => [...(data?.records || [])], [data]);
  const avg = data.average_weight;
  const values = records.map(r => r.weight);
  const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#64748b";

  useEffect(() => {
    if (!data?.tag_number) return;
    let cancelled = false;
    fetch(`${API_BASE}/cattle/${encodeURIComponent(data.tag_number)}/weight/forecast?steps=6`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return;
        setForecast(d?.forecast || []);
        setFitted(d?.fitted || []);
        setMetrics(d?.metrics || null);
      })
      .catch(() => { if (!cancelled) { setForecast(null); setFitted(null); } });
    return () => { cancelled = true; };
  }, [data?.tag_number]);

  const combinedData = useMemo(() => {
    if (!fitted && !forecast) return records.map(d => ({ ...d, fitted: null as number | null, forecast: null as number | null }));
    const fittedMap = new Map<string, number>();
    if (fitted) fitted.forEach(f => fittedMap.set(f.date, f.value));
    const hist = records.map(d => ({
      date: d.date,
      weight: d.weight,
      fitted: fittedMap.get(d.date) ?? null,
      forecast: null as number | null,
    }));
    if (!forecast || forecast.length === 0) return hist;
    const last = hist[hist.length - 1];
    const fcPoints: any[] = [];
    if (last) {
      fcPoints.push({ date: last.date, weight: null, fitted: null, forecast: last.weight });
    }
    forecast.forEach(f => {
      fcPoints.push({ date: f.date, weight: null, fitted: null, forecast: f.value });
    });
    return [...hist, ...fcPoints];
  }, [records, fitted, forecast]);

  const avgDiff = useMemo(() => {
    if (!metrics?.mae) return null;
    return metrics.mae;
  }, [metrics]);

  if (!data || records.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-saffron/20">
        <Scale className="w-10 h-10 text-saffron/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No weight records available.</p>
      </div>
    );
  }

  const first = fmt(records[0].date);
  const last = fmt(records[records.length - 1].date);
  const rangeLabel = records.length === 1 ? first : `${first} → ${last}`;

  const chart = (
    <ResponsiveContainer width="100%" height={fs ? "100%" : 260}>
      <AreaChart data={combinedData} margin={{ top: 10, right: 14, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="weightG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          height={44}
          interval="preserveStartEnd"
          tickFormatter={fmt}
        />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", fontSize: "12px" }}
          formatter={(v: any, name: any) => {
            if (v == null) return [null, ""];
            if (name === "forecast") return [`${v} kg`, "6M Forecast"];
            if (name === "fitted") return [`${v} kg`, "Fitted (prev)"];
            return [`${v} kg`, "Weight"];
          }}
          labelFormatter={l => fmt(String(l))}
        />
        {avg != null && <ReferenceLine y={avg} stroke="#FF6B00" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${avg} kg`, position: "insideTopRight", fill: "#FF6B00", fontSize: 10 }} />}
        <Area type="monotone" dataKey="weight" stroke="#1B3A6B" strokeWidth={2.5} fill="url(#weightG)" connectNulls={false} activeDot={{ r: 5, strokeWidth: 0, fill: "#1B3A6B" }} />
        <Line type="monotone" dataKey="fitted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4 }} connectNulls={false} />
        <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="8 4" dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} connectNulls={false} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="Current Weight" value={data.current_weight != null ? `${data.current_weight} kg` : "—"} sub={rangeLabel} accent="#1B3A6B" />
        <Stat label="Average" value={avg != null ? `${avg} kg` : "—"} />
        <Stat label="Max" value={data.max_weight != null ? `${data.max_weight} kg` : "—"} accent="#16a34a" />
        <Stat label="Min" value={data.min_weight != null ? `${data.min_weight} kg` : "—"} accent="#dc2626" />
      </div>

      {metrics && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-2 text-center">
            <p className="text-[0.6rem] text-purple-700 uppercase font-semibold">Forecast 6M</p>
            <p className="text-sm font-bold text-purple-700">{forecast && forecast.length > 0 ? `${forecast[0].value} → ${forecast[forecast.length - 1].value} kg` : "—"}</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
            <p className="text-[0.6rem] text-amber-700 uppercase font-semibold">Avg Diff (Actual vs Fitted)</p>
            <p className="text-sm font-bold text-amber-700">{avgDiff != null ? `${avgDiff} kg` : "—"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
            <p className="text-[0.6rem] text-slate-600 uppercase font-semibold">Fitted RMSE</p>
            <p className="text-sm font-bold text-slate-700">{metrics?.rmse != null ? `${metrics.rmse}` : "—"}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-navy/5 border border-navy/10">
            <Scale className="w-4 h-4 text-navy" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Weight History</h4>
            <p className="text-[0.6rem] text-muted-foreground">Monthly weight measurements • ETS Damped Trend</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[0.65rem] font-medium" style={{ color: trendColor }}>
            <TrendIcon className="w-3 h-3" /> {trend >= 0 ? "+" : ""}{trend} kg
          </span>
          <button onClick={() => setFs(true)} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors" title="Full Screen"><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
      </div>

      {chart}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.65rem] px-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#1B3A6B] inline-block" /> Actual</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" /> Fitted (prev) dotted</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-purple-500 inline-block" /> Forecast 6M dotted</span>
      </div>

      {fs && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => setFs(false)}>
          <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur shrink-0">
            <h2 className="text-white text-lg font-bold">Weight History — {data.name || data.tag_number}</h2>
            <button onClick={() => setFs(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-1 p-6" onClick={e => e.stopPropagation()}>
            {chart}
          </div>
          <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#1B3A6B" }} /><span className="text-white/70 text-sm">Weight (kg)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: "#f59e0b", borderTop: "2px dashed #f59e0b" }} /><span className="text-white/70 text-sm">Fitted (prev)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded bg-purple-500" style={{ borderTop: "2px dashed #8b5cf6" }} /><span className="text-white/70 text-sm">Forecast 6M</span></div>
            {avg != null && <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: "#FF6B00", border: "1px dashed" }} /><span className="text-white/70 text-sm">Average ({avg} kg)</span></div>}
            <span className="text-white/40 text-sm ml-auto">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
