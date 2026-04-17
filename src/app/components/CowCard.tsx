import { useState } from "react";
import { X, Droplets, Scale, Calendar, GitBranch, Heart, Baby, Shield, ChevronDown, ChevronUp, AlertTriangle, Users } from "lucide-react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ReferenceLine,
} from "recharts";
import { Cow, cows, getCowById, getChildren, getSiblings, GIR_BREED_STANDARDS } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCardTheme } from "./CardThemeContext";
import { cardThemeTokens } from "./cardThemeTokens";

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

  const mother = cow.motherId ? getCowById(cow.motherId) : null;
  const father = cow.fatherId ? getCowById(cow.fatherId) : null;
  const children = getChildren(cow.id);
  const siblings = getSiblings(cow);
  const ageYears = Math.floor((new Date("2026-02-25").getTime() - new Date(cow.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const ageMonths = Math.floor(((new Date("2026-02-25").getTime() - new Date(cow.dateOfBirth).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12);

  const maternalGrandmother = mother?.motherId ? getCowById(mother.motherId) : null;
  const maternalGrandfather = mother?.fatherId ? getCowById(mother.fatherId) : null;
  const paternalGrandmother = father?.motherId ? getCowById(father.motherId) : null;
  const paternalGrandfather = father?.fatherId ? getCowById(father.fatherId) : null;

  const breedRadarData = Object.entries(cow.breedScore).map(([key, value]) => ({
    trait: key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
    score: value,
    ideal: (GIR_BREED_STANDARDS as any)[key]?.ideal || 9,
  }));

  const statusColors: Record<string, string> = {
    Milking: "bg-green-500", Pregnant: "bg-pink-500", Dry: "bg-gray-400",
    Calf: "bg-cyan-500", Bull: "bg-navy", Deceased: "bg-red-700", "Donated Out": "bg-amber-600",
  };

  const sourceLabels: Record<string, string> = {
    "Natural Birth": "Born from Bull", "Donated": "Donated", "Sperm Donation": "Born via Artificial Insemination", "Purchased": "Purchased",
  };

  const milkDataWithThreshold = cow.milkOutput.map(r => ({
    ...r,
    label: `${r.month} ${r.year}`,
    threshold: cow.milkThreshold,
  }));

  const weightDataWithThreshold = cow.weightHistory.map(r => ({
    ...r,
    label: `${r.month} ${r.year}`,
    threshold: cow.weightThreshold,
  }));

  const handleCowClick = (c: Cow) => {
    if (onSelectCow) onSelectCow(c);
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
                    {cow.totalBreedScore}
                  </span>
                  <span style={{ fontSize: '0.5rem' }} className="text-white/80 uppercase tracking-widest">Score</span>
                </motion.div>
                <div className={`mt-1.5 px-2 py-0.5 rounded ${T.accentBg} border ${T.accentBorder}`}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 600 }} className={`${T.accent} uppercase tracking-widest`}>
                    Gir
                  </span>
                </div>
                <span style={{ fontSize: '0.5rem' }} className={`${T.textFaint} mt-1 uppercase`}>{cow.source}</span>
              </div>

              <div className="flex-1 flex justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="relative"
                >
                  <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-saffron/50 shadow-2xl shadow-saffron/20 ring-2 ${isDark ? "ring-white/10 ring-offset-navy" : "ring-saffron/10 ring-offset-white"} ring-offset-2`}>
                    <ImageWithFallback src={cow.image} alt={cow.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 px-2.5 py-1 rounded-full ${statusColors[cow.status] || "bg-gray-500"} shadow-lg`}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700 }} className="text-white uppercase tracking-wide">{cow.status}</span>
                  </div>
                  <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full ${T.genderBg} flex items-center justify-center`}>
                    <span style={{ fontSize: '1.5rem' }} className={T.text}>{cow.gender === "Female" ? "♀" : "♂"}</span>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatPill icon={<Scale className="w-3 h-3" />} value={`${cow.weight}kg`} T={T} />
                <StatPill icon={<Calendar className="w-3 h-3" />} value={`${ageYears}y ${ageMonths}m`} T={T} />
                {cow.dailyMilk > 0 && <StatPill icon={<Droplets className="w-3 h-3" />} value={`${cow.dailyMilk}L/d`} T={T} />}
                <StatPill icon={<Heart className="w-3 h-3" />} value={cow.healthStatus.slice(0, 18)} T={T} />
              </div>
            </div>

            <div className="text-center mt-3 relative z-[1]">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }} className={T.text}>{cow.name}</h2>
              <p style={{ fontSize: '0.7rem' }} className={`${T.accent} tracking-widest uppercase`}>
                {cow.tagNumber} &bull; Gen {cow.generation} &bull; {sourceLabels[cow.source]}
              </p>
            </div>

            <div className={`flex justify-center gap-5 mt-3 pb-2 border-b ${T.border} relative z-[1]`}>
              <QStat label="DOB" value={new Date(cow.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} T={T} />
              <QStat label="Children" value={children.length.toString()} T={T} />
              <QStat label="Siblings" value={siblings.length.toString()} T={T} />
              <QStat label="Health" value={cow.healthStatus} T={T} />
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

          <div
            className={`flex-1 overflow-y-auto bg-gradient-to-b ${T.contentBg} p-5 space-y-4`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? 'rgba(255,153,51,0.25) rgba(255,255,255,0.05)' : 'rgba(255,107,0,0.2) rgba(0,0,0,0.03)',
            }}
          >
            {activeTab === "overview" && (
              <>
                {cow.status === "Pregnant" && cow.gestationMonths != null && (
                  <Section title="Gestation Tracker" icon={<Baby className="w-4 h-4" />} T={T}>
                    <div className="bg-gradient-to-r from-pink-500/10 to-saffron/10 rounded-xl p-3 border border-pink-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className={isDark ? "text-pink-300" : "text-pink-600"}>
                            {cow.gestationMonths} of 9 months
                          </p>
                          <p style={{ fontSize: '0.65rem' }} className={T.textFaint}>
                            Gir gestation period: ~283 days
                          </p>
                        </div>
                        <div className="text-right">
                          <p style={{ fontSize: '0.6rem' }} className={`${T.textFaint} uppercase`}>Expected Delivery</p>
                          <p style={{ fontSize: '0.78rem', fontWeight: 600 }} className={T.accent}>
                            {cow.expectedDeliveryDate
                              ? new Date(cow.expectedDeliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-full h-3 rounded-full ${T.progressBg} overflow-hidden relative`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-saffron transition-all"
                          style={{ width: `${(cow.gestationMonths / 9) * 100}%` }} />
                        <div className="absolute inset-0 flex">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(m => (
                            <div key={m} className={`flex-1 border-r ${T.border}`} />
                          ))}
                          <div className="flex-1" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Conception</span>
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Trimester 1</span>
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Trimester 2</span>
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Due</span>
                      </div>
                      <div className="flex gap-3 mt-2">
                        {cow.lastCalvingDate && (
                          <div className={`${T.softBg} rounded-lg px-2.5 py-1`}>
                            <p style={{ fontSize: '0.55rem' }} className={`${T.textFainter} uppercase`}>Last Calving</p>
                            <p style={{ fontSize: '0.7rem' }} className={T.text70}>
                              {new Date(cow.lastCalvingDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </p>
                          </div>
                        )}
                        <div className={`${T.softBg} rounded-lg px-2.5 py-1`}>
                          <p style={{ fontSize: '0.55rem' }} className={`${T.textFainter} uppercase`}>Total Calves</p>
                          <p style={{ fontSize: '0.7rem' }} className={T.text70}>{cow.totalCalves}</p>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {cow.status === "Milking" && cow.lactationMonthsSinceCalving != null && (
                  <Section title="Lactation Cycle" icon={<Droplets className="w-4 h-4" />} T={T}>
                    <div className="bg-gradient-to-r from-green-500/10 to-saffron/10 rounded-xl p-3 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className={isDark ? "text-green-300" : "text-green-600"}>
                            Month {cow.lactationMonthsSinceCalving} of 10
                          </p>
                          <p style={{ fontSize: '0.65rem' }} className={T.textFaint}>
                            Gir lactation: ~305 days post-calving
                          </p>
                        </div>
                        <div className="text-right">
                          <p style={{ fontSize: '0.6rem' }} className={`${T.textFaint} uppercase`}>Daily Output</p>
                          <p style={{ fontSize: '0.78rem', fontWeight: 600 }} className={T.accent}>{cow.dailyMilk}L/day</p>
                        </div>
                      </div>
                      <div className={`w-full h-2.5 rounded-full ${T.progressBg} overflow-hidden`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300"
                          style={{ width: `${(cow.lactationMonthsSinceCalving / 10) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Calving</span>
                        <span style={{ fontSize: '0.5rem' }} className={isDark ? "text-green-400/50" : "text-green-600/50"}>Peak (2-3mo)</span>
                        <span style={{ fontSize: '0.5rem' }} className={T.textGhost}>Dry off</span>
                      </div>
                      <div className="flex gap-3 mt-2">
                        {cow.lastCalvingDate && (
                          <div className={`${T.softBg} rounded-lg px-2.5 py-1`}>
                            <p style={{ fontSize: '0.55rem' }} className={`${T.textFainter} uppercase`}>Last Calving</p>
                            <p style={{ fontSize: '0.7rem' }} className={T.text70}>
                              {new Date(cow.lastCalvingDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </p>
                          </div>
                        )}
                        <div className={`${T.softBg} rounded-lg px-2.5 py-1`}>
                          <p style={{ fontSize: '0.55rem' }} className={`${T.textFainter} uppercase`}>Lifetime Calves</p>
                          <p style={{ fontSize: '0.7rem' }} className={T.text70}>{cow.totalCalves}</p>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                <Section title="Lineage" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className="grid grid-cols-2 gap-2">
                    <CowMini label="Mother" cow={mother} onClick={handleCowClick} T={T} />
                    <CowMini label="Father" cow={father} onClick={handleCowClick} T={T} />
                  </div>
                  {children.length > 0 && (
                    <div className="mt-2">
                      <p style={{ fontSize: '0.65rem' }} className={`${T.textFaint} uppercase tracking-wider mb-1.5 flex items-center gap-1`}>
                        <Baby className="w-3 h-3" /> Children ({children.length})
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {children.slice(0, 6).map(c => (
                          <button key={c.id} onClick={() => handleCowClick(c)}
                            className={`flex items-center gap-1.5 ${T.softBg} rounded-lg px-2 py-1 ${T.hoverBg} transition-colors`}>
                            <ImageWithFallback src={c.image} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                            <span style={{ fontSize: '0.7rem' }} className={T.text70}>{c.name}</span>
                          </button>
                        ))}
                        {children.length > 6 && (
                          <span style={{ fontSize: '0.7rem' }} className={`${T.textFaint} self-center`}>+{children.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </Section>

                <Section title="Breed Score" icon={<Shield className="w-4 h-4" />} T={T}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={breedRadarData} outerRadius="80%">
                          <PolarGrid stroke={T.gridStroke} />
                          <Radar dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.3} strokeWidth={1.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {breedRadarData.slice(0, 6).map(d => (
                        <div key={d.trait} className="flex items-center justify-between">
                          <span style={{ fontSize: '0.6rem' }} className={`${T.textSubtle} truncate`}>{d.trait}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600 }} className={d.score >= 7 ? "text-green-400" : d.score >= 5 ? "text-yellow-400" : "text-red-400"}>
                            {d.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                <div className={`${T.softBg} rounded-xl p-3`}>
                  <p style={{ fontSize: '0.65rem' }} className={`${T.textGhost} uppercase tracking-wider mb-1`}>Notes</p>
                  <p style={{ fontSize: '0.8rem' }} className={T.textMuted}>{cow.notes}</p>
                </div>
              </>
            )}

            {activeTab === "milk" && (
              <>
                {cow.milkOutput.length > 0 ? (
                  <Section title="Milk Output History" icon={<Droplets className="w-4 h-4" />} T={T}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-saffron rounded" />
                      <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Milk (L/day)</span>
                      <div className="w-3 h-0.5 bg-red-400 rounded" />
                      <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Threshold ({cow.milkThreshold}L)</span>
                    </div>
                    {milkDataWithThreshold.some(r => r.belowThreshold) && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span style={{ fontSize: '0.75rem' }} className={isDark ? "text-red-300" : "text-red-600"}>
                          Milk output dropped below {cow.milkThreshold}L threshold in some months
                        </span>
                      </div>
                    )}
                    <div className={`${T.softBg} rounded-xl p-3`}>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={milkDataWithThreshold}>
                          <defs>
                            <linearGradient id="milkArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF9933" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" tick={{ fontSize: 9, fill: T.axisFill, angle: -45 }} axisLine={false} interval={2} />
                          <YAxis tick={{ fontSize: 10, fill: T.axisFill }} axisLine={false} />
                          <Tooltip contentStyle={T.tooltipStyle} />
                          <ReferenceLine y={cow.milkThreshold} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5}
                            label={{ value: "Min", position: "right", fill: "#ef4444", fontSize: 10 }} />
                          <Area type="monotone" dataKey="liters" stroke="#FF9933" strokeWidth={2} fill="url(#milkArea)"
                            dot={(props: any) => {
                              const { cx, cy, payload } = props;
                              if (payload.belowThreshold) {
                                return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1.5} key={`dot-${cx}`} />;
                              }
                              return <circle cx={cx} cy={cy} r={0} key={`dot-${cx}`} />;
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {milkDataWithThreshold.slice(-12).map((r, i) => (
                        <div key={i} className={`text-center p-1.5 rounded-lg ${r.belowThreshold ? "bg-red-500/15 border border-red-500/30" : T.softBg}`}>
                          <p style={{ fontSize: '0.55rem' }} className={T.textFaint}>{r.label}</p>
                          <p style={{ fontSize: '0.75rem', fontWeight: 600 }} className={r.belowThreshold ? "text-red-400" : T.text80}>
                            {r.liters}L
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                ) : (
                  <div className="text-center py-8">
                    <p style={{ fontSize: '0.85rem' }} className={T.textFaint}>
                      {cow.gender === "Male" ? "Bulls don't produce milk" : "No milk records available"}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "weight" && (
              <Section title="Weight History" icon={<Scale className="w-4 h-4" />} T={T}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-cyan-400 rounded" />
                  <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Weight (kg)</span>
                  <div className="w-3 h-0.5 bg-red-400 rounded" />
                  <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Min Threshold ({cow.weightThreshold}kg)</span>
                </div>
                {weightDataWithThreshold.some(r => r.belowThreshold) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span style={{ fontSize: '0.75rem' }} className={isDark ? "text-red-300" : "text-red-600"}>
                      Weight dropped below {cow.weightThreshold}kg minimum in some months
                    </span>
                  </div>
                )}
                <div className={`${T.softBg} rounded-xl p-3`}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightDataWithThreshold}>
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: T.axisFill, angle: -45 }} axisLine={false} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: T.axisFill }} axisLine={false} />
                      <Tooltip contentStyle={T.tooltipStyle} />
                      <ReferenceLine y={cow.weightThreshold} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5}
                        label={{ value: "Min", position: "right", fill: "#ef4444", fontSize: 10 }} />
                      <Line type="monotone" dataKey="kg" stroke="#4FC3F7" strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.belowThreshold) {
                            return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1.5} key={`dot-${cx}`} />;
                          }
                          return <circle cx={cx} cy={cy} r={0} key={`dot-${cx}`} />;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-center">
                  <p style={{ fontSize: '0.7rem' }} className={T.textFaint}>
                    Current: <span className={T.text80}>{cow.weight}kg</span> &bull;
                    Threshold: <span className={cow.weight < cow.weightThreshold ? "text-red-400" : "text-green-400"}>
                      {cow.weightThreshold}kg
                    </span>
                  </p>
                </div>
              </Section>
            )}

            {activeTab === "family" && (
              <>
                <Section title="Full Family Tree" icon={<GitBranch className="w-4 h-4" />} T={T}>
                  <div className={`${T.softBg} rounded-xl p-4 overflow-x-auto`}>
                    <div className="min-w-[500px]">
                      <div className="flex justify-center gap-8 mb-2">
                        <div className="flex gap-4">
                          <TreeMini cow={maternalGrandmother} label="Mat. GM" onClick={handleCowClick} T={T} />
                          <TreeMini cow={maternalGrandfather} label="Mat. GF" onClick={handleCowClick} T={T} />
                        </div>
                        <div className="flex gap-4">
                          <TreeMini cow={paternalGrandmother} label="Pat. GM" onClick={handleCowClick} T={T} />
                          <TreeMini cow={paternalGrandfather} label="Pat. GF" onClick={handleCowClick} T={T} />
                        </div>
                      </div>

                      <div className="flex justify-center gap-8 mb-1">
                        <div className="w-24 flex justify-center"><div className="w-0.5 h-4 bg-saffron/30" /></div>
                        <div className="w-24 flex justify-center"><div className="w-0.5 h-4 bg-saffron/30" /></div>
                      </div>

                      <div className="flex justify-center gap-12 mb-2">
                        <TreeMini cow={mother} label="Mother" onClick={handleCowClick} size="md" T={T} />
                        <TreeMini cow={father} label="Father" onClick={handleCowClick} size="md" T={T} />
                      </div>

                      <div className="flex justify-center mb-1">
                        <div className="w-0.5 h-5 bg-saffron/50" />
                      </div>

                      <div className="flex justify-center mb-2">
                        <div className="bg-saffron/10 border-2 border-saffron/40 rounded-xl p-2 flex items-center gap-2">
                          <ImageWithFallback src={cow.image} alt={cow.name} className="w-10 h-10 rounded-full object-cover border-2 border-saffron" />
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className={T.accent}>{cow.name}</p>
                            <p style={{ fontSize: '0.55rem' }} className={T.textSubtle}>{cow.tagNumber} &bull; Current</p>
                          </div>
                        </div>
                      </div>

                      {children.length > 0 && (
                        <>
                          <div className="flex justify-center mb-1">
                            <div className="w-0.5 h-4 bg-saffron/30" />
                          </div>
                          <div className="flex justify-center gap-3 flex-wrap">
                            {children.map(c => (
                              <TreeMini key={c.id} cow={c} label="Child" onClick={handleCowClick} T={T} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Section>

                {siblings.length > 0 && (
                  <Section title={`Siblings (${siblings.length})`} icon={<Users className="w-4 h-4" />} T={T}>
                    <div className="flex gap-2 flex-wrap">
                      {siblings.slice(0, showFullTree ? 50 : 8).map(s => (
                        <button key={s.id} onClick={() => handleCowClick(s)}
                          className={`flex items-center gap-1.5 ${T.softBg} rounded-lg px-2.5 py-1.5 ${T.hoverBg} transition-colors`}>
                          <ImageWithFallback src={s.image} alt={s.name} className="w-5 h-5 rounded-full object-cover" />
                          <span style={{ fontSize: '0.7rem' }} className={T.text70}>{s.name}</span>
                          <span style={{ fontSize: '0.85rem' }} className={T.textGhost}>{s.gender === "Female" ? "♀" : "♂"}</span>
                        </button>
                      ))}
                      {siblings.length > 8 && (
                        <button onClick={() => setShowFullTree(!showFullTree)}
                          className={`flex items-center gap-1 px-2 py-1 ${T.accent} hover:text-saffron transition-colors`}
                          style={{ fontSize: '0.7rem' }}>
                          {showFullTree ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {showFullTree ? "Show less" : `+${siblings.length - 8} more`}
                        </button>
                      )}
                    </div>
                  </Section>
                )}

                {children.length > 0 && (
                  <Section title={`Offspring (${children.length})`} icon={<Baby className="w-4 h-4" />} T={T}>
                    <div className="space-y-1.5">
                      {children.map(c => (
                        <button key={c.id} onClick={() => handleCowClick(c)}
                          className={`w-full flex items-center gap-3 ${T.softBg} rounded-lg p-2 ${T.hoverBg} transition-colors text-left`}>
                          <ImageWithFallback src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-saffron/20" />
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: '0.78rem', fontWeight: 500 }} className={T.text80}>{c.name}</p>
                            <p style={{ fontSize: '0.6rem' }} className={T.textFaint}>{c.tagNumber} &bull; {c.gender} &bull; {c.status}</p>
                          </div>
                          <div className="text-right">
                            <p style={{ fontSize: '0.65rem' }} className={T.accent}>{c.source}</p>
                            <p style={{ fontSize: '0.55rem' }} className={T.textGhost}>Score: {c.totalBreedScore}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </>
            )}

            {activeTab === "breed" && (
              <>
                <Section title="Gir Breed Conformity" icon={<Shield className="w-4 h-4" />} T={T}>
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={breedRadarData} outerRadius="75%">
                          <PolarGrid stroke={T.gridStroke} />
                          <PolarAngleAxis dataKey="trait" tick={{ fontSize: 7, fill: isDark ? "#ffffff60" : "#6B5A4E" }} />
                          <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 8, fill: isDark ? "#ffffff30" : "#6B5A4E80" }} />
                          <Radar name="Ideal" dataKey="ideal" stroke="#4FC3F7" fill="#4FC3F7" fillOpacity={0.1} strokeWidth={1} strokeDasharray="3 3" />
                          <Radar name="Score" dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.3} strokeWidth={2} />
                          <Tooltip contentStyle={T.tooltipStyle} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1 bg-saffron rounded" />
                      <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>This Cow</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1 bg-cyan-400 rounded" style={{ borderStyle: "dashed" }} />
                      <span style={{ fontSize: '0.65rem' }} className={T.textSubtle}>Ideal Gir</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-saffron/10 to-navy/10 rounded-xl p-3 mb-3 text-center">
                    <p style={{ fontSize: '0.65rem' }} className={`${T.textFaint} uppercase tracking-wider`}>Overall Breed Score</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800 }} className={
                      cow.totalBreedScore >= 8 ? "text-green-400" :
                        cow.totalBreedScore >= 6 ? (isDark ? "text-saffron-light" : "text-saffron-dark") :
                          cow.totalBreedScore >= 4 ? "text-yellow-400" : "text-red-400"
                    }>
                      {cow.totalBreedScore}<span style={{ fontSize: '0.9rem' }} className={T.textGhost}>/10</span>
                    </p>
                    <p style={{ fontSize: '0.7rem' }} className={T.textSubtle}>
                      {cow.totalBreedScore >= 8 ? "Excellent Gir Specimen" :
                        cow.totalBreedScore >= 6 ? "Good Breed Conformity" :
                          cow.totalBreedScore >= 4 ? "Average - Room for Improvement" : "Below Standard"}
                    </p>
                  </div>
                </Section>

                <Section title="Trait Breakdown" icon={<Shield className="w-4 h-4" />} T={T}>
                  <div className="space-y-2">
                    {breedRadarData.map(d => {
                      const standard = (GIR_BREED_STANDARDS as any)[
                        d.trait.replace(/ ./g, x => x[1].toUpperCase()).replace(/^./, x => x.toLowerCase())
                      ];
                      return (
                        <div key={d.trait} className={`${T.softBg} rounded-lg p-2.5`}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }} className={T.text80}>{d.trait}</span>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '0.75rem', fontWeight: 700 }} className={
                                d.score >= 7 ? "text-green-400" : d.score >= 5 ? "text-yellow-400" : "text-red-400"
                              }>{d.score}</span>
                              <span style={{ fontSize: '0.6rem' }} className={T.textGhost}>/ {d.ideal}</span>
                            </div>
                          </div>
                          <div className={`w-full h-1.5 rounded-full ${T.progressBg} overflow-hidden`}>
                            <div className={`h-full rounded-full transition-all ${d.score >= 7 ? "bg-green-400" : d.score >= 5 ? "bg-yellow-400" : "bg-red-400"
                              }`} style={{ width: `${(d.score / 10) * 100}%` }} />
                          </div>
                          {standard && (
                            <p style={{ fontSize: '0.6rem' }} className={`${T.textGhost} mt-1`}>{standard.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
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

function CowMini({ label, cow, onClick, size = "sm", T }: { label: string; cow: Cow | null | undefined; onClick: (c: Cow) => void; size?: "sm" | "md"; T: TTokens }) {
  const imgSize = size === "md" ? "w-9 h-9" : "w-7 h-7";
  return (
    <div className={`${T.softBg} rounded-lg p-2.5`}>
      <p style={{ fontSize: '0.6rem' }} className={`${T.textFainter} uppercase tracking-wider mb-1.5`}>{label}</p>
      {cow ? (
        <button onClick={() => onClick(cow)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ImageWithFallback src={cow.image} alt={cow.name} className={`${imgSize} rounded-full object-cover border border-saffron/30`} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 500 }} className={`${T.text} text-left`}>{cow.name}</p>
            <p style={{ fontSize: '0.55rem' }} className={T.textFaint}>{cow.tagNumber} &bull; {cow.source}</p>
          </div>
        </button>
      ) : (
        <p style={{ fontSize: '0.75rem' }} className={`${T.textHint} italic`}>Unknown</p>
      )}
    </div>
  );
}

function TreeMini({ cow, label, onClick, size = "sm", T }: { cow: Cow | null | undefined; label: string; onClick: (c: Cow) => void; size?: "sm" | "md"; T: TTokens }) {
  const s = size === "md" ? "w-10 h-10" : "w-7 h-7";
  if (!cow) {
    return (
      <div className="flex flex-col items-center">
        <div className={`${s} rounded-full ${T.softBg} border border-dashed ${T.border} flex items-center justify-center`}>
          <span style={{ fontSize: '0.5rem' }} className={T.textDim}>?</span>
        </div>
        <span style={{ fontSize: '0.5rem' }} className={`${T.textDim} mt-0.5`}>{label}</span>
      </div>
    );
  }
  return (
    <button onClick={() => onClick(cow)} className="flex flex-col items-center hover:scale-105 transition-transform">
      <ImageWithFallback src={cow.image} alt={cow.name}
        className={`${s} rounded-full object-cover border ${cow.gender === "Female" ? "border-saffron/40" : "border-cyan-400/40"}`} />
      <span style={{ fontSize: '0.55rem', fontWeight: 500 }} className={`${T.text70} mt-0.5`}>{cow.name}</span>
      <span style={{ fontSize: '0.45rem' }} className={T.textGhost}>{label}</span>
    </button>
  );
}