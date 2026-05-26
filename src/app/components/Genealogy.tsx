import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, GitBranch, ChevronDown, ChevronRight,
  Baby, Layers, ZoomIn, ZoomOut, Maximize2, Focus, X, Loader2, AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CowCard } from "./CowCard";
import type { Cow } from "../data/mockData";

type ViewMode = "tree" | "grid" | "generation";

interface GenealogyCattle {
  tag_number: string;
  name: string;
  gender: string;
  animal_type: string | null;
  acquisition_type: string | null;
  date_of_birth: string | null;
  is_present: number | null;
  is_milking: number | null;
  is_pregnant: number | null;
  mother_tag_number: string | null;
  father_tag_number: string | null;
  generation: number | null;
}

function deriveStatus(c: GenealogyCattle): string {
  if (c.gender === "Male" && c.animal_type?.toUpperCase() === "BULL") return "Bull";
  if (c.animal_type?.toUpperCase().includes("CALF")) return "Calf";
  if (c.is_pregnant === 1) return "Pregnant";
  if (c.is_milking === 1) return "Milking";
  return "Dry";
}

const STATUS_RING: Record<string, string> = {
  Milking: "ring-green-400 shadow-green-400/20",
  Pregnant: "ring-pink-400 shadow-pink-400/20",
  Dry: "ring-gray-300 shadow-gray-300/20",
  Calf: "ring-cyan-400 shadow-cyan-400/20",
  Bull: "ring-[#1B3A6B] shadow-[#1B3A6B]/20",
};

const STATUS_BG: Record<string, string> = {
  Milking: "bg-green-500",
  Pregnant: "bg-pink-500",
  Dry: "bg-gray-400",
  Calf: "bg-cyan-500",
  Bull: "bg-[#1B3A6B]",
};

const STATUS_TILE: Record<string, string> = {
  Milking: "bg-green-100 text-green-700",
  Pregnant: "bg-pink-100 text-pink-700",
  Calf: "bg-cyan-100 text-cyan-700",
  Bull: "bg-blue-100 text-navy",
  Dry: "bg-gray-100 text-gray-600",
};

const GENDERS = ["Male", "Female"];

const GENDER_BADGE: Record<string, string> = {
  Male: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Female: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
};

const ACQUISITION_TYPES = ["BIRTH", "બહારથી આવેલ", "DONATION", "આંધળી ગાય", "PURCHASED"];

const ANIMAL_TYPES = ["BULL", "COW", "OX", "MALE CALF", "FEMALE CALF", "આજીવન મા બની શકશે નહી"];

const ANIMAL_ICONS: Record<string, string> = {
  BULL: "🐂", COW: "🐄", OX: "🐂", "MALE CALF": "🐃", "FEMALE CALF": "🐄",
};

export function Genealogy() {
  const [selectedCow, setSelectedCow] = useState<GenealogyCattle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [focusedRoot, setFocusedRoot] = useState<GenealogyCattle | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [maxDepth, setMaxDepth] = useState(3);
  const [showFilters, setShowFilters] = useState(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  /* ─── Filter state ─── */
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [acqFilter, setAcqFilter] = useState<string[]>([]);
  const [animalFilter, setAnimalFilter] = useState<string[]>([]);
  const [presentFilter, setPresentFilter] = useState<boolean>(true);
  const [milkingFilter, setMilkingFilter] = useState<boolean | null>(null);
  const [pregnantFilter, setPregnantFilter] = useState<boolean | null>(null);

  /* ─── API fetch ─── */
  const { data: cattleList, isLoading, error } = useQuery<GenealogyCattle[]>({
    queryKey: ["genealogy-all"],
    queryFn: () => { const base = import.meta.env.VITE_API_URL || "http://localhost:8000"; return fetch(`${base}/genealogy/all`).then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }) },
  });

  const cows = cattleList ?? [];

  /* ─── Children map for tree ─── */
  const childrenMap = useMemo(() => {
    const map = new Map<string, GenealogyCattle[]>();
    for (const c of cows) {
      if (c.mother_tag_number) {
        const arr = map.get(c.mother_tag_number) ?? [];
        arr.push(c);
        map.set(c.mother_tag_number, arr);
      }
    }
    return map;
  }, [cows]);

  const getChildren = useCallback((tag: string): GenealogyCattle[] => childrenMap.get(tag) ?? [], [childrenMap]);

  /* ─── Derived filter options from data ─── */
  const acqOptions = useMemo(() => {
    const set = new Set(cows.map(c => c.acquisition_type).filter(Boolean) as string[]);
    return ACQUISITION_TYPES.filter(o => set.has(o));
  }, [cows]);

  const animalOptions = useMemo(() => {
    const set = new Set(cows.map(c => c.animal_type).filter(Boolean) as string[]);
    return ANIMAL_TYPES.filter(o => set.has(o));
  }, [cows]);

  /* ─── Filter logic ─── */
  const matchFilters = useCallback((c: GenealogyCattle) => {
    const status = deriveStatus(c);
    const matchSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGender = genderFilter.length === 0 || genderFilter.includes(c.gender);
    const matchAcq = acqFilter.length === 0 || (c.acquisition_type ? acqFilter.includes(c.acquisition_type) : false);
    const matchAnimal = animalFilter.length === 0 || (c.animal_type ? animalFilter.includes(c.animal_type) : false);
    const matchPresent = !presentFilter || c.is_present === 1;
    const matchMilking = milkingFilter === null || (milkingFilter ? c.is_milking === 1 : c.is_milking === 0 || c.is_milking === null);
    const matchPregnant = pregnantFilter === null || (pregnantFilter ? c.is_pregnant === 1 : c.is_pregnant === 0 || c.is_pregnant === null);
    return matchSearch && matchGender && matchAcq && matchAnimal && matchPresent && matchMilking && matchPregnant;
  }, [searchTerm, genderFilter, acqFilter, animalFilter, presentFilter, milkingFilter, pregnantFilter]);

  const filteredCows = useMemo(() => cows.filter(matchFilters), [cows, matchFilters]);

  const foundationCows = useMemo(() =>
    filteredCows.filter(c => c.mother_tag_number === null && c.father_tag_number === null),
    [filteredCows],
  );

  const activeFilterCount =
    genderFilter.length + acqFilter.length + animalFilter.length +
    (milkingFilter !== null ? 1 : 0) +
    (pregnantFilter !== null ? 1 : 0);

  /* ─── Handlers ─── */
  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.min(1.5, Math.max(0.3, z + delta)));
  }, []);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const clearAll = () => {
    setGenderFilter([]); setAcqFilter([]); setAnimalFilter([]);
    setPresentFilter(true); setMilkingFilter(null); setPregnantFilter(null);
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return cows.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_number.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [searchTerm, cows]);

  /* ─── Loading / Error ─── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-saffron animate-spin" />
          <p className="text-muted-foreground text-sm">Loading genealogy data...</p>
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
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* ───── Header ───── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-saffron" />
            Cow Genealogy &amp; Family Trees
          </h1>
          <p style={{ fontSize: '0.8rem' }} className="text-muted-foreground mt-0.5">
            {cows.length} Gir cows across {Math.max(...cows.map(c => c.generation ?? 1), 1)} generations
          </p>
        </div>
        <div className="flex gap-2">
          {(["tree", "generation", "grid"] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${viewMode === mode ? "bg-saffron text-white shadow-sm" : "bg-white border border-saffron/15 text-muted-foreground hover:border-saffron/40"
                }`} style={{ fontSize: '0.8rem' }}>
              {mode === "tree" ? "Family Tree" : mode === "generation" ? "By Generation" : "Grid View"}
            </button>
          ))}
        </div>
      </div>

      {/* ───── Search + Filter Toggle ───── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search by name or tag..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-saffron/20 bg-white dark:bg-navy text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron transition-all"
            style={{ fontSize: '0.9rem' }} />
          {viewMode === "tree" && searchResults.length > 0 && searchTerm.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-saffron/15 shadow-lg z-20 max-h-60 overflow-y-auto">
              <p style={{ fontSize: '0.65rem' }} className="px-3 pt-2 pb-1 text-muted-foreground">Click to focus family tree on this cow</p>
              {searchResults.map(cow => (
                <button key={cow.tag_number}
                  onClick={() => { setFocusedRoot(cow); setSearchTerm(""); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-saffron/5 transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-saffron/20 flex items-center justify-center text-[0.6rem] font-bold text-saffron shrink-0 border border-saffron/30">
                    {cow.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 500 }}>{cow.name}</p>
                    <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">{cow.tag_number} &bull; Gen {cow.generation} &bull; {deriveStatus(cow)}</p>
                  </div>
                  <Focus className="w-3.5 h-3.5 text-saffron ml-auto" />
                </button>
              ))}
            </div>
          )}
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

      {/* ───── Filter Panel ───── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-navy border border-saffron/20 rounded-2xl p-5 space-y-5 shadow-lg">

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
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Acquisition Type</p>
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
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Animal Type</p>
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

              {/* Present Status */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Present Status</p>
                <div className="flex gap-2">
                  <button onClick={() => setPresentFilter(true)}
                    className={`px-4 py-2 rounded-xl border text-[0.8rem] font-medium transition-all ${presentFilter === true
                      ? "bg-green-500 text-white border-green-500 shadow"
                      : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                      }`}>
                    Present
                  </button>
                  <button onClick={() => setPresentFilter(false)}
                    className={`px-4 py-2 rounded-xl border text-[0.8rem] font-medium transition-all ${presentFilter === false
                      ? "bg-red-500 text-white border-red-500 shadow"
                      : "bg-transparent text-muted-foreground border-saffron/20 hover:border-saffron/40"
                      }`}>
                    Not Present
                  </button>
                </div>
              </div>

              {/* Milking Status */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Milking Status</p>
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
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Pregnancy Status</p>
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
          {!presentFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              Not Present <button onClick={() => setPresentFilter(true)}><X className="w-3 h-3" /></button>
            </span>
          )}
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

      {/* ───── Tree View ───── */}
      {viewMode === "tree" && (
        <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-saffron/10 bg-muted/20">
            <div className="flex items-center gap-2">
              {focusedRoot ? (
                <div className="flex items-center gap-2 bg-saffron/10 rounded-lg px-2.5 py-1">
                  <div className="w-5 h-5 rounded-full bg-saffron/30 flex items-center justify-center text-[0.5rem] font-bold text-white">
                    {focusedRoot.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }} className="text-saffron-dark">
                    {focusedRoot.name}'s Lineage
                  </span>
                  <button onClick={() => setFocusedRoot(null)} className="hover:bg-saffron/20 rounded p-0.5 transition-colors">
                    <X className="w-3 h-3 text-saffron" />
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem' }} className="text-muted-foreground">
                  Showing {foundationCows.length} foundation lineages &bull; Top-down family tree
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">Depth:</span>
              {[2, 3, 4, 5].map(d => (
                <button key={d} onClick={() => setMaxDepth(d)}
                  className={`w-6 h-6 rounded text-center transition-colors ${maxDepth === d ? "bg-saffron text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`} style={{ fontSize: '0.65rem' }}>{d}</button>
              ))}
              <div className="w-px h-4 bg-saffron/15 mx-1" />
              <button onClick={() => handleZoom(-0.15)}
                className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => handleZoom(0.15)}
                className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => setZoom(0.85)}
                className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div ref={treeContainerRef}
            className="overflow-auto p-8 bg-gradient-to-b from-[#faf8f5] to-[#f5f0ea]"
            style={{ maxHeight: "70vh" }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}>
              {focusedRoot ? (
                <div className="flex justify-center">
                  <VisualTreeNode cow={focusedRoot} onSelect={setSelectedCow} onFocus={setFocusedRoot} getChildren={getChildren} depth={0} maxDepth={maxDepth} />
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-12">
                  {foundationCows.map(cow => (
                    <div key={cow.tag_number} className="flex flex-col items-center">
                      <VisualTreeNode cow={cow} onSelect={setSelectedCow} onFocus={setFocusedRoot} getChildren={getChildren} depth={0} maxDepth={maxDepth} />
                    </div>
                  ))}
                  {foundationCows.length === 0 && (
                    <p className="text-muted-foreground text-sm py-10">No cattle match the current filters</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 border-t border-saffron/10 bg-muted/10">
            {[
              { color: "bg-green-400", label: "Milking" },
              { color: "bg-pink-400", label: "Pregnant" },
              { color: "bg-cyan-400", label: "Calf" },
              { color: "bg-[#1B3A6B]", label: "Bull" },
              { color: "bg-gray-300", label: "Dry" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{l.label}</span>
              </div>
            ))}
            <div className="w-px h-3 bg-saffron/15" />
            <div className="flex items-center gap-1">
              <div className="w-4 h-0 border-t-2 border-saffron/40" />
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">Mother → Child</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-saffron" />
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">Female</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded border-2 border-navy" />
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">Male</span>
            </div>
          </div>
        </div>
      )}

      {/* ───── Generation View ───── */}
      {viewMode === "generation" && (
        <div className="space-y-4">
          {[...new Set(filteredCows.map(c => c.generation))].sort().map(gen => {
            const genCows = filteredCows.filter(c => c.generation === gen);
            if (genCows.length === 0) return null;
            const genLabels: Record<number, string> = {
              1: "Foundation (Gen 1)",
              2: "Gen 2",
              3: "Gen 3",
              4: "Gen 4",
              5: "Gen 5",
            };
            return (
              <div key={gen} className="bg-white rounded-xl border border-saffron/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-saffron" />
                  <h3>{genLabels[gen] ?? `Gen ${gen}`}</h3>
                  <span style={{ fontSize: '0.7rem' }} className="bg-saffron/10 text-saffron px-2 py-0.5 rounded-full">{genCows.length} cows</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {genCows.map(cow => (
                    <CowTile key={cow.tag_number} cow={cow} onClick={setSelectedCow} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───── Grid View ───── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {filteredCows.map(cow => (
            <CowTile key={cow.tag_number} cow={cow} onClick={setSelectedCow} />
          ))}
          {filteredCows.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">No cattle match the current filters</div>
          )}
        </div>
      )}

      {/* ───── Cow Card (Full Profile Modal) ───── */}
      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={genealogyCowToCow(selectedCow)} onClose={() => setSelectedCow(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tree Node ─── */

function VisualTreeNode({
  cow, onSelect, onFocus, getChildren, depth, maxDepth,
}: {
  cow: GenealogyCattle;
  onSelect: (c: GenealogyCattle) => void;
  onFocus: (c: GenealogyCattle) => void;
  getChildren: (tag: string) => GenealogyCattle[];
  depth: number;
  maxDepth: number;
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const children = useMemo(() => getChildren(cow.tag_number), [cow.tag_number, getChildren]);
  const hasChildren = children.length > 0;
  const atMaxDepth = depth >= maxDepth;
  const status = deriveStatus(cow);

  const showChildren = hasChildren && !collapsed && !atMaxDepth;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: depth * 0.04, duration: 0.25 }}
          className={`
            flex flex-col items-center bg-white rounded-xl border border-saffron/10
            px-2.5 py-2 shadow-sm hover:shadow-md hover:shadow-saffron/10 transition-all cursor-pointer
            min-w-[80px]
          `}
          onClick={() => onSelect(cow)}
        >
          <div className={`relative w-11 h-11 ${cow.gender === "Female" ? "rounded-full" : "rounded-lg"} overflow-hidden ring-[2.5px] shadow-md ${STATUS_RING[status] || "ring-gray-300"}`}>
            <div className="w-full h-full bg-gradient-to-br from-saffron/20 to-navy/20 flex items-center justify-center text-[0.9rem] font-bold text-saffron">
              {cow.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${STATUS_BG[status] || "bg-gray-400"} border-2 border-white`} />
          </div>

          <p style={{ fontSize: '0.7rem', fontWeight: 600 }} className="mt-1 text-center max-w-[70px] truncate">{cow.name}</p>
          <p style={{ fontSize: '0.5rem' }} className="text-muted-foreground">{cow.tag_number}</p>

          {hasChildren && (
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-white shadow-sm z-10 ${collapsed || atMaxDepth ? "bg-saffron/80 border-saffron" : "bg-navy/80 border-navy"
              }`}>
              <Baby className="w-2.5 h-2.5" />
              <span style={{ fontSize: '0.5rem', fontWeight: 600 }}>{children.length}</span>
            </div>
          )}
        </motion.div>

        <div className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 z-10">
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
              className="w-5 h-5 rounded-full bg-white border border-saffron/20 shadow flex items-center justify-center hover:bg-saffron/10 transition-colors"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronDown className="w-3 h-3 text-saffron" /> : <ChevronRight className="w-3 h-3 text-saffron rotate-90" />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(cow); }}
            className="w-5 h-5 rounded-full bg-white border border-navy/20 shadow flex items-center justify-center hover:bg-navy/10 transition-colors"
            title="Focus on this cow"
          >
            <Focus className="w-3 h-3 text-navy" />
          </button>
        </div>
      </div>

      {showChildren && (
        <>
          <div className="w-0.5 bg-gradient-to-b from-saffron/40 to-saffron/20" style={{ height: 24 }} />
          {children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-0.5 bg-saffron/25 absolute top-0"
                style={{
                  width: `calc(100% - 80px)`,
                  maxWidth: `${(children.length - 1) * 110}px`,
                }}
              />
            </div>
          )}

          <div className="flex items-start gap-2 pt-0">
            {children.map((child, i) => (
              <div key={child.tag_number} className="flex flex-col items-center">
                <div className="w-0.5 bg-saffron/25" style={{ height: children.length > 1 ? 12 : 0 }} />
                <VisualTreeNode
                  cow={child}
                  onSelect={onSelect}
                  onFocus={onFocus}
                  getChildren={getChildren}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {hasChildren && (collapsed || atMaxDepth) && (
        <button
          onClick={() => {
            if (atMaxDepth) {
              onFocus(cow);
            } else {
              setCollapsed(false);
            }
          }}
          className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted transition-colors border border-saffron/10"
        >
          <ChevronDown className="w-3 h-3 text-saffron" />
          <span style={{ fontSize: '0.55rem' }} className="text-muted-foreground">
            {atMaxDepth ? `Focus to see ${children.length} more` : `${children.length} children`}
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── Cow Tile ─── */

function CowTile({ cow, onClick }: { cow: GenealogyCattle; onClick: (c: GenealogyCattle) => void }) {
  const status = deriveStatus(cow);

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={() => onClick(cow)}
      className="bg-white rounded-xl border border-saffron/10 p-2.5 hover:shadow-md hover:shadow-saffron/10 transition-shadow flex flex-col items-center"
    >
      <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${cow.gender === "Female" ? "border-saffron/30" : "border-navy/30"} bg-gradient-to-br from-saffron/10 to-navy/10 flex items-center justify-center`}>
        <span className="text-[0.8rem] font-bold text-saffron">{cow.name.charAt(0).toUpperCase()}</span>
      </div>
      <p style={{ fontSize: '0.7rem', fontWeight: 600 }} className="mt-1 truncate w-full text-center">{cow.name}</p>
      <p style={{ fontSize: '0.55rem' }} className="text-muted-foreground">{cow.tag_number}</p>
      <span style={{ fontSize: '0.5rem' }} className={`px-1.5 py-0.5 rounded-full mt-0.5 ${STATUS_TILE[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    </motion.button>
  );
}

/* ─── Helper: convert GenealogyCattle → Cow ─── */

function genealogyCowToCow(g: GenealogyCattle): Cow {
  return {
    id: g.tag_number,
    tagNumber: g.tag_number,
    name: g.name,
    breed: "Gir",
    dateOfBirth: g.date_of_birth ?? "",
    gender: g.gender === "Male" ? "Male" : "Female",
    weight: 0,
    source: "Natural Birth",
    status: deriveStatus(g) as Cow["status"],
    motherId: g.mother_tag_number ?? null,
    fatherId: g.father_tag_number ?? null,
    image: "",
    milkOutput: [],
    weightHistory: [],
    healthStatus: "Healthy",
    lastVaccination: "",
    nextVaccination: "",
    dailyMilk: g.is_milking === 1 ? 1 : 0,
    notes: "",
    generation: g.generation ?? 1,
    breedScore: {
      headShape: 0, hornCurvature: 0, earShape: 0, humpSize: 0,
      dewlap: 0, bodyFrame: 0, udderShape: 0, coatColor: 0,
      tailLength: 0, overallConformation: 0,
    },
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
}
