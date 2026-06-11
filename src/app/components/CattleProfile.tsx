import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft, Printer, Droplets, Calendar, GitBranch, Heart, Baby, Shield,
  AlertTriangle, Users, Loader2, Flower2, Scale, ArrowRight, ArrowDownRight, Circle, Maximize2, X, Pencil,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid } from "recharts";
import { CowIcon } from "./icons/icons";

interface SiblingInfo { name: string | null; tag_number: string | null; generation: number | null; }
interface ParentInfo { name: string | null; tag_number: string | null; generation: number | null; }
interface BreedScore { hip_width: string; head: string; ear: string; eye: string; muzzle: string; horn: string; skin: string; tail: string; hump: string; udder: string; teat: string; dewlap: string; milk_vein: string; }
interface MilkRecord { date: string | null; milk: number | null; }
interface FamilyInfo { mother: ParentInfo | null; father: ParentInfo | null; siblings: SiblingInfo[]; childrens: SiblingInfo[]; }
interface PregnancyLog { id: number; conception_date: string | null; birth_date: string; gestation_period: string | null; calving_interval: string | null; }
interface CattleCardOverview {
  name: string | null; tag_number: string | null; physical_score: number | null; average_physical_score: number | null;
  acquisition_type: string | null; generation: string | null; DOB: string | null; total_childrens: number | null;
  siblings: SiblingInfo[]; is_present: number | null; lactation_cycle: string | null; last_calving_date: string | null;
  mother: ParentInfo | string | null; father: ParentInfo | string | null; childrens: SiblingInfo[];
  breed_score: BreedScore | null; weight: string | null; age: string | null; average_milk_per_day: number | null;
}
interface CattleCardResponse {
  overview: CattleCardOverview | null; milk_by_month: MilkRecord[]; milk_by_day_only_for_month: MilkRecord[];
  family: FamilyInfo | null; pregnancy_logs: PregnancyLog[];
}

const BREED_TRAITS = [
  { key: "head", label: "Head" }, { key: "ear", label: "Ear" }, { key: "eye", label: "Eye" },
  { key: "muzzle", label: "Muzzle" }, { key: "horn", label: "Horn" }, { key: "skin", label: "Skin" },
  { key: "tail", label: "Tail" }, { key: "hump", label: "Hump" }, { key: "udder", label: "Udder" },
  { key: "teat", label: "Teat" }, { key: "dewlap", label: "Dewlap" }, { key: "milk_vein", label: "Milk Vein" },
] as const;

function getBreedScoreArray(bs: BreedScore) { return BREED_TRAITS.map(t => ({ trait: t.label, score: Math.min(10, Math.max(0, parseFloat((bs as any)[t.key]) || 0)) })); }
function isParentObj(v: any): v is ParentInfo { return v && typeof v === "object" && "tag_number" in v; }
function formatDate(d: string | null) { if (!d || d === "Not available") return "—"; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

export function CattleProfile() {
  const { tagNumber } = useParams<{ tagNumber: string }>();
  const navigate = useNavigate();
  const tag = tagNumber || "";
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [apiData, setApiData] = useState<CattleCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<"monthly" | "daily" | null>(null);

  const ov = apiData?.overview;
  const bs = ov?.breed_score;
  const breedScores = bs ? getBreedScoreArray(bs) : [];
  const totalScore = breedScores.length ? avg(breedScores.map(s => s.score)) : 0;
  const isMilking = ov?.average_milk_per_day != null && ov.average_milk_per_day > 0;
  const pregnancyLogs = apiData?.pregnancy_logs || [];

  const milkWithAvg = apiData?.milk_by_month?.length
    ? (() => { const vals = apiData.milk_by_month.map(m => m.milk || 0); return { data: apiData.milk_by_month, average: +avg(vals).toFixed(1) }; })()
    : null;
  const dailyWithAvg = apiData?.milk_by_day_only_for_month?.length
    ? (() => { const vals = apiData.milk_by_day_only_for_month.map(m => m.milk || 0); return { data: apiData.milk_by_day_only_for_month, average: +avg(vals).toFixed(1) }; })()
    : null;

  useEffect(() => { if (!tag) { setLoading(false); return; }
    let c = false; setLoading(true);
    fetch(`${base}/cattle-card/${tag}`).then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => { if (!c) { setApiData(d); setLoading(false); } })
      .catch(e => { if (!c) { setFetchError(e.message); setLoading(false); } });
    return () => { c = true; };
  }, [tag]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <span className="text-muted-foreground text-[0.85rem]">Loading…</span>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="surface p-8 text-center max-w-md"
      >
        <AlertTriangle className="w-8 h-8 text-destructive/70 mx-auto mb-3" />
        <p className="font-medium">Not found</p>
        <p className="text-sm text-muted-foreground mt-1">{fetchError}</p>
        <button onClick={() => navigate(-1)} className="mt-4 h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90">Go back</button>
      </motion.div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-5" id="cattle-profile-print">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-3 no-print"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] flex items-center gap-2 truncate">
              <Flower2 className="w-5 h-5 text-saffron shrink-0" strokeWidth={1.6} />
              {ov?.name || tag}
            </h1>
            <p className="text-[0.82rem] text-muted-foreground tabular">
              {ov?.tag_number} · Gen {ov?.generation || "?"} · {ov?.age || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/edit/${encodeURIComponent(tag)}`)}
            className="h-8 px-3 rounded-md border border-border text-foreground text-[0.82rem] font-medium hover:bg-muted transition-colors inline-flex items-center gap-1.5 no-print"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => window.print()}
            className="h-8 px-3 rounded-md bg-foreground text-background text-[0.82rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            <Printer className="w-3 h-3" /> Print
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="surface overflow-hidden"
      >
        <div className="bg-gradient-to-br from-saffron/[0.06] to-navy/[0.04] p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-saffron/20 to-navy/20 flex items-center justify-center text-2xl font-semibold text-saffron ring-1 ring-saffron/30 shrink-0">
              {(ov?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[1.35rem] font-semibold text-foreground leading-tight">{ov?.name || tag}</h2>
                <span className={`chip text-[0.65rem] ${
                  ov?.is_present === 1
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}>
                  {ov?.is_present === 1 ? "Present" : "Not present"}
                </span>
                {ov?.lactation_cycle && (
                  <span className="chip chip-info text-[0.65rem]">{ov.lactation_cycle}</span>
                )}
              </div>
              <p className="text-muted-foreground text-[0.82rem] mt-1 tabular">
                {ov?.tag_number} · {ov?.acquisition_type || "—"} · Born {formatDate(ov?.DOB ?? null)}
              </p>
            </div>
            {ov?.physical_score != null && (
              <div className="text-center shrink-0 hidden sm:block">
                <div className="px-3 py-2 rounded-lg bg-foreground text-background flex flex-col items-center justify-center min-w-[64px]">
                  <span className="text-[1.35rem] font-semibold metric leading-none">{ov.physical_score}</span>
                  <span className="text-[0.55rem] uppercase tracking-wider opacity-70 mt-0.5">Score</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-7">
          <Section icon={<Flower2 className="w-3.5 h-3.5" />} title="Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <Field label="Tag" value={ov?.tag_number || "—"} />
              <Field label="Generation" value={ov?.generation || "—"} />
              <Field label="Acquisition" value={ov?.acquisition_type === "Not available" ? "—" : (ov?.acquisition_type || "—")} />
              <Field label="Age" value={ov?.age || "—"} />
              <Field label="Weight" value={ov?.weight || "—"} />
              <Field label="Lactation" value={ov?.lactation_cycle || "—"} />
              <Field label="Last calving" value={formatDate(ov?.last_calving_date ?? null)} />
              {isMilking && <Field label="Avg milk / day" value={`${ov?.average_milk_per_day} L`} />}
              <Field label="Children" value={String(ov?.total_childrens ?? 0)} />
              <Field label="Siblings" value={String(ov?.siblings?.length ?? 0)} />
            </div>
          </Section>

          <Section icon={<Droplets className="w-3.5 h-3.5" />} title="Milk production">
            {!isMilking ? (
              <p className="text-[0.85rem] text-muted-foreground">Currently not milking.</p>
            ) : (
              <>
                {milkWithAvg && milkWithAvg.data.length > 0 && (
                  <ChartCard
                    label={`Monthly · avg ${milkWithAvg.average} L`}
                    color="saffron"
                    onFullscreen={() => setFullscreenChart("monthly")}
                  >
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={milkWithAvg.data} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#DC4F0A" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="#DC4F0A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} angle={-45} dy={4} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} width={32} />
                        <Tooltip />
                        <ReferenceLine y={milkWithAvg.average} stroke="#94A3B8" strokeDasharray="4 3" label={{ value: `Avg ${milkWithAvg.average}L`, position: "insideTopRight", fill: "#64748B", fontSize: 9, fontWeight: 500 }} />
                        <Area type="monotone" dataKey="milk" stroke="#DC4F0A" strokeWidth={2} fill="url(#milkG)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {dailyWithAvg && dailyWithAvg.data.length > 0 && (
                  <ChartCard
                    label={`Daily · avg ${dailyWithAvg.average} L`}
                    color="navy"
                    onFullscreen={() => setFullscreenChart("daily")}
                  >
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={dailyWithAvg.data} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dailyG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#142E55" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="#142E55" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8 }} tickFormatter={v => v?.slice(5, 10) || ""} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} width={32} />
                        <Tooltip />
                        <ReferenceLine y={dailyWithAvg.average} stroke="#DC4F0A" strokeDasharray="4 3" label={{ value: `Avg ${dailyWithAvg.average}L`, position: "insideTopRight", fill: "#DC4F0A", fontSize: 9, fontWeight: 500 }} />
                        <Area type="monotone" dataKey="milk" stroke="#142E55" strokeWidth={1.5} fill="url(#dailyG)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {ov?.average_milk_per_day != null && (
                  <div className="bg-saffron/[0.06] border border-saffron/15 rounded-md p-3 text-center">
                    <p className="eyebrow">Average daily</p>
                    <p className="text-[1.5rem] font-semibold text-saffron metric mt-1">
                      {ov.average_milk_per_day} <span className="text-[0.85rem] text-muted-foreground font-normal">L/day</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </Section>

          <Section icon={<Scale className="w-3.5 h-3.5" />} title="Weight">
            <Field label="Weight at birth" value={ov?.weight || "—"} />
          </Section>

          <Section icon={<GitBranch className="w-3.5 h-3.5" />} title="Family">
            <div className="space-y-4">
              {(isParentObj(ov?.father) || isParentObj(ov?.mother)) && (
                <div className="flex justify-center gap-12">
                  {isParentObj(ov?.mother) && <ParentAvatar parent={ov.mother as ParentInfo} label="Mother" color="saffron" />}
                  {isParentObj(ov?.father) && <ParentAvatar parent={ov.father as ParentInfo} label="Father" color="navy" />}
                </div>
              )}
              {ov?.childrens && ov.childrens.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Children · {ov.childrens.length}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ov.childrens.map(c => (
                      <button
                        key={c.tag_number}
                        onClick={() => navigate(`/cattle/${c.tag_number}`)}
                        className="inline-flex items-center gap-1.5 surface-soft hover:bg-background hover:ring-1 hover:ring-saffron/20 px-2.5 py-1 text-[0.8rem] text-foreground transition-all"
                      >
                        <span className="w-4 h-4 rounded bg-saffron/15 text-saffron flex items-center justify-center text-[0.6rem] font-semibold">{c.name?.[0] || "?"}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {apiData?.family?.siblings && apiData.family.siblings.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Siblings · {apiData.family.siblings.length}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {apiData.family.siblings.map(s => (
                      <button
                        key={s.tag_number}
                        onClick={() => navigate(`/cattle/${s.tag_number}`)}
                        className="inline-flex items-center gap-1.5 surface-soft hover:bg-background hover:ring-1 hover:ring-saffron/20 px-2.5 py-1 text-[0.8rem] text-foreground transition-all"
                      >
                        <span className="w-4 h-4 rounded bg-saffron/15 text-saffron flex items-center justify-center text-[0.6rem] font-semibold">{s.name?.[0] || "?"}</span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          <Section icon={<Heart className="w-3.5 h-3.5" />} title="Pregnancy history">
            {pregnancyLogs.length > 0 ? (
              <div className="relative pl-6">
                <div className="absolute left-[10px] top-2 bottom-2 w-px bg-border" />
                {pregnancyLogs.map((pl, idx) => (
                  <div key={pl.id} className="relative mb-3 last:mb-0">
                    <div className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      idx === 0 ? "bg-saffron border-saffron" : "bg-card border-border"
                    }`}>
                      <Circle className={`w-1 h-1 ${idx === 0 ? "text-white fill-white" : "text-muted-foreground/40 fill-muted-foreground/40"}`} />
                    </div>
                    <div className="surface p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-saffron/10 text-saffron ring-1 ring-saffron/20 flex items-center justify-center">
                          <Baby className="w-3 h-3" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-[0.85rem] font-semibold text-foreground">Birth #{pregnancyLogs.length - idx}</p>
                          <p className="text-[0.7rem] text-muted-foreground tabular">{formatDate(pl.birth_date)}</p>
                        </div>
                        {idx === 0 && <span className="ml-auto text-[0.65rem] font-medium text-saffron bg-saffron/10 border border-saffron/20 px-1.5 py-0.5 rounded">Latest</span>}
                      </div>
                      <div className="flex items-center gap-2 surface-soft px-2.5 py-1.5 text-[0.78rem]">
                        <Heart className="w-3 h-3 text-pink-500" strokeWidth={1.8} />
                        <span className="text-muted-foreground">Conception {formatDate(pl.conception_date)}</span>
                        {pl.gestation_period && (
                          <>
                            <ArrowRight className="w-3 h-3 text-saffron" strokeWidth={2} />
                            <span className="font-medium text-saffron">{pl.gestation_period} gestation</span>
                          </>
                        )}
                      </div>
                      {pl.calving_interval && (
                        <div className="flex items-center gap-2 bg-info/8 border border-info/15 rounded-md px-2.5 py-1.5 text-[0.78rem] mt-1.5">
                          <ArrowDownRight className="w-3 h-3 text-info" strokeWidth={1.8} />
                          <span className="font-medium text-info">Interval {pl.calving_interval}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[0.85rem] text-muted-foreground">No pregnancy records found.</p>
            )}
          </Section>

          {bs && breedScores.length > 0 && (
            <Section icon={<Shield className="w-3.5 h-3.5" />} title="Breed score">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={breedScores} outerRadius="75%">
                    <PolarGrid stroke="#DDD7C5" />
                    <PolarAngleAxis dataKey="trait" tick={{ fontSize: 9, fill: "#6B6759" }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "#6B6759" }} />
                    <Radar name="Score" dataKey="score" stroke="#DC4F0A" fill="#DC4F0A" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <div>
                  <div className="bg-saffron/[0.06] border border-saffron/15 rounded-md p-3 text-center mb-3">
                    <p className="eyebrow">Average</p>
                    <p className={`text-[1.5rem] font-semibold mt-1 metric ${totalScore >= 7 ? "text-success" : totalScore >= 5 ? "text-warning" : "text-destructive"}`}>
                      {totalScore.toFixed(1)}<span className="text-[0.85rem] text-muted-foreground font-normal">/10</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    {breedScores.map(d => (
                      <div key={d.trait} className="flex items-center gap-2">
                        <span className="text-[0.7rem] text-muted-foreground w-16 shrink-0">{d.trait}</span>
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${d.score >= 7 ? "bg-success" : d.score >= 5 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${(d.score / 10) * 100}%` }} />
                        </div>
                        <span className={`text-[0.7rem] font-semibold w-5 text-right metric ${d.score >= 7 ? "text-success" : d.score >= 5 ? "text-warning" : "text-destructive"}`}>{d.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </motion.div>

      {fullscreenChart && (() => {
        const isMonthly = fullscreenChart === "monthly";
        const chartData = isMonthly ? milkWithAvg?.data : dailyWithAvg?.data;
        const chartAvg = isMonthly ? milkWithAvg?.average : dailyWithAvg?.average;
        const strokeColor = isMonthly ? "#DC4F0A" : "#142E55";
        const avgColor = isMonthly ? "#142E55" : "#DC4F0A";
        const title = isMonthly ? "Monthly milk production" : "Daily milk · last 30 days";
        return (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in" onClick={() => setFullscreenChart(null)}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <h2 className="text-[1.05rem] font-semibold text-foreground">{ov?.name} · {title}</h2>
                <p className="text-[0.78rem] text-muted-foreground">Click anywhere to close</p>
              </div>
              <button onClick={() => setFullscreenChart(null)} className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 p-5" onClick={e => e.stopPropagation()}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="fullG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  {chartAvg != null && <ReferenceLine y={chartAvg} stroke={avgColor} strokeDasharray="6 3" label={{ value: `Avg ${chartAvg} L`, position: "insideTopRight", fill: avgColor, fontSize: 11, fontWeight: 600 }} />}
                  <Area type="monotone" dataKey="milk" stroke={strokeColor} strokeWidth={2.5} fill="url(#fullG)" dot={{ r: 3, fill: strokeColor }} activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">
        {icon}{title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft p-2.5">
      <p className="eyebrow">{label}</p>
      <p className="text-[0.85rem] font-medium text-foreground mt-1 truncate">{value}</p>
    </div>
  );
}

function ChartCard({ label, children, onFullscreen }: { label: string; color: string; children: React.ReactNode; onFullscreen?: () => void }) {
  return (
    <div className="surface-soft p-3 mb-2.5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[0.78rem] text-muted-foreground">{label}</p>
        {onFullscreen && (
          <button onClick={onFullscreen} className="h-6 w-6 rounded-md hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors" title="Full screen">
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ParentAvatar({ parent, label, color }: { parent: ParentInfo; label: string; color: "saffron" | "navy" }) {
  const styles = color === "saffron"
    ? "bg-saffron/10 text-saffron ring-1 ring-saffron/20"
    : "bg-navy/10 text-navy ring-1 ring-navy/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20";
  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-lg ${styles} flex items-center justify-center mx-auto`}>
        <CowIcon size={20} strokeWidth={1.6} />
      </div>
      <p className="text-[0.78rem] mt-1.5 font-medium text-foreground">{parent.name || "—"}</p>
      <p className="eyebrow mt-0.5">{label}</p>
    </div>
  );
}
