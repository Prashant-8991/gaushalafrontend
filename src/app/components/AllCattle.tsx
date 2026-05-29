import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, Search, Mic, MicOff, Loader2, AlertTriangle,
  SlidersHorizontal, X, CalendarDays,
} from "lucide-react";
import { SiHappycow } from "react-icons/si";
import { CowCard } from "./CowCard";
import { CattleMilkCalendar } from "./CattleMilkCalendar";
import { Cow } from "../data/mockData";

/* ─── Types ─── */

interface CattleItem {
  tag_number: string;
  name: string;
  gender: string;
  acquisition_type: string;
  animal_type: string;
  is_milking: number | null;
  is_pregnant: number | null;
}

/* ─── Filter option lists ─── */

const GENDERS = ["Male", "Female"];

const ACQUISITION_TYPES = [
  "BIRTH",
  "બહારથી આવેલ",
  "DONATION",
  "આંધળી ગાય",
  "PURCHASED",
];

const ANIMAL_TYPES = [
  "BULL",
  "COW",
  "OX",
  "MALE CALF",
  "FEMALE CALF",
  "આજીવન મા બની શકશે નહી",
];

/* ─── Helpers ─── */

const ANIMAL_ICONS: Record<string, string> = {
  BULL: "🐂",
  COW: "🐄",
  OX: "🐂",
  "MALE CALF": "🐃",
  "FEMALE CALF": "🐄",
};

const GENDER_BADGE: Record<string, string> = {
  Male: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Female: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
};

const ACQUISITION_BADGE: Record<string, string> = {
  BIRTH: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  DONATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  PURCHASED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "બહારથી આવેલ": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "આંધળી ગાય": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

/* ─── Component ─── */

export function AllCattle() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const config = type === "milking"
    ? { api: `${API_BASE}/all-milking-cattle`, title: "Milking Cattle", subtitle: "milking cows" }
    : { api: `${API_BASE}/all-present-cattle`, title: "All Present Cattle", subtitle: "cattle in gaushala" };

  const [cattleList, setCattleList] = useState<CattleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [calendarTag, setCalendarTag] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* Filter state */
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [acqFilter, setAcqFilter] = useState<string[]>([]);
  const [animalFilter, setAnimalFilter] = useState<string[]>([]);
  const [milkingFilter, setMilkingFilter] = useState<boolean | null>(null);
  const [pregnantFilter, setPregnantFilter] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);

  /* ─── Fetch ─── */

  useEffect(() => {
    setGenderFilter([]); setAcqFilter([]); setAnimalFilter([]);
    setMilkingFilter(null); setPregnantFilter(null);
    setSearch(""); setSelectedCow(null);
    fetch(config.api)
      .then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json(); })
      .then((data: CattleItem[]) => { setCattleList(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [config.api]);

  /* ─── Derived unique options ─── */

  const acqOptions = useMemo(() => {
    const set = new Set(cattleList.map(c => c.acquisition_type).filter(Boolean));
    const order = [...ACQUISITION_TYPES];
    return order.filter(o => set.has(o)).concat([...set].filter(s => !order.includes(s)));
  }, [cattleList]);

  const animalOptions = useMemo(() => {
    const set = new Set(cattleList.map(c => c.animal_type).filter(Boolean));
    const order = [...ANIMAL_TYPES];
    return order.filter(o => set.has(o)).concat([...set].filter(s => !order.includes(s)));
  }, [cattleList]);

  /* ─── Filter logic ─── */

  const filtered = useMemo(() => {
    return cattleList.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.tag_number.toLowerCase().includes(search.toLowerCase());
      const matchGender = genderFilter.length === 0 || genderFilter.includes(c.gender);
      const matchAcq = acqFilter.length === 0 || acqFilter.includes(c.acquisition_type);
      const matchAnimal = animalFilter.length === 0 || animalFilter.includes(c.animal_type);
      const matchMilking = milkingFilter === null || (milkingFilter ? c.is_milking === 1 : c.is_milking === 0 || c.is_milking === null);
      const matchPregnant = pregnantFilter === null || (pregnantFilter ? c.is_pregnant === 1 : c.is_pregnant === 0 || c.is_pregnant === null);
      return matchSearch && matchGender && matchAcq && matchAnimal && matchMilking && matchPregnant;
    });
  }, [cattleList, search, genderFilter, acqFilter, animalFilter, milkingFilter, pregnantFilter]);

  const activeFilterCount = genderFilter.length + acqFilter.length + animalFilter.length + (milkingFilter !== null ? 1 : 0) + (pregnantFilter !== null ? 1 : 0);

  /* ─── Speech ─── */

  const handleSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser"); return; }
    if (listening && recognitionRef.current) { recognitionRef.current.stop(); setListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "gu-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => { setSearch(event.results[0][0].transcript); };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening]);

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, []);

  /* ─── Select cattle → CowCard ─── */

  const handleSelect = (item: CattleItem) => {
    const cow: Cow = {
      id: item.tag_number,
      name: item.name,
      tagNumber: item.tag_number,
      breed: "Gir",
      dateOfBirth: "",
      gender: item.gender === "Male" ? "Male" : "Female",
      weight: 0,
      source: "Natural Birth",
      status: "Milking",
      motherId: null,
      fatherId: null,
      image: "",
      milkOutput: [],
      weightHistory: [],
      healthStatus: "Healthy",
      lastVaccination: "",
      nextVaccination: "",
      dailyMilk: 0,
      notes: "",
      generation: 1,
      breedScore: { headShape: 0, hornCurvature: 0, earShape: 0, humpSize: 0, dewlap: 0, bodyFrame: 0, udderShape: 0, coatColor: 0, tailLength: 0, overallConformation: 0 },
      totalBreedScore: 0,
      milkThreshold: 0,
      weightThreshold: 0,
      gestationMonths: null,
      expectedDeliveryDate: null,
      lastCalvingDate: null,
      totalCalves: 0,
      lactationMonthsSinceCalving: null,
      dateOfPassing: null,
      causeOfDeath: null,
      yearsOfService: null,
      lifetimeMilkLiters: null,
      memorialNote: null,
    };
    setSelectedCow(cow);
  };

  /* ─── Toggle helpers ─── */

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const clearAll = () => { setGenderFilter([]); setAcqFilter([]); setAnimalFilter([]); setMilkingFilter(null); setPregnantFilter(null); };

  /* ─── Render: loading / error ─── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-saffron animate-spin" />
          <p className="text-muted-foreground text-sm">Loading cattle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Failed to load</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-saffron text-white rounded-lg text-sm hover:bg-saffron-dark">Go Back</button>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* ───── Header ───── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-saffron to-saffron-dark p-6">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-black/10 blur-3xl" />
        <div className="relative z-[1] flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }} className="text-white">{config.title}</h1>
            <p style={{ fontSize: '0.75rem' }} className="text-white/70">{filtered.length} of {cattleList.length} {config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ───── Search + Filter Toggle ───── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tag number... | નામ અથવા ટેગ નંબર દ્વારા શોધો..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-saffron/20 bg-white dark:bg-navy text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron transition-all"
            style={{ fontSize: '0.9rem' }}
          />
          <button onClick={handleSpeech}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${listening ? "text-red-500" : "text-muted-foreground hover:text-saffron"}`}
            title={listening ? "Stop" : "Voice search (Gujarati)"}>
            {listening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`h-[48px] px-4 rounded-xl border transition-all flex items-center gap-2 ${showFilters
            ? "bg-saffron text-white border-saffron shadow-md"
            : "bg-white dark:bg-navy text-muted-foreground border-saffron/20 hover:border-saffron/40"
            }`}>
          <SlidersHorizontal className="w-4 h-4" />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-saffron text-[0.6rem] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ───── Listening indicator ───── */}
      {listening && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <p style={{ fontSize: '0.85rem' }} className="text-red-600 dark:text-red-400">Listening in Gujarati... Speak now</p>
        </motion.div>
      )}

      {/* ───── Filter Panel ───── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-navy border border-saffron/20 rounded-2xl p-5 space-y-5 shadow-lg">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-saffron" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll}
                    className="text-[0.7rem] text-saffron hover:text-saffron-dark flex items-center gap-1 font-medium">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Gender */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Gender</p>
                <div className="flex gap-2">
                  {GENDERS.map(g => (
                    <button key={g} onClick={() => setGenderFilter(toggle(genderFilter, g))}
                      className={`px-4 py-2 rounded-xl border text-[0.8rem] font-medium transition-all ${genderFilter.includes(g)
                        ? g === "Male"
                          ? "bg-blue-500 text-white border-blue-500 shadow"
                          : "bg-pink-500 text-white border-pink-500 shadow"
                        : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                        }`}>
                      {g === "Male" ? "♂ " : "♀ "}{g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acquisition Type */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">
                  Acquisition Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {acqOptions.map(a => (
                    <button key={a} onClick={() => setAcqFilter(toggle(acqFilter, a))}
                      className={`px-3 py-1.5 rounded-lg border text-[0.75rem] font-medium transition-all ${acqFilter.includes(a)
                        ? "bg-saffron text-white border-saffron shadow-sm"
                        : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                        }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animal Type */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">
                  Animal Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {animalOptions.map(a => (
                    <button key={a} onClick={() => setAnimalFilter(toggle(animalFilter, a))}
                      className={`px-3 py-1.5 rounded-lg border text-[0.75rem] font-medium transition-all ${animalFilter.includes(a)
                        ? "bg-navy text-white border-navy shadow-sm"
                        : "bg-transparent text-muted-foreground border-saffron/20 hover:border-navy/40"
                        }`}>
                      {ANIMAL_ICONS[a] ?? ""} {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milking Status */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">
                  Milking Status
                </p>
                <div className="flex gap-2">
                  {[{ label: "Milking", value: true }, { label: "Not Milking", value: false }].map(o => (
                    <button key={o.label} onClick={() => setMilkingFilter(milkingFilter === o.value ? null : o.value)}
                      className={`px-4 py-2 rounded-xl border text-[0.8rem] font-medium transition-all ${milkingFilter === o.value
                        ? "bg-navy text-white border-navy shadow"
                        : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                        }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregnancy Status */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">
                  Pregnancy Status
                </p>
                <div className="flex gap-2">
                  {[{ label: "Pregnant", value: true }, { label: "Not Pregnant", value: false }].map(o => (
                    <button key={o.label} onClick={() => setPregnantFilter(pregnantFilter === o.value ? null : o.value)}
                      className={`px-4 py-2 rounded-xl border text-[0.8rem] font-medium transition-all ${pregnantFilter === o.value
                        ? "bg-pink-500 text-white border-pink-500 shadow"
                        : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                        }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Active filter chips ───── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {genderFilter.map(g => (
            <span key={g}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium border ${GENDER_BADGE[g]}`}>
              {g} <button onClick={() => setGenderFilter(toggle(genderFilter, g))}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {acqFilter.map(a => (
            <span key={a}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium bg-saffron/10 text-saffron border border-saffron/30">
              {a} <button onClick={() => setAcqFilter(toggle(acqFilter, a))}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {animalFilter.map(a => (
            <span key={a}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium bg-navy/10 text-navy dark:bg-navy/30 dark:text-white border border-navy/30">
              {ANIMAL_ICONS[a] ?? ""} {a} <button onClick={() => setAnimalFilter(toggle(animalFilter, a))}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {milkingFilter !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium bg-navy/10 text-navy dark:bg-navy/30 dark:text-white border border-navy/30">
              {milkingFilter ? "Milking" : "Not Milking"} <button onClick={() => setMilkingFilter(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {pregnantFilter !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
              {pregnantFilter ? "Pregnant" : "Not Pregnant"} <button onClick={() => setPregnantFilter(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* ───── Cattle Grid ───── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <SiHappycow className="w-16 h-16 text-saffron/30 mx-auto mb-3" />
          <p style={{ fontSize: '1rem' }} className="text-muted-foreground">No cattle found</p>
          {activeFilterCount > 0 && (
            <button onClick={clearAll}
              className="mt-2 text-[0.8rem] text-saffron hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c, i) => (
            <motion.button
              key={c.tag_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => type === "milking" ? (setCalendarTag(c.tag_number), setCalendarName(c.name)) : handleSelect(c)}
              className="group bg-white dark:bg-navy rounded-xl border border-saffron/10 p-4 text-left hover:shadow-lg hover:shadow-saffron/5 hover:border-saffron/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${c.gender === "Male" ? "bg-gradient-to-br from-blue-500 to-blue-700" : "bg-gradient-to-br from-pink-500 to-pink-600"}`}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }} className="text-white">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }} className="text-foreground truncate">{c.name}</p>
                  <p style={{ fontSize: '0.65rem' }} className="text-saffron font-mono">{c.tag_number}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[0.55rem] font-medium ${GENDER_BADGE[c.gender] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.gender === "Male" ? "♂" : "♀"} {c.gender}
                    </span>
                    {c.animal_type && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[0.55rem] font-medium bg-saffron/10 text-saffron border border-saffron/20">
                        {ANIMAL_ICONS[c.animal_type] ?? ""} {c.animal_type}
                      </span>
                    )}
                    {c.acquisition_type && (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[0.55rem] font-medium ${ACQUISITION_BADGE[c.acquisition_type] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.acquisition_type}
                      </span>
                    )}
                    {c.is_milking === 1 && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[0.55rem] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        🥛 Milking
                      </span>
                    )}
                    {c.is_pregnant === 1 && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[0.55rem] font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                        🤰 Pregnant
                      </span>
                    )}
                  </div>
                </div>
                {type === "milking" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCalendarTag(c.tag_number); setCalendarName(c.name); }}
                    className="shrink-0 w-7 h-7 rounded-lg bg-saffron/10 hover:bg-saffron/20 border border-saffron/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    title="View milk calendar"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-saffron" />
                  </button>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* CowCard */}
      <AnimatePresence>
        {selectedCow && <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} />}
      </AnimatePresence>

      {/* Milk Calendar */}
      <AnimatePresence>
        {calendarTag && (
          <CattleMilkCalendar
            tagNumber={calendarTag}
            cattleName={calendarName}
            onClose={() => setCalendarTag(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
