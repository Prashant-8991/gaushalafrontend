import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Droplets, Calendar, GitBranch, Heart, Baby, Shield,
  ChevronDown, ChevronUp, AlertTriangle, Users, Loader2, ArrowLeft, ArrowRight,
  Flower2, Scale, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from "recharts";
import { useCardTheme } from "./CardThemeContext";
import { cardThemeTokens } from "./cardThemeTokens";

/* ─── API Response Types ─── */

interface SiblingInfo {
  name: string | null;
  tag_number: string | null;
  generation: number | null;
}

interface ParentInfo {
  name: string | null;
  tag_number: string | null;
  generation: number | null;
}

interface BreedScore {
  hip_width: string;
  head: string;
  ear: string;
  eye: string;
  muzzle: string;
  horn: string;
  skin: string;
  tail: string;
  hump: string;
  udder: string;
  teat: string;
  dewlap: string;
  milk_vein: string;
}

interface CattleCardOverview {
  name: string | null;
  tag_number: string | null;
  physical_score: number | null;
  average_physical_score: number | null;
  acquisition_type: string | null;
  generation: string | null;
  DOB: string | null;
  total_childrens: number | null;
  siblings: SiblingInfo[];
  is_present: number | null;
  lactation_cycle: string | null;
  last_calving_date: string | null;
  mother: ParentInfo | string | null;
  father: ParentInfo | string | null;
  childrens: SiblingInfo[];
  breed_score: BreedScore | null;
  weight: string | null;
  age: string | null;
  average_milk_per_day: number | null;
}

interface MilkRecord {
  date: string | null;
  milk: number | null;
}

interface FamilyInfo {
  mother: ParentInfo | null;
  father: ParentInfo | null;
  siblings: SiblingInfo[];
  childrens: SiblingInfo[];
}

interface CattleCardResponse {
  overview: CattleCardOverview | null;
  milk_by_month: MilkRecord[];
  milk_by_day_only_for_month: MilkRecord[];
  family: FamilyInfo | null;
}

/* ─── Helpers ─── */

const BREED_TRAITS = [
  { key: "head", label: "Head" },
  { key: "ear", label: "Ear" },
  { key: "eye", label: "Eye" },
  { key: "muzzle", label: "Muzzle" },
  { key: "horn", label: "Horn" },
  { key: "skin", label: "Skin" },
  { key: "tail", label: "Tail" },
  { key: "hump", label: "Hump" },
  { key: "udder", label: "Udder" },
  { key: "teat", label: "Teat" },
  { key: "dewlap", label: "Dewlap" },
  { key: "milk_vein", label: "Milk Vein" },
] as const;

function getBreedScoreArray(bs: BreedScore): { trait: string; score: number }[] {
  return BREED_TRAITS.map(t => ({
    trait: t.label,
    score: Math.min(10, Math.max(0, parseFloat((bs as any)[t.key]) || 0)),
  }));
}

function isParentObj(val: any): val is ParentInfo {
  return val && typeof val === "object" && "tag_number" in val;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr || dateStr === "Not available") return dateStr || "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* ─── Component ─── */

interface CowCardProps {
  cow?: { tagNumber?: string; tag_number?: string };
  onClose: () => void;
  onSelectCow?: (cow: any) => void;
}

export function CowCard({ cow, onClose, onSelectCow }: CowCardProps) {
  const initialTag = cow?.tagNumber ?? (cow as any)?.tag_number ?? "";
  const [currentTag, setCurrentTag] = useState(initialTag);
  const [activeTab, setActiveTab] = useState<"overview" | "milk" | "weight" | "family" | "breed">("overview");
  const { cardTheme } = useCardTheme();
  const isDark = cardTheme === "dark";
  const T = cardThemeTokens(isDark);

  const [apiData, setApiData] = useState<CattleCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const ov = apiData?.overview;
  const bs = ov?.breed_score;
  const breedScores = bs ? getBreedScoreArray(bs) : [];
  const totalScore = breedScores.length ? avg(breedScores.map(s => s.score)) : 0;
  const isMilking = ov?.average_milk_per_day != null && ov.average_milk_per_day > 0;

  useEffect(() => {
    if (!currentTag) {
      setLoading(false);
      setFetchError("No tag number available");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setApiData(null);

    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${base}/cattle-card/${currentTag}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "Cattle not found" : `API error ${r.status}`);
        return r.json();
      })
      .then((data: CattleCardResponse) => {
        if (!cancelled) { setApiData(data); setLoading(false); }
      })
      .catch(err => {
        if (!cancelled) { setFetchError(err.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [currentTag]);

  const navigateTo = (tag: string | null | undefined) => {
    if (!tag) return;
    setHistory(prev => [...prev, currentTag]);
    setCurrentTag(tag);
    setActiveTab("overview");
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentTag(prev);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}>
        <div className="flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
          <Loader2 className="w-10 h-10 text-saffron animate-spin" />
          <p className="text-white/70 text-sm">Loading cattle data...</p>
        </div>
      </motion.div>
    );
  }

  /* ─── Error ─── */
  if (fetchError && !apiData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}>
        <div className="bg-white dark:bg-navy rounded-2xl p-6 max-w-md w-full text-center space-y-3" onClick={e => e.stopPropagation()}>
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Data Not Available</h3>
          <p className="text-sm text-muted-foreground">{fetchError}</p>
          <p className="text-xs text-muted-foreground/60">Tag: {currentTag}</p>
          {history.length > 0 && (
            <button onClick={goBack} className="px-4 py-2 bg-saffron text-white rounded-lg text-sm hover:bg-saffron-dark transition-colors">
              Go Back
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  /* ─── Render helpers ─── */

  const renderParent = (label: string, parent: ParentInfo | string | null) => {
    const color = label === "Mother" ? "border-saffron/40" : "border-cyan-400/40";
    if (isParentObj(parent)) {
      return (
        <div className="text-center">
          <button onClick={() => navigateTo(parent.tag_number)}
            className={`w-14 h-14 rounded-full bg-white border ${color} flex items-center justify-center mx-auto shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer`}>
            <span className="text-sm font-bold text-saffron">{parent.name?.[0] || "?"}</span>
          </button>
          <p className="text-[0.55rem] font-medium text-foreground/70 mt-1">{parent.name}</p>
          <p className="text-[0.5rem] text-muted-foreground">Gen {parent.generation ?? "?"}</p>
        </div>
      );
    }
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-muted/50 border border-dashed border-gray-400 flex items-center justify-center mx-auto">
          <span className="text-xs text-muted-foreground">?</span>
        </div>
        <p className="text-[0.55rem] text-muted-foreground mt-1">{parent === "Not available" ? "—" : label}</p>
      </div>
    );
  };

  const renderSiblingList = (items: SiblingInfo[], emptyMsg: string) => {
    if (!items.length) return <p className="text-[0.7rem] text-muted-foreground">{emptyMsg}</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map(s => (
          <button key={s.tag_number} onClick={() => navigateTo(s.tag_number)}
            className="flex items-center gap-1.5 bg-white/60 dark:bg-navy/60 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 hover:shadow-sm transition-all cursor-pointer">
            <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
              <span className="text-[0.5rem] text-saffron font-bold">{s.name?.[0] || "?"}</span>
            </div>
            <span className="text-[0.7rem] text-foreground/70">{s.name}</span>
            <span className="text-[0.55rem] text-muted-foreground">G{s.generation ?? "?"}</span>
          </button>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "milk", label: "Milk" },
    { key: "weight", label: "Weight" },
    { key: "family", label: "Family" },
    { key: "breed", label: "Breed Score" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ delay: 0.15 }}
          onClick={onClose}
          className="absolute -top-3 -right-3 z-[60] w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg shadow-black/20 flex items-center justify-center transition-colors border border-saffron/20 backdrop-blur"
        >
          <X className="w-4 h-4 text-foreground/70" />
        </motion.button>

        <motion.div
          initial={{ scale: 0.85, rotateY: -8, rotateX: 3 }}
          animate={{ scale: 1, rotateY: 0, rotateX: 0 }}
          exit={{ scale: 0.85, rotateY: 8, rotateX: -3 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >
          {/* ─── Hero Header ─── */}
          <div className={`relative bg-gradient-to-br ${T.heroBg} p-5 pb-3 shrink-0`}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-saffron/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-saffron-light/8 blur-3xl" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.05),transparent_50%)]" />

            <div className="flex items-start gap-4 relative z-[1]">
              {/* Score Badge */}
              <div className="flex flex-col items-center shrink-0">
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-20 bg-gradient-to-b from-saffron to-saffron-dark rounded-xl flex flex-col items-center justify-center shadow-lg shadow-saffron/30"
                >
                  <span className="text-[1.8rem] font-800 text-white leading-none">
                    {ov?.physical_score != null ? ov.physical_score : totalScore.toFixed(1)}
                  </span>
                  <span className="text-[0.5rem] text-white/80 uppercase tracking-widest">Score</span>
                </motion.div>
                <div className="mt-1.5 px-2 py-0.5 rounded bg-saffron/10 border border-saffron/20">
                  <span className="text-[0.55rem] font-600 text-saffron uppercase tracking-widest">Gir</span>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex-1 flex justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="relative"
                >
                  <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-saffron/50 shadow-2xl shadow-saffron/20 ring-2 ${isDark ? "ring-white/10 ring-offset-navy" : "ring-saffron/10 ring-offset-white"} ring-offset-2 flex items-center justify-center bg-gradient-to-br from-saffron/20 to-navy/20`}>
                    <span className="text-4xl lg:text-5xl font-bold text-saffron">{ov?.name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-saffron/80 flex items-center justify-center">
                    <span className="text-sm text-white">{"♀"}</span>
                  </div>
                </motion.div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatPill icon={<Heart className="w-3 h-3" />} value={ov?.is_present === 1 ? "Present" : "Not Present"} T={T} />
                {ov?.age && <StatPill icon={<Calendar className="w-3 h-3" />} value={ov.age} T={T} />}
                {isMilking && ov?.average_milk_per_day != null && (
                  <StatPill icon={<Droplets className="w-3 h-3" />} value={`${ov.average_milk_per_day}L/d`} T={T} />
                )}
              </div>
            </div>

            {/* Name & Tag */}
            <div className="text-center mt-3 relative z-[1]">
              <div className="flex items-center justify-center gap-2">
                {history.length > 0 && (
                  <button onClick={goBack} className="p-1 rounded-full hover:bg-white/10 transition-colors" title="Go back">
                    <ArrowLeft className="w-4 h-4 text-white/70" />
                  </button>
                )}
                <h2 className="text-[1.4rem] font-700 text-black">{ov?.name ?? currentTag}</h2>
              </div>
              <p className="text-[0.7rem] text-saffron tracking-widest uppercase">
                {ov?.tag_number ?? currentTag} &bull; Gen {ov?.generation ?? "?"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-5 mt-3 pb-2 border-b border-white/10 relative z-[1]">
              <QStat label="DOB" value={formatDate(ov?.DOB ?? null)} T={T} />
              <QStat label="Children" value={String(ov?.total_childrens ?? 0)} T={T} />
              <QStat label="Siblings" value={String(ov?.siblings?.length ?? 0)} T={T} />
              <QStat label="Acquisition" value={ov?.acquisition_type === "Not available" ? "—" : (ov?.acquisition_type ?? "—")} T={T} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-2 relative z-[1]">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-t-lg transition-all text-[0.75rem] ${activeTab === t.key ? T.tabActive : T.tabInactive}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Tab Content ─── */}
          <div
            className={`flex-1 overflow-y-auto bg-gradient-to-b ${T.contentBg} p-5 space-y-4`}
            style={{ scrollbarWidth: "thin", scrollbarColor: isDark ? "rgba(255,153,51,0.25) rgba(255,255,255,0.05)" : "rgba(255,107,0,0.2) rgba(0,0,0,0.03)" }}
          >
            {/* ═══ OVERVIEW ═══ */}
            {activeTab === "overview" && (
              <>
                {/* Key Info Grid */}
                <Section title="About" icon={<Flower2 className="w-4 h-4" />} T={T}>
                  <div className="grid grid-cols-2 gap-2">
                    <InfoCard label="Tag Number" value={ov?.tag_number ?? "—"} T={T} />
                    <InfoCard label="Generation" value={ov?.generation ?? "—"} T={T} />
                    <InfoCard label="Acquisition" value={ov?.acquisition_type === "Not available" ? "Not available" : (ov?.acquisition_type ?? "Not available")} T={T} />
                    <InfoCard label="Present" value={ov?.is_present === 1 ? "Yes" : "No"} T={T} />
                    <InfoCard label="Age" value={ov?.age ?? "Not available"} T={T} />
                    <InfoCard label="Weight" value={ov?.weight ?? "Not available"} T={T} />
                    <InfoCard label="Lactation" value={ov?.lactation_cycle ?? "Not available"} T={T} />
                    <InfoCard label="Last Calving" value={formatDate(ov?.last_calving_date ?? null)} T={T} />
                    {isMilking && ov?.average_milk_per_day != null && (
                      <InfoCard label="Avg Milk/Day" value={`${ov.average_milk_per_day} L`} T={T} />
                    )}
                  </div>
                </Section>

                {/* Physical Scores Summary */}
                {ov?.physical_score != null && (
                  <Section title="Physical Score" icon={<Shield className="w-4 h-4" />} T={T}>
                    <div className="flex items-center gap-4">
                      {/* <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">{ov.physical_score}</span>
                        </div>
                        <p className="text-[0.6rem] text-muted-foreground mt-1">This cattle</p>
                      </div> */}
                      {ov.average_physical_score != null && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">{ov.average_physical_score}</span>
                          </div>
                          <p className="text-[0.6rem] text-muted-foreground mt-1">Herd avg</p>
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* Parents */}
                <Section title="Parents" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className="flex justify-center gap-12">
                    <div className="flex flex-col items-center">
                      <p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-1.5">Mother</p>
                      {isParentObj(ov?.mother) ? (
                        <button onClick={() => navigateTo((ov!.mother as ParentInfo).tag_number)}
                          className="flex flex-col items-center cursor-pointer group">
                          <div className="w-14 h-14 rounded-full bg-white border-2 border-saffron/40 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                            <span className="text-sm font-bold text-saffron">{(ov!.mother as ParentInfo).name?.[0] || "?"}</span>
                          </div>
                          <p className="text-[0.6rem] font-medium text-foreground/70 mt-1">{(ov!.mother as ParentInfo).name}</p>
                          <p className="text-[0.5rem] text-muted-foreground">Gen {(ov!.mother as ParentInfo).generation ?? "?"}</p>
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted/50 border border-dashed border-gray-400 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">?</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-1.5">Father</p>
                      {isParentObj(ov?.father) ? (
                        <button onClick={() => navigateTo((ov!.father as ParentInfo).tag_number)}
                          className="flex flex-col items-center cursor-pointer group">
                          <div className="w-14 h-14 rounded-full bg-white border-2 border-cyan-400/40 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                            <span className="text-sm font-bold text-navy">{(ov!.father as ParentInfo).name?.[0] || "?"}</span>
                          </div>
                          <p className="text-[0.6rem] font-medium text-foreground/70 mt-1">{(ov!.father as ParentInfo).name}</p>
                          <p className="text-[0.5rem] text-muted-foreground">Gen {(ov!.father as ParentInfo).generation ?? "?"}</p>
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted/50 border border-dashed border-gray-400 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>

                {/* Children */}
                {ov?.childrens && ov.childrens.length > 0 && (
                  <Section title={`Children (${ov.childrens.length})`} icon={<Baby className="w-4 h-4" />} T={T}>
                    <div className="flex flex-wrap gap-2">
                      {ov.childrens.slice(0, 12).map(c => (
                        <button key={c.tag_number} onClick={() => navigateTo(c.tag_number)}
                          className="flex items-center gap-1.5 bg-white/60 dark:bg-navy/60 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 hover:shadow-sm transition-all cursor-pointer">
                          <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
                            <span className="text-[0.5rem] text-saffron font-bold">{c.name?.[0] || "?"}</span>
                          </div>
                          <span className="text-[0.7rem] text-foreground/70">{c.name}</span>
                          <span className="text-[0.55rem] text-muted-foreground">G{c.generation ?? "?"}</span>
                        </button>
                      ))}
                      {ov.childrens.length > 12 && (
                        <span className="text-[0.7rem] text-muted-foreground self-center">+{ov.childrens.length - 12} more</span>
                      )}
                    </div>
                  </Section>
                )}

                {/* Siblings */}
                {ov?.siblings && ov.siblings.length > 0 && (
                  <Section title={`Siblings (${ov.siblings.length})`} icon={<Users className="w-4 h-4" />} T={T}>
                    <div className="flex flex-wrap gap-2">
                      {ov.siblings.slice(0, 8).map(s => (
                        <button key={s.tag_number} onClick={() => navigateTo(s.tag_number)}
                          className="flex items-center gap-1.5 bg-white/60 dark:bg-navy/60 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 hover:shadow-sm transition-all cursor-pointer">
                          <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
                            <span className="text-[0.5rem] text-saffron font-bold">{s.name?.[0] || "?"}</span>
                          </div>
                          <span className="text-[0.7rem] text-foreground/70">{s.name}</span>
                          <span className="text-[0.55rem] text-muted-foreground">G{s.generation ?? "?"}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* ═══ MILK ═══ */}
            {activeTab === "milk" && (
              <>
                {!isMilking ? (
                  <Note T={T}>This cattle is currently not milking — milk data not available</Note>
                ) : (
                  <>
                    {/* Monthly Chart */}
                    {apiData?.milk_by_month && apiData.milk_by_month.length > 0 && (
                      <Section title="Monthly Milk Production" icon={<Droplets className="w-4 h-4" />} T={T}>
                        <div className={`${T.softBg} rounded-xl p-3`}>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={apiData.milk_by_month}>
                              <defs>
                                <linearGradient id="milkArea" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" tick={{ fontSize: 9, fill: T.axisFill, angle: -45 }} axisLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: T.axisFill }} axisLine={false} />
                              <Tooltip contentStyle={T.tooltipStyle} />
                              <Area type="monotone" dataKey="milk" stroke="#FF9933" strokeWidth={2} fill="url(#milkArea)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Section>
                    )}

                    {/* Daily Chart (last 30 days) */}
                    {apiData?.milk_by_day_only_for_month && apiData.milk_by_day_only_for_month.length > 0 && (
                      <Section title="Daily Milk (Last 30 Days)" icon={<Activity className="w-4 h-4" />} T={T}>
                        <div className={`${T.softBg} rounded-xl p-3`}>
                          <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={apiData.milk_by_day_only_for_month}>
                              <defs>
                                <linearGradient id="dailyArea" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" tick={{ fontSize: 8, fill: T.axisFill }} axisLine={false} tickFormatter={v => v?.slice(5, 10) || ""} />
                              <YAxis tick={{ fontSize: 9, fill: T.axisFill }} axisLine={false} />
                              <Tooltip contentStyle={T.tooltipStyle} />
                              <Area type="monotone" dataKey="milk" stroke="#1B3A6B" strokeWidth={1.5} fill="url(#dailyArea)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Section>
                    )}

                    {/* Avg daily */}
                    {ov?.average_milk_per_day != null && (
                      <div className={`${T.softBg} rounded-xl p-3 text-center`}>
                        <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Average Daily Milk</p>
                        <p className="text-2xl font-bold text-saffron">{ov.average_milk_per_day} <span className="text-sm text-muted-foreground">L/day</span></p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ═══ WEIGHT ═══ */}
            {activeTab === "weight" && (
              <div className="space-y-3">
                <Section title="Weight Information" icon={<Scale className="w-4 h-4" />} T={T}>
                  <InfoCard label="Weight at Birth" value={ov?.weight ?? "Not available"} T={T} />
                </Section>
                <Note T={T}>Only birth weight is recorded. Regular weight tracking is not available in the database.</Note>
              </div>
            )}

            {/* ═══ FAMILY ═══ */}
            {activeTab === "family" && (
              <div className="space-y-4">
                {/* Tree Visualization */}
                <Section title="Family Tree" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className={`${T.softBg} rounded-xl p-4`}>
                    {/* Grandparents row - if available from parents' parents */}
                    <div className="flex justify-center gap-12 mb-2">
                      {isParentObj(ov?.mother) && renderParent("Mother", ov!.mother)}
                      {isParentObj(ov?.father) && renderParent("Father", ov!.father)}
                    </div>

                    {/* Connector */}
                    <div className="flex justify-center"><div className="w-0.5 h-4 bg-saffron/30" /></div>

                    {/* Current Cow */}
                    <div className="flex justify-center mb-3">
                      <div className="bg-saffron/10 border-2 border-saffron/40 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron/20 to-navy/20 flex items-center justify-center border-2 border-saffron">
                          <span className="text-sm font-bold text-saffron">{ov?.name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                        <div>
                          <p className="text-[0.8rem] font-600 text-saffron">{ov?.name}</p>
                          <p className="text-[0.55rem] text-muted-foreground">{ov?.tag_number} &bull; Current</p>
                        </div>
                      </div>
                    </div>

                    {/* Children */}
                    {apiData?.family?.childrens && apiData.family.childrens.length > 0 && (
                      <>
                        <div className="flex justify-center mb-1"><div className="w-0.5 h-4 bg-saffron/30" /></div>
                        <div className="flex justify-center gap-3 flex-wrap">
                          {apiData.family.childrens.map(c => (
                            <button key={c.tag_number} onClick={() => navigateTo(c.tag_number)}
                              className="flex flex-col items-center cursor-pointer group">
                              <div className="w-10 h-10 rounded-full bg-saffron/20 border border-saffron/30 flex items-center justify-center group-hover:bg-saffron/30 transition-colors">
                                <span className="text-[0.6rem] font-600 text-saffron">{c.name?.[0] || "?"}</span>
                              </div>
                              <span className="text-[0.55rem] font-medium text-foreground/70 mt-0.5">{c.name}</span>
                              <span className="text-[0.45rem] text-muted-foreground">Child</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Section>

                {/* Siblings */}
                {apiData?.family?.siblings && apiData.family.siblings.length > 0 && (
                  <Section title={`Siblings (${apiData.family.siblings.length})`} icon={<Users className="w-4 h-4" />} T={T}>
                    <div className="flex flex-wrap gap-2">
                      {apiData.family.siblings.map(s => (
                        <button key={s.tag_number} onClick={() => navigateTo(s.tag_number)}
                          className="flex items-center gap-1.5 bg-white/60 dark:bg-navy/60 rounded-lg px-2.5 py-1.5 border border-saffron/10 hover:border-saffron/30 transition-all cursor-pointer">
                          <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
                            <span className="text-[0.5rem] text-saffron font-bold">{s.name?.[0] || "?"}</span>
                          </div>
                          <span className="text-[0.7rem] text-foreground/70">{s.name}</span>
                          <span className="text-[0.55rem] text-muted-foreground">G{s.generation ?? "?"}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}

                {(!apiData?.family?.siblings || apiData.family.siblings.length === 0) &&
                 (!apiData?.family?.childrens || apiData.family.childrens.length === 0) &&
                 !isParentObj(ov?.mother) && !isParentObj(ov?.father) && (
                  <Note T={T}>No family data available</Note>
                )}
              </div>
            )}

            {/* ═══ BREED SCORE ═══ */}
            {activeTab === "breed" && (
              <>
                {bs && breedScores.length > 0 ? (
                  <>
                    <Section title="Physical Conformation" icon={<Shield className="w-4 h-4" />} T={T}>
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-48 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={breedScores} outerRadius="75%">
                              <PolarGrid stroke={T.gridStroke} />
                              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 7, fill: isDark ? "#ffffff60" : "#6B5A4E" }} />
                              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 8, fill: isDark ? "#ffffff30" : "#6B5A4E80" }} />
                              <Radar name="Score" dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.3} strokeWidth={2} />
                              <Tooltip contentStyle={T.tooltipStyle} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-saffron/10 to-navy/10 rounded-xl p-3 mb-3 text-center">
                        <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Average Score</p>
                        <p className={`text-2xl font-800 ${totalScore >= 7 ? "text-green-400" : totalScore >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                          {totalScore.toFixed(1)}<span className="text-[0.9rem] text-muted-foreground">/10</span>
                        </p>
                      </div>
                    </Section>

                    <Section title="Trait Breakdown" icon={<Shield className="w-4 h-4" />} T={T}>
                      <div className="space-y-2">
                        {breedScores.map(d => (
                          <div key={d.trait} className={`${T.softBg} rounded-lg p-2.5`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[0.75rem] font-medium text-foreground/80">{d.trait}</span>
                              <span className={`text-[0.75rem] font-700 ${d.score >= 7 ? "text-green-400" : d.score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                                {d.score}
                              </span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full ${T.progressBg} overflow-hidden`}>
                              <div className={`h-full rounded-full transition-all ${d.score >= 7 ? "bg-green-400" : d.score >= 5 ? "bg-yellow-400" : "bg-red-400"}`}
                                style={{ width: `${(d.score / 10) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>

                    {/* Hip width display */}
                    {bs.hip_width && bs.hip_width !== "0" && (
                      <InfoCard label="Hip Width" value={bs.hip_width} T={T} />
                    )}
                  </>
                ) : (
                  <Note T={T}>Breed score data not available for this cattle</Note>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Sub-components ─── */

type TTokens = ReturnType<typeof cardThemeTokens>;

function StatPill({ icon, value, T }: { icon: React.ReactNode; value: string; T: TTokens }) {
  return (
    <div className={`flex items-center gap-1 ${T.medBg} rounded-lg px-2 py-1`}>
      <span className={T.accent}>{icon}</span>
      <span className="text-[0.65rem] font-medium text-foreground/80">{value}</span>
    </div>
  );
}

function QStat({ label, value, T }: { label: string; value: string; T: TTokens }) {
  return (
    <div className="text-center">
      <p className="text-[0.55rem] text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-[0.78rem] font-medium dark:text-white text-black">{value}</p>
    </div>
  );
}

function Section({ title, icon, children, T }: { title: string; icon: React.ReactNode; children: React.ReactNode; T: TTokens }) {
  return (
    <div>
      <h4 className="text-[0.7rem] font-600 text-saffron uppercase tracking-widest mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function InfoCard({ label, value, T }: { label: string; value: string; T: TTokens }) {
  return (
    <div className={`${T.softBg} rounded-lg p-2.5`}>
      <p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[0.8rem] font-medium text-foreground/80">{value}</p>
    </div>
  );
}

function Note({ children, T }: { children: React.ReactNode; T: TTokens }) {
  return (
    <div className={`${T.softBg} rounded-xl p-3 text-center`}>
      <p className="text-[0.75rem] text-muted-foreground">{children}</p>
    </div>
  );
}
