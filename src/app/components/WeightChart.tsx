import { useMemo, useState } from "react";
import {
  Scale, TrendingUp, TrendingDown, Minus, Maximize2, X,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

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

export function WeightChart({ data }: { data: WeightTimelineData }) {
  const [fs, setFs] = useState(false);

  const records = useMemo(() => [...(data?.records || [])], [data]);
  const chartData = records;
  const avg = data.average_weight;
  const values = records.map(r => r.weight);
  const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#64748b";

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
    <ResponsiveContainer width="100%" height={fs ? "100%" : 240}>
      <AreaChart data={chartData} margin={{ top: 10, right: 14, left: -14, bottom: 0 }}>
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
          formatter={(v: any) => [`${v} kg`, "Weight"]}
          labelFormatter={l => fmt(String(l))}
        />
        {avg != null && <ReferenceLine y={avg} stroke="#FF6B00" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${avg} kg`, position: "insideTopRight", fill: "#FF6B00", fontSize: 10 }} />}
        <Area type="monotone" dataKey="weight" stroke="#1B3A6B" strokeWidth={2.5} fill="url(#weightG)" activeDot={{ r: 5, strokeWidth: 0, fill: "#1B3A6B" }} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="Current Weight" value={data.current_weight != null ? `${data.current_weight} kg` : "—"} sub={rangeLabel} accent="#1B3A6B" />
        <Stat label="Average" value={avg != null ? `${avg} kg` : "—"} />
        <Stat label="Max" value={data.max_weight != null ? `${data.max_weight} kg` : "—"} accent="#16a34a" />
        <Stat label="Min" value={data.min_weight != null ? `${data.min_weight} kg` : "—"} accent="#dc2626" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-navy/5 border border-navy/10">
            <Scale className="w-4 h-4 text-navy" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Weight History</h4>
            <p className="text-[0.6rem] text-muted-foreground">Monthly weight measurements</p>
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
            {avg != null && <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: "#FF6B00", border: "1px dashed" }} /><span className="text-white/70 text-sm">Average ({avg} kg)</span></div>}
            <span className="text-white/40 text-sm ml-auto">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}