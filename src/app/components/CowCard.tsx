import { useState, useEffect } from "react";
import { X, Droplets, Calendar, GitBranch, Heart, Baby, Shield, ChevronDown, ChevronUp, AlertTriangle, Users, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCardTheme } from "./CardThemeContext";
import { cardThemeTokens } from "./cardThemeTokens";

/* ─── API Response Types ─── */

interface ApiChild {
  name: string;
  tag_number: string;
  generation: number;
  date_of_birth: string;
  total_number_of_children: number;
  total_number_of_siblings: number;
  mother_name: string;
  father_name: string;
}

interface ApiPhysicalData {
  hip_width: string;
  head_score: number;
  ear_score: number;
  eye_score: number;
  muzzle_score: number;
  horn_score: number;
  skin_score: number;
  tail_score: number;
  hump_score: number;
  udder_score: number;
  teat_score: number;
  dewlap_score: number;
  milk_vein_score: number;
}

interface ApiOverview {
  name: string;
  tag_number: string;
  generation: number;
  date_of_birth: string;
  total_number_of_children: number;
  total_number_of_siblings: number;
  mother_name: string;
  father_name: string;
  is_present: number;
  children: ApiChild[];
  physical_data: ApiPhysicalData;
}

interface ApiMilkLog {
  month: string;
  milk: number;
}

interface ApiSibling {
  name: string;
  tag_number: string;
  date_of_birth: string;
}

interface ApiFamilyTree {
  mother_name: string;
  father_name: string;
  grand_mother_name: string;
  grand_father_name: string;
  siblings: ApiSibling[];
}

interface ApiCowResponse {
  overview: ApiOverview;
  milk_logs: ApiMilkLog[];
  family_tree: ApiFamilyTree;
}

/* ─── Component ─── */

interface CowCardProps {
  cow: Cow;
  onClose: () => void;
  onSelectCow?: (cow: Cow) => void;
}

export function CowCard({ cow, onClose, onSelectCow }: CowCardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "milk" | "weight" | "family" | "breed">("overview");
  const [showFullTree, setShowFullTree] = useState(false);
  const { cardTheme } = useCardTheme();
  const isDark = cardTheme === "dark";
  const T = cardThemeTokens(isDark);

  /* ─── API Fetch ─── */
  const [apiData, setApiData] = useState<ApiCowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const tagNumber = cow?.tagNumber ?? (cow as any)?.tag_number;

  useEffect(() => {
    if (!tagNumber) {
      setLoading(false);
      setFetchError("No tag number available for this cattle");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setApiData(null);

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${apiBase}/cattle/${tagNumber}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "Cattle not found in API" : `API error ${r.status}`);
        return r.json();
      })
      .then((data: ApiCowResponse) => {
        if (!cancelled) { setApiData(data); setLoading(false); }
      })
      .catch(err => {
        if (!cancelled) { setFetchError(err.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [tagNumber]);

  /* ─── Helpers ─── */

  const ov = apiData?.overview;
  const ml = apiData?.milk_logs ?? [];
  const ft = apiData?.family_tree;

  const ageYears = ov?.date_of_birth
    ? Math.floor((new Date("2026-02-25").getTime() - new Date(ov.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : Math.floor((new Date("2026-02-25").getTime() - new Date(cow.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const ageMonths = ov?.date_of_birth
    ? Math.floor(((new Date("2026-02-25").getTime() - new Date(ov.date_of_birth).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12)
    : Math.floor(((new Date("2026-02-25").getTime() - new Date(cow.dateOfBirth).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12);

  const childCount = ov?.total_number_of_children ?? cow.totalCalves;
  const siblingCount = ov?.total_number_of_siblings ?? 0;

  const physicalScores = ov?.physical_data ? [
    { trait: "Head", score: ov.physical_data.head_score },
    { trait: "Ear", score: ov.physical_data.ear_score },
    { trait: "Eye", score: ov.physical_data.eye_score },
    { trait: "Muzzle", score: ov.physical_data.muzzle_score },
    { trait: "Horn", score: ov.physical_data.horn_score },
    { trait: "Skin", score: ov.physical_data.skin_score },
    { trait: "Tail", score: ov.physical_data.tail_score },
    { trait: "Hump", score: ov.physical_data.hump_score },
    { trait: "Udder", score: ov.physical_data.udder_score },
    { trait: "Teat", score: ov.physical_data.teat_score },
    { trait: "Dewlap", score: ov.physical_data.dewlap_score },
    { trait: "Milk Vein", score: ov.physical_data.milk_vein_score },
  ] : null;

  const totalPhysicalScore = physicalScores
    ? Math.round((physicalScores.reduce((s, p) => s + p.score, 0) / physicalScores.length) * 10) / 10
    : null;

  const formattedMilkLogs = ml.map(r => ({
    month: r.month,
    liters: r.milk,
    belowThreshold: false,
  }));

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "milk", label: "Milk" },
    { key: "weight", label: "Weight" },
    { key: "family", label: "Family" },
    { key: "breed", label: "Breed Score" },
  ] as const;

  /* ─── Loading State ─── */
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

  /* ─── Error State ─── */
  if (fetchError && !apiData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}>
        <div className="bg-white dark:bg-navy rounded-2xl p-6 max-w-md w-full text-center space-y-3" onClick={e => e.stopPropagation()}>
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Data Not Available</h3>
          <p className="text-sm text-muted-foreground">{fetchError}</p>
          <p className="text-xs text-muted-foreground/60">Tag: {tagNumber}</p>
          <button onClick={onClose}
            className="px-4 py-2 bg-saffron text-white rounded-lg text-sm hover:bg-saffron-dark transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  /* ─── Data Availability Helpers ─── */
  const hasApiParent = (name: string | undefined | null) => name && name.trim() !== "";
  
  const Note = ({ children }: { children: React.ReactNode }) => (
    <div className={`${T.softBg} rounded-xl p-3 text-center`}>
      <p style={{ fontSize: '0.75rem' }} className={T.textFaint}>{children}</p>
    </div>
  );

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
              <div className="flex flex-col items-center shrink-0">
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-20 bg-gradient-to-b from-saffron to-saffron-dark rounded-xl flex flex-col items-center justify-center shadow-lg shadow-saffron/30"
                >
                  <span style={{ fontSize: '1.8rem', fontWeight: 800 }} className="text-white leading-none">
                    {totalPhysicalScore ?? cow.totalBreedScore ?? "—"}
                  </span>
                  <span style={{ fontSize: '0.5rem' }} className="text-white/80 uppercase tracking-widest">Score</span>
                </motion.div>
                <div className={`mt-1.5 px-2 py-0.5 rounded ${T.accentBg} border ${T.accentBorder}`}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 600 }} className={`${T.accent} uppercase tracking-widest`}>Gir</span>
                </div>
                {ov && <span style={{ fontSize: '0.5rem' }} className={`${T.textFaint} mt-1 uppercase`}>From API</span>}
                {!ov && <span style={{ fontSize: '0.5rem' }} className={`${T.textFaint} mt-1 uppercase`}>{cow.source}</span>}
              </div>

              <div className="flex-1 flex justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="relative"
                >
                  <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-saffron/50 shadow-2xl shadow-saffron/20 ring-2 ${isDark ? "ring-white/10 ring-offset-navy" : "ring-saffron/10 ring-offset-white"} ring-offset-2`}>
                    <ImageWithFallback src={cow.image} alt={ov?.name ?? cow.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-saffron/80 flex items-center justify-center">
                    <span style={{ fontSize: '1.5rem' }} className="text-white">{"♀"}</span>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {ov?.is_present !== undefined && (
                  <StatPill icon={<Heart className="w-3 h-3" />} value={ov.is_present ? "Present" : "Not Present"} T={T} />
                )}
                <StatPill icon={<Calendar className="w-3 h-3" />} value={`${ageYears}y ${ageMonths}m`} T={T} />
                {!ov && cow.dailyMilk > 0 && <StatPill icon={<Droplets className="w-3 h-3" />} value={`${cow.dailyMilk}L/d`} T={T} />}
                {!ov && <StatPill icon={<Heart className="w-3 h-3" />} value={cow.healthStatus.slice(0, 18)} T={T} />}
              </div>
            </div>

            <div className="text-center mt-3 relative z-[1]">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }} className={T.text}>{ov?.name ?? cow.name}</h2>
              <p style={{ fontSize: '0.7rem' }} className={`${T.accent} tracking-widest uppercase`}>
                {ov?.tag_number ?? cow.tagNumber} &bull; Gen {ov?.generation ?? cow.generation}
              </p>
            </div>

            <div className={`flex justify-center gap-5 mt-3 pb-2 border-b ${T.border} relative z-[1]`}>
              <QStat label="DOB" value={ov?.date_of_birth
                ? new Date(ov.date_of_birth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : new Date(cow.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} T={T} />
              <QStat label="Children" value={String(childCount)} T={T} />
              <QStat label="Siblings" value={String(siblingCount)} T={T} />
              {ov?.is_present !== undefined ? (
                <QStat label="Present" value={ov.is_present ? "Yes" : "No"} T={T} />
              ) : (
                <QStat label="Health" value={cow.healthStatus} T={T} />
              )}
            </div>

            <div className="flex gap-1 mt-2 relative z-[1]">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-t-lg transition-all ${activeTab === t.key
                    ? T.tabActive
                    : T.tabInactive
                    }`}
                  style={{ fontSize: '0.75rem' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Tab Content ─── */}
          <div
            className={`flex-1 overflow-y-auto bg-gradient-to-b ${T.contentBg} p-5 space-y-4`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? 'rgba(255,153,51,0.25) rgba(255,255,255,0.05)' : 'rgba(255,107,0,0.2) rgba(0,0,0,0.03)',
            }}
          >
            {/* ═══ OVERVIEW ═══ */}
            {activeTab === "overview" && (
              <>
                {!ov && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                    <p style={{ fontSize: '0.75rem' }} className="text-amber-600 dark:text-amber-400">
                      API data not available — showing local data
                    </p>
                  </div>
                )}

                {/* Parents from API */}
                <Section title="Parents" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`${T.softBg} rounded-lg p-2.5`}>
                      <p style={{ fontSize: '0.6rem' }} className={`${T.textFainter} uppercase tracking-wider mb-1`}>Mother</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }} className={T.text80}>
                        {hasApiParent(ft?.mother_name) ? ft!.mother_name : "Data not available"}
                      </p>
                    </div>
                    <div className={`${T.softBg} rounded-lg p-2.5`}>
                      <p style={{ fontSize: '0.6rem' }} className={`${T.textFainter} uppercase tracking-wider mb-1`}>Father</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }} className={T.text80}>
                        {hasApiParent(ft?.father_name) ? ft!.father_name : "Data not available"}
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Grandparents from API */}
                {(hasApiParent(ft?.grand_mother_name) || hasApiParent(ft?.grand_father_name)) && (
                  <Section title="Grandparents" icon={<GitBranch className="w-4 h-4" />} T={T}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`${T.softBg} rounded-lg p-2.5`}>
                        <p style={{ fontSize: '0.6rem' }} className={`${T.textFainter} uppercase tracking-wider mb-1`}>Grandmother</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }} className={T.text80}>
                          {hasApiParent(ft?.grand_mother_name) ? ft!.grand_mother_name : "Data not available"}
                        </p>
                      </div>
                      <div className={`${T.softBg} rounded-lg p-2.5`}>
                        <p style={{ fontSize: '0.6rem' }} className={`${T.textFainter} uppercase tracking-wider mb-1`}>Grandfather</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500 }} className={T.text80}>
                          {hasApiParent(ft?.grand_father_name) ? ft!.grand_father_name : "Data not available"}
                        </p>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Children from API */}
                {ov && ov.children.length > 0 && (
                  <Section title={`Children (${ov.children.length})`} icon={<Baby className="w-4 h-4" />} T={T}>
                    <div className="flex gap-1.5 flex-wrap">
                      {ov.children.slice(0, 10).map((c, i) => (
                        <div key={i} className={`flex items-center gap-1.5 ${T.softBg} rounded-lg px-2 py-1`}>
                          <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
                            <span style={{ fontSize: '0.5rem' }} className="text-saffron font-bold">{c.name[0]}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem' }} className={T.text70}>{c.name}</span>
                        </div>
                      ))}
                      {ov.children.length > 10 && (
                        <span style={{ fontSize: '0.7rem' }} className={`${T.textFaint} self-center`}>+{ov.children.length - 10} more</span>
                      )}
                    </div>
                  </Section>
                )}

                {/* Physical / Breed Scores from API */}
                {physicalScores && (
                  <Section title="Physical Scores (API)" icon={<Shield className="w-4 h-4" />} T={T}>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={physicalScores} outerRadius="80%">
                            <PolarGrid stroke={T.gridStroke} />
                            <Radar dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.3} strokeWidth={1.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {physicalScores.slice(0, 8).map(d => (
                          <div key={d.trait} className="flex items-center justify-between">
                            <span style={{ fontSize: '0.6rem' }} className={`${T.textSubtle} truncate`}>{d.trait}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}
                              className={d.score >= 7 ? "text-green-400" : d.score >= 5 ? "text-yellow-400" : "text-red-400"}>
                              {d.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {ov?.physical_data?.hip_width && (
                      <p style={{ fontSize: '0.6rem' }} className={`${T.textFaint} mt-1`}>
                        Hip width: {ov.physical_data.hip_width}
                      </p>
                    )}
                  </Section>
                )}

                {/* Notes / misc */}
                <div className={`${T.softBg} rounded-xl p-3`}>
                  <p style={{ fontSize: '0.65rem' }} className={`${T.textGhost} uppercase tracking-wider mb-1`}>Tag Number</p>
                  <p style={{ fontSize: '0.8rem' }} className={T.textMuted}>{ov?.tag_number ?? cow.tagNumber}</p>
                </div>
              </>
            )}

            {/* ═══ MILK ═══ */}
            {activeTab === "milk" && (
              <>
                {formattedMilkLogs.length > 0 ? (
                  <Section title="Milk Logs (API)" icon={<Droplets className="w-4 h-4" />} T={T}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-saffron rounded" />
                      <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Milk (L)</span>
                    </div>
                    <div className={`${T.softBg} rounded-xl p-3`}>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={formattedMilkLogs}>
                          <defs>
                            <linearGradient id="milkApiArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.axisFill, angle: -45 }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: T.axisFill }} axisLine={false} />
                          <Tooltip contentStyle={T.tooltipStyle} />
                          <Area type="monotone" dataKey="liters" stroke="#FF9933" strokeWidth={2} fill="url(#milkApiArea)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {formattedMilkLogs.slice(-12).map((r, i) => (
                        <div key={i} className={`text-center p-1.5 rounded-lg ${T.softBg}`}>
                          <p style={{ fontSize: '0.55rem' }} className={T.textFaint}>{r.month}</p>
                          <p style={{ fontSize: '0.75rem', fontWeight: 600 }} className={T.text80}>{r.liters}L</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                ) : (
                  <Note>No milk logs available from API</Note>
                )}
              </>
            )}

            {/* ═══ WEIGHT ═══ */}
            {activeTab === "weight" && (
              <Note>Weight data is not available from the API</Note>
            )}

            {/* ═══ FAMILY ═══ */}
            {activeTab === "family" && (
              <>
                <Section title="Family Tree (API)" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className={`${T.softBg} rounded-xl p-4`}>
                    {/* Grandparents */}
                    <div className="flex justify-center gap-8 mb-2">
                      <div className="text-center">
                        <div className={`w-14 h-14 rounded-full ${T.softBg} border border-dashed ${T.border} flex items-center justify-center mx-auto`}>
                          <span style={{ fontSize: '0.5rem' }} className={T.textDim}>
                            {hasApiParent(ft?.grand_mother_name) ? ft!.grand_mother_name[0] : "?"}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.5rem' }} className={T.textDim}>{hasApiParent(ft?.grand_mother_name) ? ft!.grand_mother_name : "GM"}</p>
                      </div>
                      <div className="text-center">
                        <div className={`w-14 h-14 rounded-full ${T.softBg} border border-dashed ${T.border} flex items-center justify-center mx-auto`}>
                          <span style={{ fontSize: '0.5rem' }} className={T.textDim}>
                            {hasApiParent(ft?.grand_father_name) ? ft!.grand_father_name[0] : "?"}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.5rem' }} className={T.textDim}>{hasApiParent(ft?.grand_father_name) ? ft!.grand_father_name : "GF"}</p>
                      </div>
                    </div>
                    <div className="flex justify-center"><div className="w-0.5 h-4 bg-saffron/30" /></div>
                    {/* Parents */}
                    <div className="flex justify-center gap-12 mb-2">
                      <div className="text-center">
                        <div className={`w-14 h-14 rounded-full ${T.softBg} border ${hasApiParent(ft?.mother_name) ? "border-saffron/40" : "border-dashed border-gray-400"} flex items-center justify-center mx-auto`}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600 }} className={T.text80}>
                            {hasApiParent(ft?.mother_name) ? ft!.mother_name[0] : "?"}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.55rem', fontWeight: 500 }} className={T.text70}>{hasApiParent(ft?.mother_name) ? ft!.mother_name : "Mother"}</p>
                      </div>
                      <div className="text-center">
                        <div className={`w-14 h-14 rounded-full ${T.softBg} border ${hasApiParent(ft?.father_name) ? "border-cyan-400/40" : "border-dashed border-gray-400"} flex items-center justify-center mx-auto`}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600 }} className={T.text80}>
                            {hasApiParent(ft?.father_name) ? ft!.father_name[0] : "?"}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.55rem', fontWeight: 500 }} className={T.text70}>{hasApiParent(ft?.father_name) ? ft!.father_name : "Father"}</p>
                      </div>
                    </div>
                    <div className="flex justify-center"><div className="w-0.5 h-5 bg-saffron/50" /></div>
                    {/* Current Cow */}
                    <div className="flex justify-center mb-2">
                      <div className="bg-saffron/10 border-2 border-saffron/40 rounded-xl p-2 flex items-center gap-2">
                        <ImageWithFallback src={cow.image} alt={ov?.name ?? cow.name} className="w-10 h-10 rounded-full object-cover border-2 border-saffron" />
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className={T.accent}>{ov?.name ?? cow.name}</p>
                          <p style={{ fontSize: '0.55rem' }} className={T.textSubtle}>{ov?.tag_number ?? cow.tagNumber} &bull; Current</p>
                        </div>
                      </div>
                    </div>
                    {/* Children */}
                    {ov && ov.children.length > 0 && (
                      <>
                        <div className="flex justify-center mb-1"><div className="w-0.5 h-4 bg-saffron/30" /></div>
                        <div className="flex justify-center gap-3 flex-wrap">
                          {ov.children.map((c, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-saffron/20 border border-saffron/30 flex items-center justify-center">
                                <span style={{ fontSize: '0.6rem', fontWeight: 600 }} className="text-saffron">{c.name[0]}</span>
                              </div>
                              <span style={{ fontSize: '0.55rem', fontWeight: 500 }} className={`${T.text70} mt-0.5`}>{c.name}</span>
                              <span style={{ fontSize: '0.45rem' }} className={T.textGhost}>Child</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Section>

                {/* Siblings from API */}
                {ft && ft.siblings.length > 0 && (
                  <Section title={`Siblings (${ft.siblings.length})`} icon={<Users className="w-4 h-4" />} T={T}>
                    <div className="flex gap-2 flex-wrap">
                      {ft.siblings.slice(0, 8).map((s, i) => (
                        <div key={i} className={`flex items-center gap-1.5 ${T.softBg} rounded-lg px-2.5 py-1.5`}>
                          <div className="w-5 h-5 rounded-full bg-saffron/20 flex items-center justify-center">
                            <span style={{ fontSize: '0.5rem' }} className="text-saffron font-bold">{s.name[0]}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem' }} className={T.text70}>{s.name}</span>
                        </div>
                      ))}
                      {ft.siblings.length > 8 && (
                        <button onClick={() => setShowFullTree(!showFullTree)}
                          className={`flex items-center gap-1 px-2 py-1 ${T.accent} hover:text-saffron transition-colors`}
                          style={{ fontSize: '0.7rem' }}>
                          {showFullTree ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {showFullTree ? "Show less" : `+${ft.siblings.length - 8} more`}
                        </button>
                      )}
                    </div>
                  </Section>
                )}

                {(!ft || ft.siblings.length === 0) && (
                  <Note>No family data available from API</Note>
                )}
              </>
            )}

            {/* ═══ BREED SCORE ═══ */}
            {activeTab === "breed" && (
              <>
                {physicalScores ? (
                  <>
                    <Section title="Physical Conformation (API)" icon={<Shield className="w-4 h-4" />} T={T}>
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-48 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={physicalScores} outerRadius="75%">
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
                        <p style={{ fontSize: '0.65rem' }} className={`${T.textFaint} uppercase tracking-wider`}>Average Physical Score</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}
                          className={totalPhysicalScore! >= 7 ? "text-green-400" : totalPhysicalScore! >= 5 ? "text-yellow-400" : "text-red-400"}>
                          {totalPhysicalScore}<span style={{ fontSize: '0.9rem' }} className={T.textGhost}>/10</span>
                        </p>
                      </div>
                    </Section>

                    <Section title="Trait Breakdown" icon={<Shield className="w-4 h-4" />} T={T}>
                      <div className="space-y-2">
                        {physicalScores.map(d => (
                          <div key={d.trait} className={`${T.softBg} rounded-lg p-2.5`}>
                            <div className="flex items-center justify-between mb-1">
                              <span style={{ fontSize: '0.75rem', fontWeight: 500 }} className={T.text80}>{d.trait}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}
                                className={d.score >= 7 ? "text-green-400" : d.score >= 5 ? "text-yellow-400" : "text-red-400"}>
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
                  </>
                ) : (
                  <Note>Physical score data not available from API</Note>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

type TTokens = ReturnType<typeof cardThemeTokens>;

function StatPill({ icon, value, T }: { icon: React.ReactNode; value: string; T: TTokens }) {
  return (
    <div className={`flex items-center gap-1 ${T.medBg} rounded-lg px-2 py-1`}>
      <span className={T.accent}>{icon}</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 500 }} className={T.text80}>{value}</span>
    </div>
  );
}

function QStat({ label, value, T }: { label: string; value: string; T: TTokens }) {
  return (
    <div className="text-center">
      <p style={{ fontSize: '0.55rem' }} className={`${T.textFainter} uppercase tracking-widest`}>{label}</p>
      <p style={{ fontSize: '0.78rem', fontWeight: 500 }} className={T.text}>{value}</p>
    </div>
  );
}

function Section({ title, icon, children, T }: { title: string; icon: React.ReactNode; children: React.ReactNode; T: TTokens }) {
  return (
    <div>
      <h4 style={{ fontSize: '0.7rem', fontWeight: 600 }} className={`${T.accent} uppercase tracking-widest mb-2 flex items-center gap-1.5`}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

