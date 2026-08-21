import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Printer, Droplets, Calendar, GitBranch, Heart, Baby, Shield,
  AlertTriangle, Users, Loader2, Flower2, Scale, ChevronRight, ArrowDownRight, Circle, ArrowRight, Maximize2, X, Pencil,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid } from "recharts";
import { useAuth } from "../auth/AuthContext";
import { ReproductionTimeline, ReproductionTimelineData } from "./ReproductionTimeline";
import { WeightChart, WeightTimelineData } from "./WeightChart";

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
  const { isAdminOrManager } = useAuth();
  const tag = tagNumber || "";
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [apiData, setApiData] = useState<CattleCardResponse | null>(null);
  const [timelineData, setTimelineData] = useState<ReproductionTimelineData | null>(null);
  const [weightData, setWeightData] = useState<WeightTimelineData | null>(null);
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
    Promise.all([
      fetch(`${base}/cattle-card/${tag}`).then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); }),
      fetch(`${base}/cattle/${encodeURIComponent(tag)}/reproduction-timeline`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${base}/cattle/${encodeURIComponent(tag)}/weight-timeline`).then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([d, tl, wt]) => { if (!c) { setApiData(d); setTimelineData(tl); setWeightData(wt); setLoading(false); } })
      .catch(e => { if (!c) { setFetchError(e.message); setLoading(false); } });
    return () => { c = true; };
  }, [tag]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-saffron animate-spin" /><span className="ml-3 text-muted-foreground">Loading...</span></div>;
  if (fetchError) return (
    <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center max-w-md"><AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" /><h3 className="text-lg font-bold">Not Found</h3><p className="text-sm text-muted-foreground">{fetchError}</p><button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-saffron text-white rounded-lg text-sm">Go Back</button></div></div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto" id="cattle-profile-print">
      {/* Header with Back + Print */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="flex items-center gap-2 text-xl font-bold"><Flower2 className="w-5 h-5 text-saffron" />{ov?.name || tag}</h1><p className="text-sm text-muted-foreground">{ov?.tag_number} &bull; Gen {ov?.generation || "?"} &bull; {ov?.age || "—"}</p></div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <button onClick={() => navigate(`/admin/edit/${encodeURIComponent(tag)}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-saffron/20 text-saffron text-sm hover:bg-saffron/5 transition-colors no-print"><Pencil className="w-4 h-4" /> Edit</button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-saffron to-saffron-dark text-white text-sm hover:opacity-90"><Printer className="w-4 h-4" /> Print / PDF</button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-saffron/5 to-navy/5 p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-saffron/20 to-navy/20 flex items-center justify-center text-4xl font-bold text-saffron border-4 border-saffron/30 shrink-0">{(ov?.name || "?").charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold">{ov?.name || tag}</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ov?.is_present === 1 ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>{ov?.is_present === 1 ? "Present" : "Not Present"}</span>
                {ov?.lactation_cycle && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs">{ov.lactation_cycle}</span>}
              </div>
              <p className="text-muted-foreground text-sm mt-1">{ov?.tag_number} &bull; {ov?.acquisition_type || "—"} &bull; Born: {formatDate(ov?.DOB ?? null)}</p>
            </div>
            {ov?.physical_score != null && (
              <div className="text-center shrink-0"><div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-saffron to-saffron-dark flex flex-col items-center justify-center shadow-lg"><span className="text-2xl font-bold text-white">{ov.physical_score}</span><span className="text-[0.5rem] text-white/80 uppercase">Score</span></div></div>
            )}
          </div>
        </div>

        {/* All Sections — no tabs */}
        <div className="p-6 space-y-8">
          {/* OVERVIEW */}
          <Section icon={<Flower2 className="w-4 h-4" />} title="Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Tag Number" value={ov?.tag_number || "—"} /><Field label="Generation" value={ov?.generation || "—"} />
              <Field label="Acquisition" value={ov?.acquisition_type === "Not available" ? "—" : (ov?.acquisition_type || "—")} />
              <Field label="Age" value={ov?.age || "—"} /><Field label="Weight at Birth" value={ov?.weight || "—"} />
              <Field label="Lactation" value={ov?.lactation_cycle || "—"} /><Field label="Last Calving" value={formatDate(ov?.last_calving_date ?? null)} />
              {isMilking && ov?.average_milk_per_day != null && <Field label="Avg Milk/Day" value={`${ov.average_milk_per_day} L`} />}
              <Field label="Children" value={String(ov?.total_childrens ?? 0)} /><Field label="Siblings" value={String(ov?.siblings?.length ?? 0)} />
            </div>
          </Section>

          {/* MILK */}
          <Section icon={<Droplets className="w-4 h-4" />} title="Milk Production">
            {!isMilking ? <p className="text-sm text-muted-foreground">Currently not milking.</p> : <>
              {milkWithAvg && milkWithAvg.data.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Monthly (Avg: <span className="text-saffron font-semibold">{milkWithAvg.average} L</span>)</p>
                    <button onClick={() => setFullscreenChart("monthly")} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors" title="Full Screen"><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={milkWithAvg.data}>
                      <defs><linearGradient id="milkG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} /><stop offset="95%" stopColor="#FF9933" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} /><Tooltip />
                      <ReferenceLine y={milkWithAvg.average} stroke="#1B3A6B" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${milkWithAvg.average}L`, position: "insideTopRight", fill: "#1B3A6B", fontSize: 10 }} />
                      <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={2} fill="url(#milkG)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {dailyWithAvg && dailyWithAvg.data.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Daily — Last 30 Days (Avg: <span className="text-navy font-semibold">{dailyWithAvg.average} L</span>)</p>
                    <button onClick={() => setFullscreenChart("daily")} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors" title="Full Screen"><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={dailyWithAvg.data}>
                      <defs><linearGradient id="dailyG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.3} /><stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 8 }} axisLine={false} tickFormatter={v => v?.slice(5, 10) || ""} />
                      <YAxis tick={{ fontSize: 9 }} axisLine={false} /><Tooltip />
                      <ReferenceLine y={dailyWithAvg.average} stroke="#FF9933" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Avg ${dailyWithAvg.average}L`, position: "insideTopRight", fill: "#FF9933", fontSize: 10 }} />
                      <Area type="monotone" dataKey="milk" stroke="#1B3A6B" strokeWidth={1.5} fill="url(#dailyG)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {ov?.average_milk_per_day != null && (
                <div className="bg-saffron/5 rounded-xl p-4 text-center border border-saffron/10"><p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Daily</p><p className="text-2xl font-bold text-saffron">{ov.average_milk_per_day} <span className="text-sm text-muted-foreground">L/day</span></p></div>
              )}
            </>}
          </Section>

          {/* WEIGHT */}
          <Section icon={<Scale className="w-4 h-4" />} title="Weight History">
            {weightData ? (
              <WeightChart data={weightData} />
            ) : (
              <div className="bg-muted/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Weight at birth: <span className="font-medium text-foreground">{ov?.weight || "—"}</span></p>
              </div>
            )}
          </Section>

          {/* FAMILY */}
          <Section icon={<GitBranch className="w-4 h-4" />} title="Family">
            <div className="space-y-4">
              {(isParentObj(ov?.father) || isParentObj(ov?.mother)) && (
                <div className="flex justify-center gap-16">
                  <div className="text-center"><div className="w-16 h-16 rounded-full bg-saffron/20 border-2 border-saffron/40 flex items-center justify-center mx-auto"><span className="text-xl font-bold text-saffron">{isParentObj(ov?.mother) ? (ov!.mother as ParentInfo).name?.[0] || "?" : "?"}</span></div><p className="text-xs mt-1 font-medium">{isParentObj(ov?.mother) ? (ov!.mother as ParentInfo).name || "—" : "—"}</p><p className="text-[0.6rem] text-muted-foreground">Mother</p></div>
                  <div className="text-center"><div className="w-16 h-16 rounded-full bg-navy/10 border-2 border-navy/30 flex items-center justify-center mx-auto"><span className="text-xl font-bold text-navy">{isParentObj(ov?.father) ? (ov!.father as ParentInfo).name?.[0] || "?" : "?"}</span></div><p className="text-xs mt-1 font-medium">{isParentObj(ov?.father) ? (ov!.father as ParentInfo).name || "—" : "—"}</p><p className="text-[0.6rem] text-muted-foreground">Father</p></div>
                </div>
              )}
              {ov?.childrens && ov.childrens.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1.5">Children ({ov.childrens.length})</p><div className="flex flex-wrap gap-2">{ov.childrens.map(c => (
                  <button key={c.tag_number} onClick={() => navigate(`/cattle/${c.tag_number}`)} className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 text-xs"><div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center"><span className="text-[0.5rem] text-saffron font-bold">{c.name?.[0] || "?"}</span></div>{c.name}</button>))}</div></div>
              )}
              {apiData?.family?.siblings && apiData.family.siblings.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1.5">Siblings ({apiData.family.siblings.length})</p><div className="flex flex-wrap gap-2">{apiData.family.siblings.map(s => (
                  <button key={s.tag_number} onClick={() => navigate(`/cattle/${s.tag_number}`)} className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 text-xs"><div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center"><span className="text-[0.5rem] text-saffron font-bold">{s.name?.[0] || "?"}</span></div>{s.name}</button>))}</div></div>
              )}
            </div>
          </Section>

          {/* PREGNANCY LOGS — Timeline */}
          <Section icon={<Heart className="w-4 h-4" />} title="Pregnancy History">
            {pregnancyLogs.length > 0 ? (
              <div className="relative pl-8">
                {/* Vertical timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-saffron/20" />
                {pregnancyLogs.map((pl, idx) => (
                  <div key={pl.id} className="relative mb-4 last:mb-0">
                    {/* Timeline node */}
                    <div className={`absolute -left-[28px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${idx === 0 ? "bg-saffron/10 border-saffron" : "bg-muted border-saffron/30"}`}>
                      <Circle className={`w-2 h-2 ${idx === 0 ? "text-saffron fill-saffron" : "text-saffron/40 fill-saffron/40"}`} />
                    </div>
                    {/* Content */}
                    <div className="bg-white rounded-xl border border-saffron/10 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center"><Baby className="w-4 h-4 text-saffron" /></div>
                        <div>
                          <p className="text-sm font-semibold">Birth #{pregnancyLogs.length - idx}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(pl.birth_date)}</p>
                        </div>
                        {idx === 0 && <span className="ml-auto px-2 py-0.5 rounded bg-saffron/10 text-saffron text-xs font-medium">Latest</span>}
                      </div>

                      {/* Gestation period arrow */}
                      <div className="flex items-center gap-2 mb-2 bg-saffron/5 rounded-lg px-3 py-2">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span className="text-xs text-muted-foreground">Conception: {formatDate(pl.conception_date)}</span>
                        {pl.gestation_period && (
                          <>
                            <ArrowRight className="w-3.5 h-3.5 text-saffron" />
                            <span className="text-xs font-medium text-saffron">{pl.gestation_period} gestation</span>
                          </>
                        )}
                      </div>

                      {/* Calving interval */}
                      {pl.calving_interval && (
                        <div className="flex items-center gap-2 bg-navy/5 rounded-lg px-3 py-2">
                          <ArrowDownRight className="w-3.5 h-3.5 text-navy" />
                          <span className="text-xs font-medium text-navy">Interval from previous: {pl.calving_interval}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No pregnancy records found.</p>}
          </Section>

          {/* REPRODUCTION & FAMILY TIMELINE */}
          {timelineData && (
            <Section icon={<GitBranch className="w-4 h-4" />} title="Reproduction & Family Timeline">
              <ReproductionTimeline data={timelineData} />
            </Section>
          )}

          {/* BREED SCORE */}
          {bs && breedScores.length > 0 && (
            <Section icon={<Shield className="w-4 h-4" />} title="Breed Score">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-64 h-64"><ResponsiveContainer width="100%" height="100%"><RadarChart data={breedScores} outerRadius="75%"><PolarGrid /><PolarAngleAxis dataKey="trait" tick={{ fontSize: 8 }} /><PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} /><Radar name="Score" dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.3} strokeWidth={2} /><Tooltip /></RadarChart></ResponsiveContainer></div>
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-r from-saffron/10 to-navy/10 rounded-xl p-4 text-center mb-3"><p className="text-xs text-muted-foreground uppercase">Average Score</p><p className={`text-2xl font-bold ${totalScore >= 7 ? "text-green-500" : totalScore >= 5 ? "text-yellow-500" : "text-red-500"}`}>{totalScore.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p></div>
                  <div className="space-y-1.5">{breedScores.map(d => (<div key={d.trait} className="flex items-center gap-2"><span className="text-xs w-20 shrink-0">{d.trait}</span><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${d.score >= 7 ? "bg-green-500" : d.score >= 5 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${(d.score / 10) * 100}%` }} /></div><span className={`text-xs font-bold w-6 text-right ${d.score >= 7 ? "text-green-500" : d.score >= 5 ? "text-yellow-500" : "text-red-500"}`}>{d.score}</span></div>))}</div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>

      <div className="no-print text-center pb-4"><button onClick={() => navigate(-1)} className="text-xs text-saffron hover:underline">Back</button></div>

      {/* Fullscreen Chart Modal */}
      {fullscreenChart && (() => {
        const isMonthly = fullscreenChart === "monthly";
        const chartData = isMonthly ? milkWithAvg?.data : dailyWithAvg?.data;
        const chartAvg = isMonthly ? milkWithAvg?.average : dailyWithAvg?.average;
        const title = isMonthly ? "Monthly Milk Production" : "Daily Milk — Last 30 Days";
        const strokeColor = isMonthly ? "#FF9933" : "#1B3A6B";
        const avgColor = isMonthly ? "#1B3A6B" : "#FF9933";
        const gradientId = isMonthly ? "fullMilkG" : "fullDailyG";

        return (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col" onClick={() => setFullscreenChart(null)}>
            <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur shrink-0">
              <h2 className="text-white text-lg font-bold">{ov?.name} — {title}</h2>
              <button onClick={() => setFullscreenChart(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="flex-1 p-6" onClick={e => e.stopPropagation()}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={strokeColor} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} angle={-45} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "13px" }} labelStyle={{ color: "#fff" }} />
                  {chartAvg != null && <ReferenceLine y={chartAvg} stroke={avgColor} strokeDasharray="8 4" strokeWidth={2} label={{ value: `Average ${chartAvg}L`, position: "insideTopRight", fill: avgColor, fontSize: 13, fontWeight: "bold" }} />}
                  <Area type="monotone" dataKey="milk" stroke={strokeColor} strokeWidth={3} fill={`url(#${gradientId})`} dot={{ r: 3, fill: strokeColor }} activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 shrink-0">
              <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: strokeColor }} /><span className="text-white/70 text-sm">Milk Production</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 rounded" style={{ backgroundColor: avgColor, border: "1px dashed" }} /><span className="text-white/70 text-sm">Average ({chartAvg} L)</span></div>
              <div className="text-white/50 text-sm ml-auto">Click anywhere to close</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div><h3 className="flex items-center gap-1.5 text-xs font-semibold text-saffron uppercase tracking-widest mb-3">{icon}{title}</h3>{children}</div>;
}
function Field({ label, value }: { label: string; value: string }) {
  return <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}
