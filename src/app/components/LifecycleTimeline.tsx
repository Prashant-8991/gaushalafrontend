import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Droplet, Heart, Baby, Syringe, Scale, Milk, Sun, Moon, Maximize2, X, Sparkles } from "lucide-react";

const START_YEAR = 2000;
const END_YEAR = 2025;
const TIMELINE_START = new Date(`${START_YEAR}-01-01`).getTime();
const TIMELINE_END = new Date(`${END_YEAR}-12-31`).getTime();

const getPercent = (dateString: string) => {
  const time = new Date(dateString).getTime();
  return ((time - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface LifecycleEvent {
  id: string;
  type: string;
  date: string;
  label: string;
  color?: string;
  position?: string;
  group?: number | null;
  title?: string | null;
}
interface LactationPeriod { id: number; start: string; end: string; title: string; }
interface MilkPoint { timestamp: number; yield: number; }
interface WeightPoint { timestamp: number; weight: number; }

function Stat({ icon: Icon, value, label, color, bg, darkBorder }: any) {
  return (
    <div className={`flex items-center gap-3 ${bg} px-4 py-2 rounded-xl border border-gray-100 ${darkBorder} transition-colors`}>
      <Icon className={`w-5 h-5 md:w-7 md:h-7 ${color}`} />
      <div className="flex flex-col">
        <span className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</span>
        <span className="text-[10px] md:text-xs text-gray-600 dark:text-zinc-400 uppercase font-medium leading-none">{label}</span>
      </div>
    </div>
  );
}
function LabelBlock({ title, subtitle, color, bg, height }: any) {
  return (
    <div className={`w-full ${height} ${bg} border-b border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center p-2 md:p-4 text-center backdrop-blur-sm transition-colors`}>
      <span className={`text-xs md:text-sm font-bold ${color} tracking-wide break-words w-full`}>{title}</span>
      <span className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-500 mt-1 font-medium">{subtitle}</span>
    </div>
  );
}

function TimelineView({ events, lactations, milkData, weightData, tagName }: { events: LifecycleEvent[]; lactations: LactationPeriod[]; milkData: MilkPoint[]; weightData: WeightPoint[]; tagName: string }) {
  const [isDark, setIsDark] = useState(true);
  const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
  const chartColors = {
    milk: isDark ? { stroke: "#06b6d4", fill: "#164e63" } : { stroke: "#3b82f6", fill: "#eff6ff" },
    weight: isDark ? { stroke: "#eab308", fill: "#422006" } : { stroke: "#d97706", fill: "#fef3c7" },
  };
  const iconMap: Record<string, any> = { Birth: Baby, Conception: Heart, Calving: Baby, Vaccine: Syringe };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="w-full  mx-auto bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg font-sans overflow-hidden my-4 md:my-6 transition-colors duration-300">
        <div className="flex flex-wrap justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg"><Activity className="w-8 h-8 text-gray-800 dark:text-yellow-400" /></div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{tagName}</h1>
              <div className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Historical Array <span className="text-emerald-600 dark:text-yellow-500 ml-1">{START_YEAR} – {END_YEAR}</span></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <Stat icon={Heart} value={events.filter(e=>e.type==="Conception").length} label="Pregnancies" color="text-pink-500 dark:text-pink-400" bg="bg-pink-50 dark:bg-pink-950/30" darkBorder="dark:border-pink-900/50" />
            <Stat icon={Milk} value={lactations.length} label="Lactations" color="text-blue-500 dark:text-cyan-400" bg="bg-blue-50 dark:bg-cyan-950/30" darkBorder="dark:border-cyan-900/50" />
            <Stat icon={Droplet} value={milkData.length ? `${Math.max(...milkData.map(m=>m.yield)).toFixed(1)} L` : "—"} label="Record Peak" color="text-blue-600 dark:text-cyan-500" bg="bg-blue-50 dark:bg-cyan-950/30" darkBorder="dark:border-cyan-900/50" />
            <Stat icon={Scale} value={weightData.length ? `${Math.max(...weightData.map(w=>w.weight)).toFixed(0)} kg` : "—"} label="Mature Wt." color="text-amber-600 dark:text-yellow-400" bg="bg-amber-50 dark:bg-yellow-950/30" darkBorder="dark:border-yellow-900/50" />
            <button onClick={() => setIsDark(!isDark)} className="ml-2 p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors border border-transparent dark:border-zinc-700 text-gray-800 dark:text-yellow-400">
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar bg-gray-50/30 dark:bg-black/50">
          <div className="flex min-w-[3600px] relative bg-white dark:bg-black transition-colors duration-300">
            <div className="w-32 md:w-48 shrink-0 flex flex-col border-r border-gray-200 dark:border-zinc-800 z-40 sticky left-0 bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
              <div className="h-12 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-center font-bold text-gray-400 dark:text-zinc-500 text-xs md:text-sm">TIMELINE</div>
              <LabelBlock title="REPRODUCTION" subtitle={`${events.filter(e=>e.type==="Conception").length} Cycles`} color="text-emerald-700 dark:text-yellow-500" bg="bg-emerald-50/40 dark:bg-zinc-900/50" height="h-72" />
              <LabelBlock title="MILK YIELD" subtitle="Continuous (L)" color="text-blue-700 dark:text-cyan-500" bg="bg-blue-50/40 dark:bg-zinc-900/30" height="h-64" />
              <LabelBlock title="BODY WEIGHT" subtitle="Growth (kg)" color="text-amber-700 dark:text-yellow-600" bg="bg-amber-50/40 dark:bg-zinc-900/40" height="h-48" />
              <LabelBlock title="LACTATION" subtitle="Active Periods" color="text-purple-700 dark:text-purple-400" bg="bg-purple-50/40 dark:bg-zinc-900/50" height="h-24" />
            </div>

            <div className="flex-1 relative flex flex-col">
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {years.map((year, i) => (
                  <div key={year} className="h-full border-l border-dashed border-gray-200 dark:border-zinc-800" style={{ position: 'absolute', left: `${(i / (years.length - 1)) * 100}%` }} />
                ))}
              </div>
              <div className="h-12 relative border-b border-gray-200 dark:border-zinc-800 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                {years.map((year, i) => (
                  <div key={year} className="absolute bottom-2 -translate-x-1/2 font-bold text-gray-800 dark:text-zinc-300 text-sm md:text-base px-2 rounded-md" style={{ left: `${(i / (years.length - 1)) * 100}%` }}>{year}</div>
                ))}
              </div>

              <div className="h-72 relative border-b border-gray-200 dark:border-zinc-800 z-10">
                {Array.from(new Set(events.filter(e=>e.group).map(e=>e.group))).map(group => {
                  const start = events.find(e => e.group === group && e.type === 'Conception');
                  const end = events.find(e => e.group === group && e.type === 'Calving');
                  if (!start || !end) return null;
                  const leftPct = getPercent(start.date);
                  const widthPct = getPercent(end.date) - leftPct;
                  return (
                    <div key={`line-${group}`} className="absolute top-1/2 border-t-2 border-dashed border-emerald-300 dark:border-yellow-500 -translate-y-1/2" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-emerald-700 dark:text-yellow-400 bg-white/90 dark:bg-zinc-900/90 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap shadow-sm border border-emerald-100 dark:border-yellow-500/30">{end.title}</div>
                    </div>
                  );
                })}
                {events.map((event) => {
                  const IconComponent = (iconMap[event.type] || Activity);
                  let yOffset = '';
                  if (event.position === 'above') yOffset = 'bottom-full mb-3';
                  if (event.position === 'below') yOffset = 'top-full mt-3';
                  if (event.position === 'far-above') yOffset = 'bottom-full mb-14';
                  return (
                    <div key={event.id} className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${getPercent(event.date)}%` }}>
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${event.color} border-2 border-white dark:border-black shadow-md z-20 relative flex items-center justify-center text-white dark:text-black`}>
                        <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                        <div className={`absolute flex flex-col items-center w-24 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 ${yOffset}`}>
                          <span className="text-[10px] md:text-xs font-bold text-gray-800 dark:text-zinc-100 uppercase leading-none">{event.type}</span>
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 whitespace-nowrap leading-tight mt-1">{event.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-64 border-b border-gray-200 dark:border-zinc-800 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={milkData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[TIMELINE_START, TIMELINE_END]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(1)} L`, 'Yield']} contentStyle={{ borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#f4f4f5' : '#000000' }} />
                    <Area type="monotone" dataKey="yield" stroke={isDark ? "#06b6d4" : "#3b82f6"} strokeWidth={2} fill={isDark ? "#164e63" : "#eff6ff"} fillOpacity={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48 border-b border-gray-200 dark:border-zinc-800 z-10 bg-amber-50/10 dark:bg-zinc-950/50">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[TIMELINE_START, TIMELINE_END]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(0)} kg`, 'Body Weight']} contentStyle={{ borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', backgroundColor: isDark ? '#09090b' : '#ffffff', color: isDark ? '#f4f4f5' : '#000000' }} />
                    <Area type="monotone" dataKey="weight" stroke={isDark ? "#eab308" : "#d97706"} strokeWidth={2} fill={isDark ? "#422006" : "#fef3c7"} fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-24 relative z-10 bg-white dark:bg-black">
                {lactations.map(period => {
                  const leftPct = getPercent(period.start);
                  const widthPct = getPercent(period.end) - leftPct;
                  return (
                    <div key={period.id} className="absolute top-6 flex flex-col items-center" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                      <div className="w-full h-2 md:h-3 bg-purple-500 dark:bg-purple-600 rounded-full relative shadow-sm">
                         <div className="absolute -left-1 md:-left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-700 dark:bg-purple-400 rounded-full border-2 border-white dark:border-black shadow-sm" />
                         <div className="absolute -right-1 md:-right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-700 dark:bg-purple-400 rounded-full border-2 border-white dark:border-black shadow-sm" />
                      </div>
                      <div className="mt-2 text-[9px] md:text-xs font-bold text-purple-800 dark:text-purple-300 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-500/30 shadow-sm whitespace-nowrap">{period.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LifecycleShowcase({ tag }: { tag: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || data) return;
    setLoading(true);
    fetch(`${API_BASE}/cattle/${encodeURIComponent(tag)}/lifecycle`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open, tag, data]);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-900 p-[2px] shadow-lg animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-yellow-400/20 animate-[shimmer_2s_infinite] opacity-60 pointer-events-none" />
        <div className="relative bg-white dark:bg-black rounded-[14px] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-md animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Lifecycle Timeline <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-bold tracking-wider">SHOWCASE</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-400 mt-1">Master historical array 2000–2025 • Reproduction • Milk • Weight • Lactation</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold text-sm shadow-md hover:shadow-lg border-2 border-yellow-300 dark:border-yellow-600 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Activity className="w-5 h-5" /> Showcase Timeline
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black border-b border-zinc-800">
            <h2 className="text-white font-bold text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-400" /> {tag} — Lifecycle Timeline</h2>
            <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-black p-2 md:p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-zinc-500">Loading lifecycle...</div>
            ) : data ? (
              <TimelineView
                events={data.reproductionEvents || []}
                lactations={data.lactationPeriods || []}
                milkData={data.milkData || []}
                weightData={data.weightData || []}
                tagName={data.name || tag}
              />
            ) : (
              <div className="text-center py-20 text-zinc-500">No data</div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </>
  );
}
