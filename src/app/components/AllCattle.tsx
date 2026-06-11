import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, Mic, MicOff, SlidersHorizontal, X, CalendarDays, Search, Filter,
} from "lucide-react";
import { CowCard } from "./CowCard";
import { CattleMilkCalendar } from "./CattleMilkCalendar";
import { Cow } from "../data/mockData";
import { CowIcon, Female, Male, Calf, Bull, PregnantIcon, MilkDrop } from "./icons/icons";
import { PageLoader } from "./ui/loader";

interface CattleItem {
  tag_number: string;
  name: string;
  gender: string;
  acquisition_type: string;
  animal_type: string;
  is_milking: number | null;
  is_pregnant: number | null;
}

const ACQUISITION_TYPES = ["BIRTH", "બહારથી આવેલ", "DONATION", "આંધળી ગાય", "PURCHASED"];
const ANIMAL_TYPES = ["BULL", "COW", "OX", "MALE CALF", "FEMALE CALF", "આજીવન મા બની શકશે નહી"];

const ANIMAL_META: Record<string, { icon: React.ReactNode; color: string }> = {
  BULL:        { icon: <Bull size={14} strokeWidth={1.6} />,        color: "text-navy dark:text-blue-300" },
  COW:         { icon: <CowIcon size={14} strokeWidth={1.6} />,     color: "text-saffron" },
  OX:          { icon: <Bull size={14} strokeWidth={1.6} />,        color: "text-muted-foreground" },
  "MALE CALF": { icon: <Calf size={14} strokeWidth={1.6} />,        color: "text-navy dark:text-blue-300" },
  "FEMALE CALF": { icon: <Calf size={14} strokeWidth={1.6} />,      color: "text-saffron" },
};

const ACQ_META: Record<string, string> = {
  BIRTH: "bg-saffron/8 text-saffron border-saffron/20",
  DONATION: "bg-purple-500/8 text-purple-600 border-purple-500/20 dark:text-purple-300",
  PURCHASED: "bg-amber-500/8 text-amber-600 border-amber-500/20 dark:text-amber-300",
  "બહારથી આવેલ": "bg-cyan-500/8 text-cyan-600 border-cyan-500/20 dark:text-cyan-300",
  "આંધળી ગાય": "bg-pink-500/8 text-pink-600 border-pink-500/20 dark:text-pink-300",
};

export function AllCattle() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const config = type === "milking"
    ? { api: `${API_BASE}/all-milking-cattle`, title: "Milking cattle", subtitle: "currently producing" }
    : { api: `${API_BASE}/all-present-cattle`, title: "All cattle", subtitle: "at the gaushala" };

  const [cattleList, setCattleList] = useState<CattleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [calendarTag, setCalendarTag] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [animalFilter, setAnimalFilter] = useState<string[]>([]);
  const [acqFilter, setAcqFilter] = useState<string[]>([]);
  const [milkingFilter, setMilkingFilter] = useState<boolean | null>(null);
  const [pregnantFilter, setPregnantFilter] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setAnimalFilter([]); setAcqFilter([]); setMilkingFilter(null); setPregnantFilter(null);
    setSearch(""); setSelectedCow(null);
    fetch(config.api)
      .then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json(); })
      .then((data: CattleItem[]) => { setCattleList(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [config.api]);

  const filtered = useMemo(() => {
    return cattleList.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.tag_number.toLowerCase().includes(search.toLowerCase());
      const matchAcq = acqFilter.length === 0 || acqFilter.includes(c.acquisition_type);
      const matchAnimal = animalFilter.length === 0 || animalFilter.includes(c.animal_type);
      const matchMilking = milkingFilter === null || (milkingFilter ? c.is_milking === 1 : c.is_milking === 0 || c.is_milking === null);
      const matchPregnant = pregnantFilter === null || (pregnantFilter ? c.is_pregnant === 1 : c.is_pregnant === 0 || c.is_pregnant === null);
      return matchSearch && matchAcq && matchAnimal && matchMilking && matchPregnant;
    });
  }, [cattleList, search, acqFilter, animalFilter, milkingFilter, pregnantFilter]);

  const activeFilterCount = acqFilter.length + animalFilter.length + (milkingFilter !== null ? 1 : 0) + (pregnantFilter !== null ? 1 : 0);

  const handleSpeech = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening && recognitionRef.current) { recognitionRef.current.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "gu-IN"; r.continuous = false; r.interimResults = false;
    r.onstart = () => setListening(true); r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => setSearch(e.results[0][0].transcript);
    recognitionRef.current = r; r.start();
  }, [listening]);

  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  const handleSelect = (item: CattleItem) => {
    const cow: Cow = {
      id: item.tag_number, name: item.name, tagNumber: item.tag_number, breed: "Gir",
      dateOfBirth: "", gender: item.gender === "Male" ? "Male" : "Female",
      weight: 0, source: "Natural Birth", status: "Milking",
      motherId: null, fatherId: null, image: "", milkOutput: [], weightHistory: [],
      healthStatus: "Healthy", lastVaccination: "", nextVaccination: "", dailyMilk: 0, notes: "",
      generation: 1,
      breedScore: { headShape: 0, hornCurvature: 0, earShape: 0, humpSize: 0, dewlap: 0, bodyFrame: 0, udderShape: 0, coatColor: 0, tailLength: 0, overallConformation: 0 },
      totalBreedScore: 0, milkThreshold: 0, weightThreshold: 0,
      gestationMonths: null, expectedDeliveryDate: null, lastCalvingDate: null,
      totalCalves: 0, lactationMonthsSinceCalving: null, dateOfPassing: null, causeOfDeath: null,
      yearsOfService: null, lifetimeMilkLiters: null, memorialNote: null,
    };
    setSelectedCow(cow);
  };

  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  const clearAll = () => { setAcqFilter([]); setAnimalFilter([]); setMilkingFilter(null); setPregnantFilter(null); };

  if (loading) return <PageLoader label="Loading cattle…" />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="surface p-8 text-center max-w-md"
        >
          <p className="text-destructive font-medium">Failed to load</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <button onClick={() => navigate("/")} className="mt-4 h-9 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90">
            Go back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/")}
            className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em]">{config.title}</h1>
            <p className="text-[0.82rem] text-muted-foreground tabular">
              <span className="text-foreground font-medium">{filtered.length}</span> of {cattleList.length} · {config.subtitle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tag…"
            className="w-full h-9 pl-9 pr-10 rounded-md border border-border bg-card text-[0.85rem] outline-none transition focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 placeholder:text-muted-foreground/40"
          />
          <button
            onClick={handleSpeech}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${listening ? "text-destructive animate-pulse-soft" : "text-muted-foreground/40 hover:text-foreground"}`}
            title="Voice search (Gujarati)"
          >
            {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 rounded-md text-[0.82rem] font-medium transition-colors flex items-center gap-1.5 ${
            showFilters ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="w-3.5 h-3.5" strokeWidth={1.8} />
          Filters
          {activeFilterCount > 0 && (
            <span className={`px-1.5 rounded text-[0.65rem] font-semibold ${showFilters ? "bg-background/20" : "bg-foreground/8 text-foreground"}`}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="surface p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[0.85rem] font-semibold text-foreground">Refine results</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              <FilterRow label="Acquisition type">
                {ACQUISITION_TYPES.map(a => (
                  <FilterChip key={a} active={acqFilter.includes(a)} onClick={() => setAcqFilter(toggle(acqFilter, a))}>{a}</FilterChip>
                ))}
              </FilterRow>

              <FilterRow label="Animal type">
                {ANIMAL_TYPES.map(a => (
                  <FilterChip key={a} active={animalFilter.includes(a)} onClick={() => setAnimalFilter(toggle(animalFilter, a))}>
                    {ANIMAL_META[a] ? <span className={ANIMAL_META[a].color}>{ANIMAL_META[a].icon}</span> : null} {a}
                  </FilterChip>
                ))}
              </FilterRow>

              <FilterRow label="Status">
                <FilterChip active={milkingFilter === true} onClick={() => setMilkingFilter(milkingFilter === true ? null : true)}>
                  <MilkDrop size={11} strokeWidth={1.8} /> Milking
                </FilterChip>
                <FilterChip active={milkingFilter === false} onClick={() => setMilkingFilter(milkingFilter === false ? null : false)}>
                  Milking · No
                </FilterChip>
                <FilterChip active={pregnantFilter === true} onClick={() => setPregnantFilter(pregnantFilter === true ? null : true)}>
                  <PregnantIcon size={11} strokeWidth={1.8} /> Pregnant
                </FilterChip>
                <FilterChip active={pregnantFilter === false} onClick={() => setPregnantFilter(pregnantFilter === false ? null : false)}>
                  Pregnant · No
                </FilterChip>
              </FilterRow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {acqFilter.map(a => (
            <span key={a} className={`chip ${ACQ_META[a] ?? "chip-neutral"}`}>
              {a}
              <button onClick={() => setAcqFilter(toggle(acqFilter, a))} className="hover:opacity-60 transition-opacity">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {animalFilter.map(a => (
            <span key={a} className="chip chip-neutral">
              {ANIMAL_META[a] ? <span className={ANIMAL_META[a].color}>{ANIMAL_META[a].icon}</span> : null} {a}
              <button onClick={() => setAnimalFilter(toggle(animalFilter, a))} className="hover:opacity-60 transition-opacity">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {milkingFilter !== null && (
            <span className="chip chip-neutral">
              <MilkDrop size={10} strokeWidth={1.8} /> {milkingFilter ? "Milking" : "Not milking"}
              <button onClick={() => setMilkingFilter(null)} className="hover:opacity-60 transition-opacity">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {pregnantFilter !== null && (
            <span className="chip chip-neutral">
              <PregnantIcon size={10} strokeWidth={1.8} /> {pregnantFilter ? "Pregnant" : "Not pregnant"}
              <button onClick={() => setPregnantFilter(null)} className="hover:opacity-60 transition-opacity">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="surface py-16 text-center">
          <CowIcon size={32} className="mx-auto text-muted-foreground/30" strokeWidth={1.2} />
          <p className="text-[0.9rem] text-muted-foreground mt-3">No cattle match your filters</p>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="mt-2 text-[0.8rem] text-foreground hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {filtered.map((c, i) => (
            <motion.button
              key={c.tag_number}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.012, 0.3), duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => type === "milking" ? (setCalendarTag(c.tag_number), setCalendarName(c.name)) : handleSelect(c)}
              className="group surface p-3.5 text-left hover-lift focus-ring relative"
            >
              <div className="flex items-start gap-3">
                <div className={`relative w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                  c.gender === "Male"
                    ? "bg-navy/8 text-navy ring-1 ring-navy/15 dark:bg-blue-500/12 dark:text-blue-300 dark:ring-blue-500/20"
                    : "bg-saffron/8 text-saffron ring-1 ring-saffron/15"
                }`}>
                  {c.gender === "Male" ? <Male size={15} strokeWidth={1.6} /> : <Female size={15} strokeWidth={1.6} />}
                  {(c.is_milking === 1 || c.is_pregnant === 1) && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-saffron ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.88rem] font-semibold text-foreground truncate leading-tight">{c.name}</p>
                  <p className="text-[0.7rem] text-muted-foreground font-mono mt-0.5 tabular">{c.tag_number}</p>
                </div>
                {type === "milking" && (
                  <CalendarDays className="w-3.5 h-3.5 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-2.5 text-[0.65rem]">
                {c.animal_type && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    {ANIMAL_META[c.animal_type] ? <span className={ANIMAL_META[c.animal_type].color}>{ANIMAL_META[c.animal_type].icon}</span> : null}
                    <span className="font-medium uppercase tracking-wider">{c.animal_type}</span>
                  </span>
                )}
                {c.is_milking === 1 && <span className="w-0.5 h-0.5 rounded-full bg-border" />}
                {c.is_milking === 1 && (
                  <span className="inline-flex items-center gap-1 text-info">
                    <MilkDrop size={10} strokeWidth={1.8} />
                    <span className="font-medium">Milking</span>
                  </span>
                )}
                {c.is_pregnant === 1 && <span className="w-0.5 h-0.5 rounded-full bg-border" />}
                {c.is_pregnant === 1 && (
                  <span className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-300">
                    <PregnantIcon size={10} strokeWidth={1.8} />
                    <span className="font-medium">Pregnant</span>
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCow && <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {calendarTag && (
          <CattleMilkCalendar tagNumber={calendarTag} cattleName={calendarName} onClose={() => setCalendarTag(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 rounded-md text-[0.75rem] font-medium border transition-colors inline-flex items-center gap-1 ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {children}
    </button>
  );
}
