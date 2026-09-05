import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Printer, Droplets, Calendar, GitBranch, Heart, Baby, Shield,
  AlertTriangle, Users, Loader2, Flower2, Scale, ChevronRight, ArrowDownRight, Circle, ArrowRight, X, Pencil, CheckCircle2, XCircle,
} from "lucide-react";
import { ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useAuth } from "../auth/AuthContext";
import { ReproductionTimeline, ReproductionTimelineData } from "./ReproductionTimeline";
import { WeightChart, WeightTimelineData } from "./WeightChart";
import { LifecycleShowcase } from "./LifecycleTimeline";
import { MilkingData } from "./MilkingData";
import { motion, AnimatePresence } from "motion/react";

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
  const [drillData, setDrillData] = useState<any>(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillGender, setDrillGender] = useState<"Male" | "Female" | null>(null);
  const [drillExpanded, setDrillExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const ov = apiData?.overview;
  const bs = ov?.breed_score;
  const breedScores = bs ? getBreedScoreArray(bs) : [];
  const totalScore = breedScores.length ? avg(breedScores.map(s => s.score)) : 0;
  const isMilking = ov?.average_milk_per_day != null && ov.average_milk_per_day > 0;
  const pregnancyLogs = apiData?.pregnancy_logs || [];

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

  useEffect(() => {
    if (!tag) return;
    setDrillLoading(true);
    fetch(`${base}/cattle/${encodeURIComponent(tag)}/maternal-drill`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setDrillData(d))
      .catch(() => setDrillData(null))
      .finally(() => setDrillLoading(false));
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

          {/* MILKING DATA — Single Graph with Daily / Monthly / Yearly */}
          <Section icon={<Droplets className="w-4 h-4" />} title="Milking Data">
            <MilkingData tag={tag} />
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

          {/* LIFECYCLE SHOWCASE - Golden Highlight */}
          <LifecycleShowcase tag={tag} />

          {/* FAMILY */}
          <Section icon={<GitBranch className="w-4 h-4" />} title="Family">
            <div className="space-y-4">
              {(() => {
                const motherTag = isParentObj(ov?.mother) ? (ov!.mother as ParentInfo).tag_number : (ov as any)?.mother_tag_number || null;
                const motherName = isParentObj(ov?.mother) ? (ov!.mother as ParentInfo).name : (typeof ov?.mother === 'string' && ov.mother !== 'Not available' ? ov.mother as string : null);
                const fatherTag = isParentObj(ov?.father) ? (ov!.father as ParentInfo).tag_number : (ov as any)?.father_tag_number || null;
                const fatherName = isParentObj(ov?.father) ? (ov!.father as ParentInfo).name : (typeof ov?.father === 'string' && ov.father !== 'Not available' ? ov.father as string : null);
                const hasMother = !!motherTag || !!motherName;
                const hasFather = !!fatherTag || !!fatherName;
                const isBijadan = fatherTag === "બીજદાન";
                if (!hasMother && !hasFather) return null;
                return (
                  <div className="flex justify-center gap-16">
                    <button
                      onClick={() => motherTag && navigate(`/cattle/${encodeURIComponent(motherTag)}`)}
                      disabled={!motherTag}
                      className={`text-center group ${motherTag ? 'cursor-pointer' : 'cursor-default'}`}
                      title={motherTag ? `View ${motherName || motherTag} profile` : 'Mother not recorded'}
                    >
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${motherTag ? 'bg-saffron/20 border-saffron/40 group-hover:bg-saffron/30 group-hover:scale-105 group-hover:shadow-md' : 'bg-saffron/10 border-saffron/20 opacity-60'}`}><span className="text-xl font-bold text-saffron">{(motherName || motherTag || "?").charAt(0).toUpperCase()}</span></div>
                      <p className={`text-xs mt-1 font-medium ${motherTag ? 'group-hover:text-saffron group-hover:underline' : ''}`}>{motherName || motherTag || "—"}</p>
                      {motherTag && <p className="text-[0.55rem] text-muted-foreground font-mono">#{motherTag}</p>}
                      <p className="text-[0.6rem] text-muted-foreground">Mother</p>
                    </button>
                    <button
                      onClick={() => fatherTag && !isBijadan && navigate(`/cattle/${encodeURIComponent(fatherTag)}`)}
                      disabled={!fatherTag || isBijadan}
                      className={`text-center group ${fatherTag && !isBijadan ? 'cursor-pointer' : fatherTag && isBijadan ? 'cursor-default' : 'cursor-default'}`}
                      title={isBijadan ? `Sperm donation: ${fatherName || "G-008"} (${fatherTag}) — not a registered cattle` : fatherTag ? `View ${fatherName || fatherTag} profile` : 'Father not recorded'}
                    >
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${fatherTag && !isBijadan ? 'bg-navy/10 border-navy/30 group-hover:bg-navy/20 group-hover:scale-105 group-hover:shadow-md' : fatherTag && isBijadan ? 'bg-amber-50 border-amber-300' : 'bg-slate-100 border-slate-200 opacity-60'}`}><span className={`text-xl font-bold ${fatherTag && !isBijadan ? 'text-navy' : fatherTag && isBijadan ? 'text-amber-600' : 'text-slate-400'}`}>{(fatherName || fatherTag || "?").charAt(0).toUpperCase()}</span></div>
                      <p className={`text-xs mt-1 font-medium ${fatherTag && !isBijadan ? 'group-hover:text-navy group-hover:underline' : ''}`}>{fatherName || fatherTag || "—"}</p>
                      {fatherTag ? <p className="text-[0.55rem] text-muted-foreground font-mono">#{fatherTag}</p> : <p className="text-[0.55rem] text-muted-foreground">—</p>}
                      {isBijadan && <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[0.55rem] font-medium border border-amber-200">Sperm Donation</span>}
                      <p className="text-[0.6rem] text-muted-foreground">Father</p>
                    </button>
                  </div>
                );
              })()}
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

          {/* MATERNAL & PATERNAL DRILL — New Section */}
          <Section icon={<Users className="w-4 h-4" />} title="Maternal & Paternal Drill">
            {drillLoading ? (
              <div className="space-y-3"><div className="h-24 bg-muted/20 rounded-xl animate-pulse border" /><div className="h-32 bg-muted/20 rounded-xl animate-pulse border" /></div>
            ) : !drillData ? (
              <p className="text-sm text-muted-foreground">No drill data available.</p>
            ) : (
              <div className="space-y-6">
                {/* Gender filter for this section */}
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-pink-50/50 border border-saffron/10">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Gender</span>
                  <button onClick={() => setDrillGender(g => g === "Male" ? null : "Male")} className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${drillGender === "Male" ? "bg-blue-500 text-white border-blue-500" : "bg-white border-saffron/20"}`}>♂ Male</button>
                  <button onClick={() => setDrillGender(g => g === "Female" ? null : "Female")} className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${drillGender === "Female" ? "bg-pink-500 text-white border-pink-500" : "bg-white border-saffron/20"}`}>♀ Female</button>
                  {drillGender && <button onClick={() => setDrillGender(null)} className="ml-auto text-xs text-saffron flex items-center gap-1">Clear <X className="w-3 h-3" /></button>}
                </div>

                {(() => {
                  const f = (arr: any[]) => drillGender ? arr.filter((r:any) => r.gender && r.gender.toLowerCase() === drillGender.toLowerCase()) : arr;
                  const isMale = drillData.cattle?.gender && String(drillData.cattle.gender).toLowerCase() === "male";
                  const sections: { title: string; icon: any; records: any[]; subtitle: string }[] = [
                    { title: `Selected Cattle — ${drillData.cattle?.name || tag} ${drillData.cattle?.gender ? `(${drillData.cattle.gender})` : ""}`, icon: <Heart className="w-4 h-4" />, records: drillData.cattle ? [drillData.cattle] : [], subtitle: `${drillData.cattle?.tag_number || tag} • ${drillData.cattle?.date_of_birth || "—"}` },
                    { title: "Mother", icon: <Heart className="w-4 h-4" />, records: drillData.mother ? [drillData.mother] : [], subtitle: drillData.mother ? `${drillData.mother.name} (${drillData.mother.tag_number})` : "No mother" },
                    { title: "Father", icon: <GitBranch className="w-4 h-4" />, records: (drillData as any).father ? [(drillData as any).father] : [], subtitle: (drillData as any).father ? `${(drillData as any).father.name} (${(drillData as any).father.tag_number})` : "No father (e.g. બીજદાન)" },
                    { title: `${drillGender === "Male" ? "Brothers" : drillGender === "Female" ? "Sisters" : "Siblings"} — ${f(drillData.sisters).length} found`, icon: <Users className="w-4 h-4" />, records: f(drillData.sisters), subtitle: `Same mother • ${drillGender || "All"}` },
                    { title: `${drillGender === "Male" ? "Maternal Uncles" : drillGender === "Female" ? "Maternal Aunts" : "Maternal Aunts/Uncles"} — ${f(drillData.maternal_aunts).length} found`, icon: <Baby className="w-4 h-4" />, records: f(drillData.maternal_aunts), subtitle: drillData.maternal_grandmother ? `Grandmother ${drillData.maternal_grandmother.name} (${drillData.maternal_grandmother.tag_number})` : "No grandmother" },
                    { title: `Children of ${tag} — ${isMale ? "via Father" : "via Mother"} — ${f((drillData as any).children || []).length} found`, icon: <Baby className="w-4 h-4" />, records: f((drillData as any).children || []), subtitle: isMale ? `Offspring where father = ${tag}` : `Offspring where mother = ${tag}` },
                  ];
                  return sections.map(sec => (
                    <div key={sec.title} className="bg-white rounded-xl border border-saffron/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-saffron/10 flex items-center justify-center">{sec.icon}</div>
                        <div><h4 className="text-sm font-bold">{sec.title}</h4><p className="text-xs text-muted-foreground">{sec.subtitle}</p></div>
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-muted border">{sec.records.length}</span>
                      </div>
                      {sec.records.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-xl">No records</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-saffron/10">
                          <table className="w-full text-xs">
                            <thead><tr className="bg-muted/40 border-b">
                              <th className="px-3 py-2 text-left font-semibold">Name</th><th className="px-3 py-2 text-left font-semibold">Tag</th><th className="px-3 py-2 text-center font-semibold">Present</th><th className="px-3 py-2 text-left font-semibold">Gender</th><th className="px-3 py-2 text-left font-semibold">DOB</th><th className="px-3 py-2 text-left font-semibold">Physical Mark</th><th className="px-3 py-2 text-left font-semibold">Total</th><th className="px-3 py-2 text-left font-semibold">Avg Milk</th>
                            </tr></thead>
                            <tbody>
                              {sec.records.map((r:any) => {
                                const isExp = drillExpanded === `${sec.title}-${r.tag_number}`;
                                const total = r.physical_total;
                                return (
                                  <>
                                    <tr key={r.tag_number} className="border-b hover:bg-muted/20 group">
                                      <td className="px-3 py-2 font-medium"><button onClick={() => navigate(`/cattle/${encodeURIComponent(r.tag_number)}`)} className="text-left hover:text-saffron hover:underline font-medium transition-colors" title={`View ${r.name || r.tag_number} profile`}>{r.name || "—"}</button></td>
                                      <td className="px-3 py-2 font-mono text-xs"><button onClick={() => navigate(`/cattle/${encodeURIComponent(r.tag_number)}`)} className="font-mono hover:text-saffron hover:underline transition-colors" title={`View ${r.tag_number} profile`}>{r.tag_number}</button></td>
                                      <td className="px-3 py-2 text-center">{r.is_present === 1 ? <span title="Present" className="inline-flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-600" /></span> : r.is_present === 0 ? <span title="Not Present" className="inline-flex items-center justify-center"><XCircle className="w-4 h-4 text-red-500" /></span> : <span className="text-muted-foreground text-[0.65rem]">—</span>}</td>
                                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[0.65rem] border ${r.gender?.toLowerCase()==="male"?"bg-blue-100 text-blue-700 border-blue-200":"bg-pink-100 text-pink-700 border-pink-200"}`}>{r.gender || "—"}</span></td>
                                      <td className="px-3 py-2 text-xs">{r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</td>
                                      <td className="px-3 py-2"><button onClick={(e)=> {e.stopPropagation(); setDrillExpanded(isExp ? null : `${sec.title}-${r.tag_number}`)}} className={`px-2 py-1 rounded-full border text-[0.65rem] ${isExp?"bg-saffron text-white border-saffron":"bg-white text-saffron border-saffron/20"}`}>View {isExp?"Hide":"Logs"}</button></td>
                                      <td className="px-3 py-2 font-bold">{total!=null?total.toFixed(1):"—"}</td>
                                      <td className="px-3 py-2">{r.average_milk!=null?`${r.average_milk} L`:"—"}</td>
                                    </tr>
                                    {isExp && (
                                      <tr><td colSpan={8} className="p-0">
                                        <div className="p-3 bg-muted/10">
                                          {!r.physical_mark ? <p className="text-xs text-muted-foreground text-center py-2">No physical records</p> : (
                                            <div className="overflow-x-auto rounded border bg-white">
                                              <table className="w-full text-[0.65rem]">
                                                <thead><tr className="bg-muted/40">
                                                  {["Hip Width","Head","Ear","Eye","Muzzle","Horn","Skin","Tail","Hump","Udder","Teat","Dewlap","Milk Vein","Total"].map(h=> <th key={h} className="px-2 py-1.5 text-left whitespace-nowrap">{h}</th>)}
                                                </tr></thead>
                                                <tbody><tr>
                                                  {["hip_width","head","ear","eye","muzzle","horn","skin","tail","hump","udder","teat","dewlap","milk_vein"].map(k=> <td key={k} className="px-2 py-1.5">{(r.physical_mark as any)?.[k] ?? "—"}</td>)}
                                                  <td className="px-2 py-1.5 font-bold">{total!=null?total.toFixed(1):"—"}</td>
                                                </tr></tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </td></tr>
                                    )}
                                  </>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            )}
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
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div><h3 className="flex items-center gap-1.5 text-xs font-semibold text-saffron uppercase tracking-widest mb-3">{icon}{title}</h3>{children}</div>;
}
function Field({ label, value }: { label: string; value: string }) {
  return <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}
