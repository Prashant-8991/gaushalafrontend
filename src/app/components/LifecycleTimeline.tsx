import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Droplet, Heart, Baby, Syringe, Scale, Milk, Maximize2, X, Sparkles, SlidersHorizontal, Stethoscope, Pill } from "lucide-react";

const START_YEAR = 2000;
const END_YEAR = 2027;
const TIMELINE_START = new Date(`${START_YEAR}-01-01`).getTime();
const TIMELINE_END = new Date(`${END_YEAR}-12-31`).getTime();

const getPercent = (dateString: string, start = TIMELINE_START, end = TIMELINE_END) => {
  const time = new Date(dateString).getTime();
  if (end <= start) return 0;
  return ((time - start) / (end - start)) * 100;
};

const formatCalvingInterval = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
  if (days >= 365) {
    const y = Math.floor(days / 365);
    const m = Math.round((days % 365) / 30);
    return m ? `${y}y ${m}mo` : `${y}y`;
  }
  if (days >= 60) {
    const mo = Math.round(days / 30);
    const d = days % 30;
    return d ? `${mo}mo ${d}d` : `${mo}mo`;
  }
  return `${days}d`;
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
interface TreatmentEvent { id: number; date: string; disease: string | null; treatments: { name: string; quantities: string }[]; }

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

function TimelineView({ events, lactations, milkData, weightData, treatmentEvents, tagName, birthDate }: { events: LifecycleEvent[]; lactations: LactationPeriod[]; milkData: MilkPoint[]; weightData: WeightPoint[]; treatmentEvents: TreatmentEvent[]; tagName: string; birthDate?: string | null }) {
  // Dynamic timeline: the axis starts at the cattle's birth date (not year 2000),
  // so the birth marker is visible at the left edge without horizontal scrolling.
  const earliestTs = useMemo(() => {
    const ts: number[] = [];
    const pushDate = (d?: string | null) => {
      if (!d) return;
      const t = new Date(d).getTime();
      if (Number.isFinite(t)) ts.push(t);
    };
    events.forEach(e => pushDate(e.date));
    treatmentEvents.forEach(t => pushDate(t.date));
    lactations.forEach(l => pushDate(l.start));
    milkData.forEach(m => { if (Number.isFinite(m.timestamp)) ts.push(m.timestamp); });
    weightData.forEach(w => { if (Number.isFinite(w.timestamp)) ts.push(w.timestamp); });
    return ts.length ? Math.min(...ts) : TIMELINE_START;
  }, [events, treatmentEvents, lactations, milkData, weightData]);

  const birthTs = useMemo(() => {
    const t = birthDate ? new Date(birthDate).getTime() : NaN;
    if (Number.isFinite(t)) return Math.min(t, earliestTs);
    return earliestTs;
  }, [birthDate, earliestTs]);
  const startYear = useMemo(() => new Date(birthTs).getFullYear(), [birthTs]);
  // Dynamic end: current year (extended only if the data itself runs later),
  // so the filter reads "birth year → current year".
  const dataEndYear = useMemo(() => {
    const ys: number[] = [];
    const pushYear = (d?: string | null) => {
      if (!d) return;
      const t = new Date(d).getTime();
      if (Number.isFinite(t)) ys.push(new Date(t).getFullYear());
    };
    events.forEach(e => pushYear(e.date));
    treatmentEvents.forEach(t => pushYear(t.date));
    lactations.forEach(l => pushYear(l.end));
    milkData.forEach(m => { if (Number.isFinite(m.timestamp)) ys.push(new Date(m.timestamp).getFullYear()); });
    weightData.forEach(w => { if (Number.isFinite(w.timestamp)) ys.push(new Date(w.timestamp).getFullYear()); });
    return ys.length ? Math.max(...ys) : new Date().getFullYear();
  }, [events, treatmentEvents, lactations, milkData, weightData]);
  const endYear = Math.max(new Date().getFullYear(), dataEndYear, startYear);

  // From/To year picked by the user. To year left empty means "current year".
  const currentYear = new Date().getFullYear();
  const [fromYear, setFromYear] = useState(startYear);
  const [toYearRaw, setToYearRaw] = useState<number | null>(null);
  const toYear = toYearRaw ?? currentYear;
  // Never let the range invert; the view always uses ordered bounds.
  const effFrom = Math.min(fromYear, toYear);
  const effTo = Math.max(fromYear, toYear);

  // Stretch / pinch zoom applied to the whole timeline width, so every row
  // (reproduction, milk yield, body weight, lactation) zooms together.
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const pendingAnchor = useRef<{ ax: number; ratio: number } | null>(null);
  const applyZoom = (next: number, anchorClientX?: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.min(6, Math.max(1, next));
    const prev = zoomRef.current;
    if (clamped === prev) return;
    const rect = el.getBoundingClientRect();
    const ax = (anchorClientX ?? rect.left + rect.width / 2) - rect.left;
    pendingAnchor.current = { ax, ratio: clamped / prev };
    zoomRef.current = clamped;
    setZoom(clamped);
  };
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const p = pendingAnchor.current;
    if (el && p) {
      el.scrollLeft = (el.scrollLeft + p.ax) * p.ratio - p.ax;
      pendingAnchor.current = null;
    }
  }, [zoom]);
  useEffect(() => { setFromYear(startYear); setToYearRaw(null); setZoom(1); zoomRef.current = 1; }, [startYear]);

  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentEvent | null>(null);
  // Small lead-in before birth so the birth marker and its label are not clipped
  // by the sticky "TIMELINE" column at the left edge.
  const LEAD_IN_MS = 150 * 24 * 60 * 60 * 1000;
  const visibleStart = useMemo(() => {
    if (effFrom <= startYear) return birthTs - LEAD_IN_MS;
    return new Date(`${effFrom}-01-01`).getTime();
  }, [effFrom, birthTs, startYear]);
  const visibleEnd = useMemo(() => new Date(`${effTo}-12-31`).getTime(), [effTo]);
  const years = Array.from({ length: Math.max(1, endYear - startYear + 1) }, (_, i) => startYear + i);
  // Years overlapping the actual visible window.
  const visibleYears = useMemo(() => years.filter(y => y >= effFrom && y <= effTo), [years, effFrom, effTo]);
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

  const filteredTreatments = useMemo(() => treatmentEvents.filter(t => {
    const ts = new Date(t.date).getTime();
    return ts >= visibleStart && ts <= visibleEnd;
  }), [treatmentEvents, visibleStart, visibleEnd]);

  const calvingIntervals = useMemo(() => {
    const calvings = [...filteredEvents].filter(e => e.type === 'Calving').sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    return calvings.slice(1).map((curr, idx) => {
      const prev = calvings[idx];
      return Math.round((new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (1000*60*60*24));
    });
  }, [filteredEvents]);
  const avgCalvingInterval = calvingIntervals.length ? Math.round(calvingIntervals.reduce((a,b)=>a+b,0)/calvingIntervals.length) : null;

  const getPercentVisible = (dateString: string) => getPercent(dateString, visibleStart, visibleEnd);

  // True on-screen position (0–100%) for any timestamp in the current view.
  const posPct = (ts: number) =>
    Math.max(0.5, Math.min(99.5, ((ts - visibleStart) / Math.max(1, visibleEnd - visibleStart)) * 100));

  // When zoomed into roughly a year or less, label months instead of years.
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spanDays = (visibleEnd - visibleStart) / 86400000;
  const showMonthTicks = spanDays <= 400;
  const monthTicks = useMemo(() => {
    if (!showMonthTicks) return [] as { ts: number; label: string }[];
    const out: { ts: number; label: string }[] = [];
    const cur = new Date(visibleStart);
    cur.setDate(1);
    let guard = 0;
    while (cur.getTime() <= visibleEnd && guard++ < 60) {
      out.push({ ts: cur.getTime(), label: `${MON[cur.getMonth()]} '${String(cur.getFullYear()).slice(2)}` });
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
  }, [showMonthTicks, visibleStart, visibleEnd]);

  // Always open the horizontal scroller at the far left so the birth marker
  // sits at the start edge (the black-square position), then scroll right
  // to reveal later events.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [visibleStart, tagName]);

  // Two-finger stretch on touch + Ctrl+scroll on desktop zoom the timeline,
  // keeping the point under the fingers/cursor anchored.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pinch: { d: number; z: number } | null = null;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) pinch = { d: dist(e.touches), z: zoomRef.current };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const d = dist(e.touches);
      if (d <= 0 || pinch.d <= 0) return;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      applyZoom(pinch.z * (d / pinch.d), cx);
    };
    const onTouchEnd = (e: TouchEvent) => { if (e.touches.length < 2) pinch = null; };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      applyZoom(zoomRef.current * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX);
    };
    const onGesture = (e: Event) => e.preventDefault();
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGesture as EventListener);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGesture as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const birthLabel = birthDate
    ? new Date(birthDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div>
      <div className="w-full mx-auto bg-white border border-saffron/15 rounded-xl shadow-lg font-sans overflow-hidden my-4 md:my-6">
        <div className="flex flex-wrap justify-between items-center p-4 md:p-6 border-b border-saffron/10 bg-gradient-to-r from-orange-50 to-amber-50 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-white rounded-lg border border-saffron/20 shadow-sm"><Activity className="w-8 h-8 text-saffron" /></div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-navy tracking-tight">{tagName}</h1>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">From birth{birthLabel ? ` ${birthLabel}` : ""} <span className="text-saffron ml-1">{effFrom} – {effTo}</span></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <Stat icon={Heart} value={filteredEvents.filter(e=>e.type==="Conception").length} label="Pregnancies" color="text-pink-500" bg="bg-pink-50" darkBorder="border-pink-200" />
            <Stat icon={Milk} value={filteredLactations.length} label="Lactations" color="text-blue-500" bg="bg-blue-50" darkBorder="border-blue-200" />
            <Stat icon={Droplet} value={filteredMilk.length ? `${Math.max(...filteredMilk.map(m=>m.yield)).toFixed(1)} L` : "—"} label="Record Peak" color="text-saffron" bg="bg-orange-50" darkBorder="border-orange-200" />
            <Stat icon={Scale} value={filteredWeight.length ? `${Math.max(...filteredWeight.map(w=>w.weight)).toFixed(0)} kg` : "—"} label="Mature Wt." color="text-navy" bg="bg-amber-50" darkBorder="border-amber-200" />
            <Stat icon={Baby} value={avgCalvingInterval ? `${avgCalvingInterval}d` : "—"} label="Avg Calving Interval" color="text-purple-600" bg="bg-purple-50" darkBorder="border-purple-200" />
          </div>
        </div>

        {/* YEAR RANGE FILTER - Light theme with Saffron/Golden */}
        <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-saffron/15 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-saffron" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy">Year Range</span>
              <span className="px-2.5 py-1 rounded-full bg-saffron text-white text-xs font-bold">{effFrom} — {effTo}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From</label>
              <select
                value={fromYear}
                onChange={e => {
                  const v = Number(e.target.value);
                  setFromYear(v);
                  if (toYear < v) setToYearRaw(v);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-saffron/20 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-saffron/30"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To</label>
              <select
                value={toYearRaw ?? ""}
                onChange={e => {
                  const raw = e.target.value;
                  if (raw === "") { setToYearRaw(null); return; }
                  const v = Number(raw);
                  if (v < fromYear) setFromYear(v);
                  setToYearRaw(v);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-saffron/20 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-saffron/30"
              >
                <option value="">Auto (current year {currentYear})</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-muted-foreground hidden md:inline">Leave To empty for current year &bull; stretch with two fingers or Ctrl+scroll to zoom</span>
            <div className="flex items-center gap-1">
              <button onClick={() => { const r = scrollRef.current?.getBoundingClientRect(); applyZoom(zoomRef.current / 1.3, r ? r.left + r.width / 2 : undefined); }} className="w-8 h-8 rounded-xl bg-white border border-saffron/20 text-base font-bold text-navy hover:bg-saffron/5 transition-colors" title="Zoom out">&minus;</button>
              <span className="text-xs font-bold text-navy w-11 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => { const r = scrollRef.current?.getBoundingClientRect(); applyZoom(zoomRef.current * 1.3, r ? r.left + r.width / 2 : undefined); }} className="w-8 h-8 rounded-xl bg-white border border-saffron/20 text-base font-bold text-navy hover:bg-saffron/5 transition-colors" title="Zoom in">+</button>
            </div>
            <button onClick={() => { setFromYear(startYear); setToYearRaw(null); setZoom(1); zoomRef.current = 1; }} className="px-3 py-1.5 rounded-lg bg-white border border-saffron/20 text-xs font-semibold hover:bg-saffron/5 transition-colors">Reset</button>
          </div>
        </div>

        <div ref={scrollRef} className="w-full overflow-x-auto custom-scrollbar bg-orange-50/20">
          <div className="flex relative bg-white transition-colors duration-300" style={{ minWidth: `${Math.max(1200, (endYear - startYear + 1) * 170) * zoom}px` }}>
            <div className="w-32 md:w-48 shrink-0 flex flex-col border-r border-saffron/10 z-40 sticky left-0 bg-white/95 backdrop-blur-md shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
              <div className="h-12 border-b border-saffron/10 flex items-center justify-center font-bold text-navy/60 text-xs md:text-sm">TIMELINE</div>
              <LabelBlock title="REPRODUCTION" subtitle={`${filteredEvents.filter(e=>e.type==="Conception").length} Cycles`} color="text-saffron" bg="bg-orange-50/60" height="h-72" />
              <LabelBlock title="MILK YIELD" subtitle="Continuous (L)" color="text-saffron" bg="bg-orange-50/40" height="h-64" />
              <LabelBlock title="BODY WEIGHT" subtitle="Growth (kg)" color="text-navy" bg="bg-amber-50/40" height="h-48" />
              <LabelBlock title="LACTATION" subtitle="Active Periods" color="text-purple-700" bg="bg-purple-50/40" height="h-24" />
            </div>

            <div className="flex-1 relative flex flex-col">
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {showMonthTicks
                  ? monthTicks.map(m => (
                    <div key={m.ts} className="h-full border-l border-dashed border-saffron/10" style={{ position: 'absolute', left: `${posPct(m.ts)}%` }} />
                  ))
                  : visibleYears.map(year => (
                    <div key={year} className="h-full border-l border-dashed border-saffron/10" style={{ position: 'absolute', left: `${posPct(new Date(`${year}-06-15`).getTime())}%` }} />
                  ))}
              </div>
              <div className="h-12 relative border-b border-saffron/10 z-10 bg-white/80 backdrop-blur-sm">
                {showMonthTicks
                  ? monthTicks.map(m => (
                    <div key={m.ts} className="absolute bottom-2 -translate-x-1/2 font-bold text-navy text-[10px] md:text-xs px-1 rounded-md whitespace-nowrap" style={{ left: `${posPct(m.ts)}%` }}>{m.label}</div>
                  ))
                  : visibleYears.map(year => (
                    <div key={year} className="absolute bottom-2 -translate-x-1/2 font-bold text-navy text-sm md:text-base px-2 rounded-md" style={{ left: `${posPct(new Date(`${year}-06-15`).getTime())}%` }}>{year}</div>
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
                {(() => {
                  const calvings = [...filteredEvents].filter(e => e.type === 'Calving').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  return calvings.slice(1).map((curr, idx) => {
                    const prev = calvings[idx];
                    const leftPct = getPercent(prev.date, visibleStart, visibleEnd);
                    const widthPct = getPercent(curr.date, visibleStart, visibleEnd) - leftPct;
                    if (widthPct <= 0) return null;
                    return (
                      <div key={`interval-${prev.id}-${curr.id}`} className="absolute top-[78%] left-0 border-t-2 border-dotted border-purple-400" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-white">
                          {formatCalvingInterval(prev.date, curr.date)}
                        </div>
                      </div>
                    );
                  });
                })()}
                {filteredEvents.map((event) => {
                  const IconComponent = (iconMap[event.type] || Activity);
                  let yOffset = '';
                  if (event.position === 'above') yOffset = 'bottom-full mb-3';
                  if (event.position === 'below') yOffset = 'top-full mt-3';
                  if (event.position === 'far-above') yOffset = 'bottom-full mb-14';
                  return (
                    <div key={event.id} className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${getPercent(event.date, visibleStart, visibleEnd)}%` }}>
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${event.color.replace('dark:', '').split(' ')[0]} border-2 border-white shadow-md z-20 relative flex items-center justify-center text-white ${event.type === "Birth" ? "ring-4 ring-saffron/60" : ""}`}>
                        <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                        <div className={`absolute flex flex-col items-center w-24 left-1/2 -translate-x-1/2 bg-white backdrop-blur-md p-1.5 rounded-md shadow-sm border border-saffron/10 ${yOffset}`}>
                          <span className="text-[10px] md:text-xs font-bold text-navy uppercase leading-none">{event.type}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap leading-tight mt-1">{event.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredTreatments.map((t) => (
                  <div key={`treat-${t.id}`} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group z-30" style={{ left: `${getPercent(t.date, visibleStart, visibleEnd)}%` }} onClick={() => setSelectedTreatment(t)}>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 transition-all">
                      <Stethoscope className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-lg border border-red-200 hidden group-hover:flex flex-col items-center whitespace-nowrap">
                      <span className="text-[10px] font-bold text-red-600">{t.disease || "Treatment"}</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-64 border-b border-saffron/10 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredMilk} margin={{ top: 20, right: 0, left: 0, bottom: 24 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[visibleStart, visibleEnd]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(1)} L`, 'Yield']} contentStyle={{ borderRadius: '8px', border: '1px solid #FFE0B2', backgroundColor: '#ffffff' }} />
                  <Area type="monotone" dataKey="yield" stroke="#FF6B00" strokeWidth={2} fill="#FFF0E0" fillOpacity={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48 border-b border-saffron/10 z-10 bg-amber-50/20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredWeight} margin={{ top: 20, right: 0, left: 0, bottom: 24 }}>
                    <XAxis dataKey="timestamp" type="number" domain={[visibleStart, visibleEnd]} hide />
                    <Tooltip labelFormatter={(val:any) => new Date(val).toLocaleDateString()} formatter={(val:any) => [`${Number(val).toFixed(0)} kg`, 'Body Weight']} contentStyle={{ borderRadius: '8px', border: '1px solid #FFE0B2', backgroundColor: '#ffffff' }} />
                  <Area type="monotone" dataKey="weight" stroke="#1B3A6B" strokeWidth={2} fill="#E8EEF6" fillOpacity={0.8} />
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
      {selectedTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTreatment(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-saffron/20 animate-in fade-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Stethoscope className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold">{selectedTreatment.disease || "Treatment"}</h3>
                  <p className="text-xs text-white/80">{new Date(selectedTreatment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} • {tagName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTreatment(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-auto max-h-[60vh]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-saffron" /> Treatments ({selectedTreatment.treatments.length})</h4>
              <div className="space-y-2">
                {selectedTreatment.treatments.map((tr: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-saffron/10">
                    <span className="text-sm font-medium flex-1 pr-3">{tr.name}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-saffron/10 text-saffron border border-saffron/20 whitespace-nowrap">{tr.quantities}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-muted/20 border-t flex justify-end">
              <button onClick={() => setSelectedTreatment(null)} className="px-5 py-2 rounded-xl bg-saffron text-white text-sm font-semibold hover:bg-saffron-dark transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LifecycleShowcase({ tag }: { tag: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetch(`${API_BASE}/cattle/${encodeURIComponent(tag)}/lifecycle`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, tag]);

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
              <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-400 mt-1">Starts at birth • Reproduction • Milk • Weight • Lactation</p>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col h-screen">
          <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800 shrink-0">
            <h2 className="text-white font-bold text-base flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-400" /> {tag} — Lifecycle Timeline</h2>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-white p-1 md:p-2 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-zinc-500">Loading lifecycle...</div>
            ) : data ? (
              <div className="flex-1 overflow-auto">
                <TimelineView
                  key={tag}
                  events={data.reproductionEvents || []}
                  lactations={data.lactationPeriods || []}
                  milkData={data.milkData || []}
                  weightData={data.weightData || []}
                  treatmentEvents={data.treatmentEvents || []}
                  tagName={data.name || tag}
                  birthDate={data.date_of_birth}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-zinc-500">No data</div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </>
  );
}
