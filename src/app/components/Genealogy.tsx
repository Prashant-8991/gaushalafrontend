import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, GitBranch, ChevronDown, ChevronRight, Layers, ZoomIn,
  ZoomOut, Maximize2, X, AlertTriangle, SlidersHorizontal, Focus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CowCard } from "./CowCard";
import type { Cow } from "../data/mockData";
import { CowIcon, Female, Male, PregnantIcon, MilkDrop, Bull, Calf } from "./icons/icons";
import { PageLoader } from "./ui/loader";

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

const STATUS_META: Record<string, { ring: string; dot: string; bg: string; text: string; label: string; icon: React.ReactNode }> = {
  Milking:  { ring: "ring-success/40",   dot: "bg-success",   bg: "bg-success/10 text-success border-success/20",                          text: "text-success",   label: "Milking",  icon: <MilkDrop size={9} strokeWidth={2} /> },
  Pregnant: { ring: "ring-pink-400/40",  dot: "bg-pink-500",   bg: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-300",   text: "text-pink-600",  label: "Pregnant", icon: <PregnantIcon size={9} strokeWidth={2} /> },
  Dry:      { ring: "ring-muted-foreground/20", dot: "bg-muted-foreground", bg: "bg-muted text-muted-foreground border-border",                text: "text-muted-foreground", label: "Dry", icon: <CowIcon size={9} strokeWidth={2} /> },
  Calf:     { ring: "ring-info/40",      dot: "bg-info",       bg: "bg-info/10 text-info border-info/20",                                text: "text-info",      label: "Calf",     icon: <Calf size={9} strokeWidth={2} /> },
  Bull:     { ring: "ring-navy/40",      dot: "bg-navy",       bg: "bg-navy/10 text-navy border-navy/20 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20", text: "text-navy", label: "Bull", icon: <Bull size={9} strokeWidth={2} /> },
};

const ACQUISITION_TYPES = ["BIRTH", "બહારથી આવેલ", "DONATION", "આંધળી ગાય", "PURCHASED"];
const ANIMAL_TYPES = ["BULL", "COW", "OX", "MALE CALF", "FEMALE CALF", "આજીવન મા બની શકશે નહી"];

const ANIMAL_META: Record<string, { icon: React.ReactNode; color: string }> = {
  BULL:          { icon: <Bull size={11} strokeWidth={1.6} />,    color: "text-navy dark:text-blue-300" },
  COW:           { icon: <CowIcon size={11} strokeWidth={1.6} />, color: "text-saffron" },
  OX:            { icon: <Bull size={11} strokeWidth={1.6} />,    color: "text-muted-foreground" },
  "MALE CALF":   { icon: <Calf size={11} strokeWidth={1.6} />,    color: "text-navy dark:text-blue-300" },
  "FEMALE CALF": { icon: <Calf size={11} strokeWidth={1.6} />,    color: "text-saffron" },
};

export function Genealogy() {
  const [selectedCow, setSelectedCow] = useState<GenealogyCattle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [focusedRoot, setFocusedRoot] = useState<GenealogyCattle | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maxDepth, setMaxDepth] = useState(3);
  const [showFilters, setShowFilters] = useState(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const [presentFilter, setPresentFilter] = useState<boolean>(true);
  const [milkingFilter, setMilkingFilter] = useState<boolean | null>(null);
  const [pregnantFilter, setPregnantFilter] = useState<boolean | null>(null);

  const { data: cattleList, isLoading, error } = useQuery<GenealogyCattle[]>({
    queryKey: ["genealogy-all"],
    queryFn: () => { const base = import.meta.env.VITE_API_URL || "http://localhost:8000"; return fetch(`${base}/genealogy/all`).then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }) },
  });

  const cows = cattleList ?? [];

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

  const filteredCows = useMemo(() => cows.filter(c => {
    const matchSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPresent = !presentFilter || c.is_present === 1;
    const matchMilking = milkingFilter === null || (milkingFilter ? c.is_milking === 1 : c.is_milking === 0 || c.is_milking === null);
    const matchPregnant = pregnantFilter === null || (pregnantFilter ? c.is_pregnant === 1 : c.is_pregnant === 0 || c.is_pregnant === null);
    return matchSearch && matchPresent && matchMilking && matchPregnant;
  }), [cows, searchTerm, presentFilter, milkingFilter, pregnantFilter]);

  const foundationCows = useMemo(() =>
    filteredCows.filter(c => c.mother_tag_number === null && c.father_tag_number === null),
    [filteredCows],
  );

  const activeFilterCount = (milkingFilter !== null ? 1 : 0) + (pregnantFilter !== null ? 1 : 0);

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.min(1.5, Math.max(0.3, z + delta)));
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return cows.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tag_number.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [searchTerm, cows]);

  if (isLoading) return <PageLoader label="Loading genealogy…" />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="surface p-8 text-center max-w-md"
        >
          <AlertTriangle className="w-8 h-8 text-destructive/70 mx-auto mb-3" />
          <p className="font-medium">Failed to load</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
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
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-3"
      >
        <div>
          <p className="eyebrow">Pedigree</p>
          <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] mt-1">
            Genealogy & family trees
          </h1>
          <p className="text-[0.82rem] text-muted-foreground mt-1 tabular">
            {cows.length} cattle · {Math.max(...cows.map(c => c.generation ?? 1), 1)} generations
          </p>
        </div>
        <div className="inline-flex p-0.5 rounded-md bg-muted border border-border">
          {([
            { k: "tree" as const, l: "Tree" },
            { k: "generation" as const, l: "By generation" },
            { k: "grid" as const, l: "Grid" },
          ]).map(m => (
            <button
              key={m.k} onClick={() => setViewMode(m.k)}
              className={`h-7 px-3 rounded text-[0.78rem] font-medium transition-colors ${
                viewMode === m.k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >{m.l}</button>
          ))}
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text" placeholder="Search by name or tag…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-[0.85rem] outline-none transition focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 placeholder:text-muted-foreground/40"
          />
          {viewMode === "tree" && searchResults.length > 0 && searchTerm.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 surface-elevated max-h-60 overflow-y-auto z-20 p-1">
              <p className="px-3 pt-2 pb-1 eyebrow">Focus family tree</p>
              {searchResults.map(cow => (
                <button
                  key={cow.tag_number}
                  onClick={() => { setFocusedRoot(cow); setSearchTerm(""); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted rounded-md transition-colors text-left"
                >
                  <CattleAvatar cow={cow} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium text-foreground truncate">{cow.name}</p>
                    <p className="text-[0.7rem] text-muted-foreground tabular">
                      {cow.tag_number} · Gen {cow.generation} · {deriveStatus(cow)}
                    </p>
                  </div>
                  <Focus className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 rounded-md text-[0.82rem] font-medium transition-colors flex items-center gap-1.5 ${
            showFilters ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
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
                <p className="text-[0.85rem] font-semibold text-foreground">Refine</p>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setMilkingFilter(null); setPregnantFilter(null); }} className="text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <FilterRow label="Status">
                <FilterChip active={presentFilter} onClick={() => setPresentFilter(true)}>Present</FilterChip>
                <FilterChip active={!presentFilter} onClick={() => setPresentFilter(false)}>Not present</FilterChip>
                <FilterChip active={milkingFilter === true} onClick={() => setMilkingFilter(milkingFilter === true ? null : true)}>
                  <MilkDrop size={11} strokeWidth={1.8} /> Milking
                </FilterChip>
                <FilterChip active={milkingFilter === false} onClick={() => setMilkingFilter(milkingFilter === false ? null : false)}>Not milking</FilterChip>
                <FilterChip active={pregnantFilter === true} onClick={() => setPregnantFilter(pregnantFilter === true ? null : true)}>
                  <PregnantIcon size={11} strokeWidth={1.8} /> Pregnant
                </FilterChip>
                <FilterChip active={pregnantFilter === false} onClick={() => setPregnantFilter(pregnantFilter === false ? null : false)}>Not pregnant</FilterChip>
              </FilterRow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree View */}
      {viewMode === "tree" && (
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {focusedRoot ? (
                <div className="flex items-center gap-2 bg-saffron/10 border border-saffron/20 rounded-md px-2.5 py-1">
                  <CattleAvatar cow={focusedRoot} size="xs" />
                  <span className="text-[0.78rem] font-medium text-saffron-dark dark:text-saffron">
                    {focusedRoot.name}'s lineage
                  </span>
                  <button onClick={() => setFocusedRoot(null)} className="hover:bg-saffron/20 rounded p-0.5 transition-colors">
                    <X className="w-3 h-3 text-saffron" />
                  </button>
                </div>
              ) : (
                <span className="text-[0.78rem] text-muted-foreground truncate">
                  {foundationCows.length} foundation lineages · top-down
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="eyebrow mr-1">Depth</span>
              {[2, 3, 4, 5].map(d => (
                <button
                  key={d} onClick={() => setMaxDepth(d)}
                  className={`w-6 h-6 rounded text-[0.7rem] font-medium transition-colors ${
                    maxDepth === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >{d}</button>
              ))}
              <div className="w-px h-4 bg-border mx-1" />
              <button onClick={() => handleZoom(-0.15)} className="h-7 w-7 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-[0.7rem] text-muted-foreground w-9 text-center metric">{Math.round(zoom * 100)}%</span>
              <button onClick={() => handleZoom(0.15)} className="h-7 w-7 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => setZoom(1)} className="h-7 w-7 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors">
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div
            ref={treeContainerRef}
            className="overflow-auto p-6 bg-muted/30"
            style={{ maxHeight: "70vh" }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease-out" }}>
              {focusedRoot ? (
                <div className="flex justify-center">
                  <VisualTreeNode cow={focusedRoot} onSelect={setSelectedCow} onFocus={setFocusedRoot} getChildren={getChildren} depth={0} maxDepth={maxDepth} />
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-10">
                  {foundationCows.map(cow => (
                    <div key={cow.tag_number} className="flex flex-col items-center">
                      <VisualTreeNode cow={cow} onSelect={setSelectedCow} onFocus={setFocusedRoot} getChildren={getChildren} depth={0} maxDepth={maxDepth} />
                    </div>
                  ))}
                  {foundationCows.length === 0 && (
                    <p className="text-muted-foreground text-sm py-10">No cattle match the filters</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2 border-t border-border bg-muted/20">
            {(Object.entries(STATUS_META)).map(([k, m]) => (
              <div key={k} className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation View */}
      {viewMode === "generation" && (
        <div className="space-y-3">
          {[...new Set(filteredCows.map(c => c.generation))].sort().map(gen => {
            const genCows = filteredCows.filter(c => c.generation === gen);
            if (genCows.length === 0) return null;
            const genLabels: Record<number, string> = { 1: "Foundation", 2: "Gen 2", 3: "Gen 3", 4: "Gen 4", 5: "Gen 5" };
            return (
              <div key={gen} className="surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-saffron" />
                    <h3 className="text-[0.95rem] font-semibold text-foreground">{genLabels[gen] ?? `Gen ${gen}`}</h3>
                  </div>
                  <span className="text-[0.75rem] text-muted-foreground tabular">{genCows.length} cattle</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-2">
                  {genCows.map(cow => (
                    <CowTile key={cow.tag_number} cow={cow} onClick={setSelectedCow} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        filteredCows.length === 0 ? (
          <div className="surface py-16 text-center">
            <p className="text-muted-foreground">No cattle match the filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-2">
            {filteredCows.map(cow => (
              <CowTile key={cow.tag_number} cow={cow} onClick={setSelectedCow} />
            ))}
          </div>
        )
      )}

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={genealogyCowToCow(selectedCow)} onClose={() => setSelectedCow(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Cattle Avatar (replaces emojis) ─── */

function CattleAvatar({ cow, size = "md" }: { cow: GenealogyCattle; size?: "xs" | "sm" | "md" | "lg" }) {
  const status = deriveStatus(cow);
  const meta = STATUS_META[status];
  const sizes = { xs: "w-5 h-5", sm: "w-7 h-7", md: "w-9 h-9", lg: "w-11 h-11" };
  const iconSizes = { xs: 10, sm: 13, md: 16, lg: 20 };
  const isFemale = cow.gender !== "Male";
  return (
    <div className={`relative ${sizes[size]} rounded-md flex items-center justify-center shrink-0 ${
      isFemale
        ? "bg-saffron/10 text-saffron ring-1 ring-saffron/20"
        : "bg-navy/10 text-navy ring-1 ring-navy/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20"
    } ${meta.ring}`}>
      {isFemale ? <CowIcon size={iconSizes[size]} strokeWidth={1.6} /> : <Male size={iconSizes[size]} strokeWidth={1.6} />}
      <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${meta.dot} ring-2 ring-card`} />
    </div>
  );
}

/* ─── Tree node ─── */

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
  const showChildren = hasChildren && !collapsed && !atMaxDepth;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: depth * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onSelect(cow)}
          className="flex flex-col items-center surface px-2.5 py-2 hover-lift cursor-pointer min-w-[88px] focus-ring"
        >
          <CattleAvatar cow={cow} size="md" />
          <p className="text-[0.72rem] font-semibold mt-1.5 text-center max-w-[80px] truncate text-foreground">{cow.name}</p>
          <p className="text-[0.6rem] text-muted-foreground font-mono">{cow.tag_number}</p>

          {hasChildren && (
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border z-10 ${
              collapsed || atMaxDepth
                ? "bg-saffron text-white border-saffron"
                : "bg-foreground text-background border-foreground"
            }`}>
              <span className="text-[0.55rem] font-semibold tabular">{children.length}</span>
            </div>
          )}
        </motion.button>

        <div className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 z-10">
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
              className="w-5 h-5 rounded-md bg-card border border-border shadow flex items-center justify-center hover:bg-muted transition-colors"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground rotate-90" />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(cow); }}
            className="w-5 h-5 rounded-md bg-card border border-border shadow flex items-center justify-center hover:bg-muted transition-colors"
            title="Focus on this cow"
          >
            <Focus className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showChildren && (
        <>
          <div className="w-px bg-border" style={{ height: 20 }} />
          {children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-px bg-border absolute top-0"
                style={{
                  width: `calc(100% - 88px)`,
                  maxWidth: `${(children.length - 1) * 110}px`,
                }}
              />
            </div>
          )}

          <div className="flex items-start gap-2 pt-0">
            {children.map((child) => (
              <div key={child.tag_number} className="flex flex-col items-center">
                <div className="w-px bg-border" style={{ height: children.length > 1 ? 12 : 0 }} />
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
          onClick={() => { if (atMaxDepth) onFocus(cow); else setCollapsed(false); }}
          className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted hover:bg-muted/70 transition-colors text-muted-foreground"
        >
          <ChevronDown className="w-3 h-3" />
          <span className="text-[0.65rem] font-medium">
            {atMaxDepth ? `Focus · ${children.length} more` : `${children.length} children`}
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── Cow Tile ─── */

function CowTile({ cow, onClick }: { cow: GenealogyCattle; onClick: (c: GenealogyCattle) => void }) {
  const status = deriveStatus(cow);
  const meta = STATUS_META[status];
  return (
    <motion.button
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick(cow)}
      className="surface p-2.5 hover-lift flex flex-col items-center group"
    >
      <CattleAvatar cow={cow} size="md" />
      <p className="text-[0.72rem] font-semibold mt-1.5 truncate w-full text-center text-foreground">{cow.name}</p>
      <p className="text-[0.6rem] text-muted-foreground font-mono">{cow.tag_number}</p>
      <span className={`mt-1 inline-flex items-center gap-1 text-[0.6rem] font-medium px-1.5 py-0.5 rounded border ${meta.bg}`}>
        {meta.icon} {status}
      </span>
    </motion.button>
  );
}

/* ─── Helpers ─── */

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
