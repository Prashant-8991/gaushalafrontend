import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Droplets, Heart, Calendar, GitBranch, Baby, Maximize2, X, ChevronRight, TrendingUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

interface Bull { tag_number: string | null; name: string | null; }
interface Child { tag_number: string; name: string | null; birth_date: string | null; gender: string | null; animal_type: string | null; }
interface Event {
  id: number;
  conception_date: string | null;
  birth_date: string | null;
  gestation_days: number | null;
  bull: Bull | null;
  child: Child | null;
  is_ongoing: boolean;
}
interface MilkPoint { date: string; milk: number; }

export interface ReproductionTimelineData {
  tag_number: string;
  name: string | null;
  gender: string | null;
  cattle_dob: string | null;
  bull: Bull | null;
  events: Event[];
  children: Child[];
  milk_monthly: MilkPoint[];
  milk_daily: MilkPoint[];
}

const MAX_WEEK = 40 * 7; // 40 weeks max for scale

function toDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function fmt(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function weekSpan(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(0, diff / (7 * 24 * 3600 * 1000));
}

function EventTrack({ evt }: { evt: Event }) {
  const conc = toDate(evt.conception_date);
  const birth = toDate(evt.birth_date);
  const start = conc ?? birth ?? new Date();
  const end = birth ?? (conc ? new Date(conc.getTime() + 280 * 24 * 3600 * 1000) : new Date());

  const totalWeeks = Math.max(1, weekSpan(start, end));
  const widthPct = Math.min(100, (totalWeeks / MAX_WEEK) * 100);
  const gestationWeeks = evt.gestation_days != null ? Math.round(evt.gestation_days / 7) : null;

  return (
    <div className="relative py-10 pl-2 pr-4">
      {/* Track line */}
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-slate-100 rounded-full" />
      {/* Pregnancy / gestation fill */}
      {conc && birth && (
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-emerald-500"
          style={{ left: 0, width: `${widthPct}%` }}
        />
      )}

      {/* CONCEPTION node (left) */}
      {conc && (
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[0.55rem] text-pink-600 font-semibold bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-200 whitespace-nowrap">Conception</span>
            <div className="mt-1 w-5 h-5 rounded-full bg-pink-500 border-4 border-white shadow-md shadow-pink-200" />
            {evt.bull && (
              <div className="mt-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-navy-dark text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-navy/20">
                  <span className="text-base font-bold">{(evt.bull.name || evt.bull.tag_number || "?").charAt(0).toUpperCase()}</span>
                </div>
                <span className="mt-1 text-[0.6rem] font-semibold text-navy text-center leading-tight">{evt.bull.name || "Bull"}</span>
              </div>
            )}
            <span className="mt-1 text-[0.6rem] text-muted-foreground">{fmt(evt.conception_date)}</span>
          </div>
        </div>
      )}

      {/* Gestation label */}
      {gestationWeeks != null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+22px)] flex items-center gap-1 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-200">
          <Heart className="w-3 h-3 text-rose-500" />
          <span className="text-[0.6rem] font-semibold text-rose-600 whitespace-nowrap">{gestationWeeks} wks</span>
        </div>
      )}

      {/* BIRTH node (right) */}
      {birth && (
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[0.55rem] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">Birth</span>
            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-md shadow-emerald-200" />
            {evt.child && (
              <div className="mt-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-200">
                  <Baby className="w-5 h-5" />
                </div>
                <span className="mt-1 text-[0.6rem] font-semibold text-emerald-800 text-center leading-tight">{evt.child.name || evt.child.tag_number}</span>
                <span className="text-[0.55rem] text-muted-foreground">#{evt.child.tag_number}</span>
              </div>
            )}
            <span className="mt-1 text-[0.6rem] text-muted-foreground">{fmt(evt.birth_date)}</span>
          </div>
        </div>
      )}

      {/* Ongoing pregnancy */}
      {evt.is_ongoing && conc && !birth && (
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[0.6rem] font-semibold text-amber-700 whitespace-nowrap">In Progress</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MilkChart({ monthly, daily, title }: { monthly: MilkPoint[]; daily: MilkPoint[]; title?: string }) {
  const [tab, setTab] = useState<"daily" | "monthly">("daily");
  const [fs, setFs] = useState(false);

  const data = (tab === "daily" ? daily : monthly).slice().reverse();
  const values = data.map(d => d.milk).filter(n => n > 0);
  const avg = values.length ? +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;
  const color = tab === "daily" ? "#1B3A6B" : "#FF6B00";
  const gradId = tab === "daily" ? "milkDailyG" : "milkMonthG";

  const chart = (
    <ResponsiveContainer width="100%" height={fs ? "100%" : 200}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          angle={tab === "daily" ? -40 : -30}
          textAnchor="end"
          height={48}
          interval={tab === "daily" ? 4 : 0}
          tickFormatter={v => tab === "daily" ? (v?.slice(5, 10) || v) : v}
        />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", fontSize: "12px" }}
          formatter={(v: any) => [`${v} L`, "Milk"]}
          labelFormatter={l => String(l)}
        />
        {avg != null && <ReferenceLine y={avg} stroke={color} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${avg} L`, position: "insideTopRight", fill: color, fontSize: 10 }} />}
        <Area type="monotone" dataKey="milk" stroke={color} strokeWidth={2.5} fill={`url(#${gradId})`} activeDot={{ r: 5, strokeWidth: 0, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100">
            <TrendingUp className="w-4 h-4 text-saffron" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">{title || "Milk Production"}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/40 rounded-lg p-0.5 border border-saffron/10">
            <button onClick={() => setTab("daily")} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${tab === "daily" ? "bg-white shadow-sm text-navy border border-saffron/10" : "text-muted-foreground hover:text-foreground"}`}>Daily</button>
            <button onClick={() => setTab("monthly")} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${tab === "monthly" ? "bg-white shadow-sm text-saffron border border-saffron/10" : "text-muted-foreground hover:text-foreground"}`}>Monthly</button>
          </div>
          <button onClick={() => setFs(true)} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors" title="Full Screen"><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-6 bg-muted/20 rounded-xl"><Droplets className="w-8 h-8 text-saffron/30 mx-auto mb-1" /><p className="text-xs text-muted-foreground">No milk data available.</p></div>
      ) : (
        chart
      )}

      {fs && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => setFs(false)}>
          <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur shrink-0">
            <h2 className="text-white text-lg font-bold">{title || "Milk Production"} — {tab === "daily" ? "Daily" : "Monthly"}</h2>
            <button onClick={() => setFs(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-1 p-6" onClick={e => e.stopPropagation()}>
            {chart}
          </div>
          <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: color }} /><span className="text-white/70 text-sm">Milk (Liters)</span></div>
            {avg != null && <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: color, border: "1px dashed" }} /><span className="text-white/70 text-sm">Average ({avg} L)</span></div>}
            <span className="text-white/40 text-sm ml-auto">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReproductionTimeline({ data }: { data: ReproductionTimelineData }) {
  const navigate = useNavigate();
  const { events, children } = data;

  const sorted = useMemo(
    () => [...events].sort((a, b) => {
      const da = toDate(a.conception_date ?? a.birth_date)?.getTime() ?? 0;
      const db = toDate(b.conception_date ?? b.birth_date)?.getTime() ?? 0;
      return da - db;
    }),
    [events]
  );

  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 border border-navy/10">
          <Calendar className="w-3.5 h-3.5 text-navy" />
          <span className="text-xs font-medium text-navy">Born: {fmt(data.cattle_dob)}</span>
        </div>
        {data.bull && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/5 border border-saffron/10">
            <GitBranch className="w-3.5 h-3.5 text-saffron" />
            <span className="text-xs font-medium text-saffron">Line: {data.bull.name || data.bull.tag_number}</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <Baby className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">{children.length} children</span>
        </div>
      </div>

      {/* Events timeline */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-saffron/20">
          <Heart className="w-10 h-10 text-saffron/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reproduction records yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((evt, i) => (
            <div key={evt.id} className={`relative rounded-2xl border p-4 transition-all ${i === sorted.length - 1 ? "border-saffron/30 bg-gradient-to-br from-saffron/[0.04] to-transparent" : "border-saffron/10 bg-white"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-saffron/70">Conception #{i + 1}</span>
                <span className="w-px h-3 bg-saffron/20" />
                <span className="text-xs text-muted-foreground">Pregnancy → Birth</span>
                {evt.is_ongoing && <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[0.6rem] font-semibold">Ongoing</span>}
              </div>
              <EventTrack evt={evt} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{fmt(evt.conception_date)}</span>
                <ChevronRight className="w-3 h-3 text-saffron/60" />
                <span>Birth: {fmt(evt.birth_date)}</span>
                {evt.gestation_days != null && <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-600 text-[0.6rem] font-semibold">{evt.gestation_days} days</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All children bubbles */}
      {children.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            <Baby className="w-3.5 h-3.5 text-emerald-600" /> All Children ({children.length})
          </h4>
          <div className="flex flex-wrap gap-3">
            {children.map(c => (
              <button
                key={c.tag_number}
                onClick={() => navigate(`/cattle/${encodeURIComponent(c.tag_number)}`)}
                className="group flex items-center gap-3 rounded-2xl border border-saffron/10 bg-white px-3 py-2 hover:shadow-md hover:border-saffron/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Baby className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">{c.name || c.tag_number}</p>
                  <p className="text-[0.6rem] text-muted-foreground">#{c.tag_number}</p>
                  <p className="text-[0.6rem] text-emerald-700">{fmt(c.birth_date)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Milk chart */}
      {(data.milk_daily.length > 0 || data.milk_monthly.length > 0) && (
        <div className="bg-white rounded-2xl border border-saffron/10 p-4 shadow-sm">
          <MilkChart monthly={data.milk_monthly} daily={data.milk_daily} title="Milk Production (Liters)" />
        </div>
      )}
    </div>
  );
}