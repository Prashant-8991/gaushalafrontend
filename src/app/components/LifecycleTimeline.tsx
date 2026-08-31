import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, Brush } from "recharts";
import { Activity, Droplet, Heart, Baby, Syringe, Scale, Milk, Maximize2, X, Sparkles, SlidersHorizontal } from "lucide-react";

const START_YEAR = 2000;
const END_YEAR = 2027;
const TIMELINE_START = new Date(`${START_YEAR}-01-01`).getTime();
const TIMELINE_END = new Date(`${END_YEAR}-12-31`).getTime();

const getPercent = (dateString: string, start = TIMELINE_START, end = TIMELINE_END) => {
  const time = new Date(dateString).getTime();
  if (end <= start) return 0;
  return ((time - start) / (end - start)) * 100;
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
  const [yearRange, setYearRange] = useState<[number, number]>([START_YEAR, END_YEAR]);
  const visibleStart = useMemo(() => new Date(`${yearRange[0]}-01-01`).getTime(), [yearRange]);
  const visibleEnd = useMemo(() => new Date(`${yearRange[1]}-12-31`).getTime(), [yearRange]);
  const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
  const visibleYears = useMemo(() => years.filter(y => y >= yearRange[0] && y <= yearRange[1]), [yearRange]);
  const chartColors = {
    milk: { stroke: "#FF6B00", fill: "#FFF0E0" },
    weight: { stroke: "#1B3A6B", fill: "#E8EEF6" },
  };
  const isDark = false;
  const iconMap: Record<string, any> = { Birth: Baby, Conception: Heart, Calving: Baby, Vaccine: Syringe };

  const filteredEvents = useMemo(() => events.filter(e => {
    const t = new Date(e.date).getTime();
    return t >= visibleStart && t <= visibleEnd;
  }), [events, visibleStart, visibleEnd]);

  const filteredMilk = useMemo(() => milkData.filter(m => m.timestamp >= visibleStart && m.timestamp <= visibleEnd), [milkData, visibleStart, visibleEnd]);
  const filteredWeight = useMemo(() => weightData.filter(w => w.timestamp >= visibleStart && w.timestamp <= visibleEnd), [weightData, visibleStart, visibleEnd]);
  const filteredLactations = useMemo(() => lactations.filter(l => {
    const s = new Date(l.start).getTime();
    const e = new Date(l.end).getTime();
    return e >= visibleStart && s <= visibleEnd;
  }), [lactations, visibleStart, visibleEnd]);

  const getPercentVisible = (dateString: string) => getPercent(dateString, visibleStart, visibleEnd);

  return (
    <div>
      <div className="w-full mx-auto bg-white border border-saffron/15 rounded-xl shadow-lg font-sans overflow-hidden my-4 md:my-6">
        <div className="flex flex-wrap justify-between items-center p-4 md:p-6 border-b border-saffron/10 bg-gradient-to-r from-orange-50 to-amber-50 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-white rounded-lg border border-saffron/20 shadow-sm"><Activity className="w-8 h-8 text-saffron" /></div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-navy tracking-tight">{tagName}</h1>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Historical Array <span className="text-saffron ml-1">{yearRange[0]} – {yearRange[1]}</span></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <Stat icon={Heart} value={filteredEvents.filter(e=>e.type==="Conception").length} label="Pregnancies" color="text-pink-500" bg="bg-pink-50" darkBorder="border-pink-200" />
            <Stat icon={Milk} value={filteredLactations.length} label="Lactations" color="text-blue-500" bg="bg-blue-50" darkBorder="border-blue-200" />
            <Stat icon={Droplet} value={filteredMilk.length ? `${Math.max(...filteredMilk.map(m=>m.yield)).toFixed(1)} L` : "—"} label="Record Peak" color="text-saffron" bg="bg-orange-50" darkBorder="border-orange-200" />
            <Stat icon={Scale} value={filteredWeight.length ? `${Math.max(...filteredWeight.map(w=>w.weight)).toFixed(0)} kg` : "—"} label="Mature Wt." color="text-navy" bg="bg-amber-50" darkBorder="border-amber-200" />
          </div>
        </div>

        {/* BRUSH / YEAR SLIDER BAR - Light theme with Saffron/Golden */}
        <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-saffron/15 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-saffron" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy">Brush — Select Year Range</span>
              <span className="px-2.5 py-1 rounded-full bg-saffron text-white text-xs font-bold">{yearRange[0]} — {yearRange[1]}</span>
              <span className="text-[11px] text-muted-foreground hidden md:inline">Slide to filter timeline, milk & weight</span>
            </div>
            <button onClick={() => setYearRange([START_YEAR, END_YEAR])} className="px-3 py-1.5 rounded-lg bg-white border border-saffron/20 text-xs font-semibold hover:bg-saffron/5 transition-colors">Reset to All Years</button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs font-mono font-bold text-navy w-10 text-center">{START_YEAR}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From</label>
                <input type="range" min={START_YEAR} max={END_YEAR} value={yearRange[0]} onChange={e => {
                  const v = Math.min(Number(e.target.value), yearRange[1] - 1);
                  setYearRange([v, yearRange[1]]);
                }} className="w-full h-2 bg-saffron/10 rounded-lg appearance-none cursor-pointer accent-saffron" />
                <span className="text-xs font-bold text-center text-saffron">{yearRange[0]}</span>
              </div>
              <div className="w-px h-12 bg-saffron/20 hidden md:block" />
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To</label>
                <input type="range" min={START_YEAR} max={END_YEAR} value={yearRange[1]} onChange={e => {
                  const v = Math.max(Number(e.target.value), yearRange[0] + 1);
                  setYearRange([yearRange[0], v]);
                }} className="w-full h-2 bg-saffron/10 rounded-lg appearance-none cursor-pointer accent-saffron" />
                <span className="text-xs font-bold text-center text-saffron">{yearRange[1]}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-navy w-10 text-center">{END_YEAR}</span>
          </div>

          <div className="relative h-12 bg-white rounded-lg border border-saffron/15 overflow-hidden px-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milkData.length ? milkData : Array.from({length: END_YEAR-START_YEAR+1}, (_,i)=>({timestamp: new Date(`${START_YEAR+i}-06-01`).getTime(), yield: 0}))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="timestamp" type="number" domain={[TIMELINE_START, TIMELINE_END]} hide />
                <Area type="monotone" dataKey="yield" stroke="#FF6B00" fill="#FFF0E0" fillOpacity={0.6} isAnimationActive={false} />
                <Brush
                  dataKey="timestamp"
                  height={28}
                  stroke="#FF6B00"
                  fill="#FFF7ED"
                  travellerWidth={14}
                  gap={1}
                  onChange={(domain: any) => {
                    if (domain && domain.length === 2 && milkData.length) {
                      const startIdx = domain[0];
                      const endIdx = domain[1];
                      const sorted = [...milkData].sort((a,b)=>a.timestamp-b.timestamp);
                      if (sorted[startIdx] && sorted[endIdx]) {
                        const sYear = new Date(sorted[startIdx].timestamp).getFullYear();
                        const eYear = new Date(sorted[endIdx].timestamp).getFullYear();
                        if (sYear < eYear) setYearRange([sYear, eYear]);
                      }
                    }
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <span className="absolute left-2 top-1 text-[10px] font-bold text-saffron pointer-events-none">BRUSH — drag handles to slide</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar bg-orange-50/20">
          <div className="flex min-w-[3600px] relative bg-white transition-colors duration-300">
            <div className="w-32 md:w-48 shrink-0 flex flex-col border-r border-saffron/10 z-40 sticky left-0 bg-white/95 backdrop-blur-md shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
              <div className="h-12 border-b border-saffron/10 flex items-center justify-center font-bold text-navy/60 text-xs md:text-sm">TIMELINE</div>
              <LabelBlock title="REPRODUCTION" subtitle={`${filteredEvents.filter(e=>e.type==="Conception").length} Cycles`} color="text-saffron" bg="bg-orange-50/60" height="h-72" />
              <LabelBlock title="MILK YIELD" subtitle="Continuous (L)" color="text-saffron" bg="bg-orange-50/40" height="h-64" />
              <LabelBlock title="BODY WEIGHT" subtitle="Growth (kg)" color="text-navy" bg="bg-amber-50/40" height="h-48" />
              <LabelBlock title="LACTATION" subtitle="Active Periods" color="text-purple-700" bg="bg-purple-50/40" height="h-24" />
            </div>

            <div className="flex-1 relative flex flex-col">
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {visibleYears.map((year, i) => (
                  <div key={year} className="h-full border-l border-dashed border-saffron/10" style={{ position: 'absolute', left: `${(i / Math.max(1, visibleYears.length - 1)) * 100}%` }} />
                ))}
              </div>
              <div className="h-12 relative border-b border-saffron/10 z-10 bg-white/80 backdrop-blur-sm">
                {visibleYears.map((year, i) => (
                  <div key={year} className="absolute bottom-2 -translate-x-1/2 font-bold text-navy text-sm md:text-base px-2 rounded-md" style={{ left: `${(i / Math.max(1, visibleYears.length - 1)) * 100}%` }}>{year}</div>
                ))}
              </div>

              <div className="h-72 relative border-b border-saffron/10 z-10">
                {Array.from(new Set(filteredEvents.filter(e=>e.group).map(e=>e.group))).map(group => {
                  const start = filteredEvents.find(e => e.group === group && e.type === 'Conception');
                  const end = filteredEvents.find(e => e.group === group && e.type === 'Calving');
                  if (!start || !end) return null;
                  const leftPct = getPercent(start.date, visibleStart, visibleEnd);
                  const widthPct = getPercent(end.date, visibleStart, visibleEnd) - leftPct;
                  return (
                    <div key={`line-${group}`} className="absolute top-1/2 border-t-2 border-dashed border-saffron/60 -translate-y-1/2" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-saffron bg-white px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap shadow-sm border border-saffron/20">{end.title}</div>
                    </div>
                  );
                })}
                {filteredEvents.map((event) => {
                  const IconComponent = (iconMap[event.type] || Activity);
                  let yOffset = '';
                  if (event.position === 'above') yOffset = 'bottom-full mb-3';
                  if (event.position === 'below') yOffset = 'top-full mt-3';
                  if (event.position === 'far-above') yOffset = 'bottom-full mb-14';
                  return (
                    <div key={event.id} className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${getPercent(event.date, visibleStart, visibleEnd)}%` }}>
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${event.color.replace('dark:', '').split(' ')[0]} border-2 border-white shadow-md z-20 relative flex items-center justify-center text-white`}>
                        <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                        <div className={`absolute flex flex-col items-center w-24 left-1/2 -translate-x-1/2 bg-white backdrop-blur-md p-1.5 rounded-md shadow-sm border border-saffron/10 ${yOffset}`}>
                          <span className="text-[10px] md:text-xs font-bold text-navy uppercase leading-none">{event.type}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap leading-tight mt-1">{event.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-64 border-b border-saffron/10 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredMilk} margin={{ top: 20, right: 0, left: 0, bottom: 24 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[visibleStart, visibleEnd]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(1)} L`, 'Yield']} contentStyle={{ borderRadius: '8px', border: '1px solid #FFE0B2', backgroundColor: '#ffffff' }} />
                    <Area type="monotone" dataKey="yield" stroke="#FF6B00" strokeWidth={2} fill="#FFF0E0" fillOpacity={1} />
                    <Brush dataKey="timestamp" height={24} stroke="#FF6B00" fill="#FFF7ED" travellerWidth={10} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48 border-b border-saffron/10 z-10 bg-amber-50/20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredWeight} margin={{ top: 20, right: 0, left: 0, bottom: 24 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[visibleStart, visibleEnd]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(0)} kg`, 'Body Weight']} contentStyle={{ borderRadius: '8px', border: '1px solid #FFE0B2', backgroundColor: '#ffffff' }} />
                    <Area type="monotone" dataKey="weight" stroke="#1B3A6B" strokeWidth={2} fill="#E8EEF6" fillOpacity={0.8} />
                    <Brush dataKey="timestamp" height={24} stroke="#1B3A6B" fill="#E8EEF6" travellerWidth={10} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-24 relative z-10 bg-white">
                {filteredLactations.map(period => {
                  const leftPct = getPercent(period.start, visibleStart, visibleEnd);
                  const widthPct = getPercent(period.end, visibleStart, visibleEnd) - leftPct;
                  return (
                    <div key={period.id} className="absolute top-6 flex flex-col items-center" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                      <div className="w-full h-2 md:h-3 bg-purple-500 rounded-full relative shadow-sm">
                         <div className="absolute -left-1 md:-left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-700 rounded-full border-2 border-white shadow-sm" />
                         <div className="absolute -right-1 md:-right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-700 rounded-full border-2 border-white shadow-sm" />
                      </div>
                      <div className="mt-2 text-[9px] md:text-xs font-bold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 shadow-sm whitespace-nowrap">{period.title}</div>
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
