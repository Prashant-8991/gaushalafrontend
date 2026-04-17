import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, GitBranch, ChevronDown, ChevronRight,
  Baby, Layers, ZoomIn, ZoomOut, Maximize2, Focus, X, Droplets,
} from "lucide-react";
import { cows, Cow, getChildren } from "../data/mockData";
import { CowCard } from "./CowCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type ViewMode = "tree" | "grid" | "generation";

export function Genealogy() {
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGen, setFilterGen] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [focusedRoot, setFocusedRoot] = useState<Cow | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [maxDepth, setMaxDepth] = useState(3);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const statuses = ["All", "Milking", "Pregnant", "Calf", "Bull", "Dry", "Deceased"];
  const generations = ["All", "0", "1", "2", "3", "4"];
  const sources = ["All", "Natural Birth", "Donated", "Sperm Donation", "Purchased"];

  const filteredCows = useMemo(() => {
    return cows.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.tagNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "All" || c.status === filterStatus;
      const matchGen = filterGen === "All" || c.generation.toString() === filterGen;
      const matchSource = filterSource === "All" || c.source === filterSource;
      return matchSearch && matchStatus && matchGen && matchSource;
    });
  }, [searchTerm, filterStatus, filterGen, filterSource]);

  const foundationCows = useMemo(() =>
    cows.filter(c => c.motherId === null && c.fatherId === null && c.generation === 0),
    []);

  const handleSelectCow = (cow: Cow) => setSelectedCow(cow);

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.min(1.5, Math.max(0.3, z + delta)));
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return cows.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [searchTerm]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-saffron" />
            Cow Genealogy &amp; Family Trees
          </h1>
          <p style={{ fontSize: '0.8rem' }} className="text-muted-foreground mt-0.5">
            {cows.length} Gir cows across 5 generations. Click any cow to view their full profile card.
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

      <div className="flex flex-wrap gap-2 bg-white rounded-xl border border-saffron/10 p-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or tag..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-muted/50 border border-saffron/10 focus:outline-none focus:ring-2 focus:ring-saffron/30"
            style={{ fontSize: '0.8rem' }} />
          {viewMode === "tree" && searchResults.length > 0 && searchTerm.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-saffron/15 shadow-lg z-20 max-h-60 overflow-y-auto">
              <p style={{ fontSize: '0.65rem' }} className="px-3 pt-2 pb-1 text-muted-foreground">Click to focus family tree on this cow</p>
              {searchResults.map(cow => (
                <button key={cow.id}
                  onClick={() => { setFocusedRoot(cow); setSearchTerm(""); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-saffron/5 transition-colors text-left">
                  <ImageWithFallback src={cow.image} alt={cow.name} className="w-7 h-7 rounded-full object-cover border border-saffron/20" />
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 500 }}>{cow.name}</p>
                    <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">{cow.tagNumber} &bull; Gen {cow.generation} &bull; {cow.status}</p>
                  </div>
                  <Focus className="w-3.5 h-3.5 text-saffron ml-auto" />
                </button>
              ))}
            </div>
          )}
        </div>
        {viewMode !== "tree" && (
          <>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
              style={{ fontSize: '0.8rem' }}>
              {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <select value={filterGen} onChange={e => setFilterGen(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
              style={{ fontSize: '0.8rem' }}>
              {generations.map(g => <option key={g} value={g}>{g === "All" ? "All Gens" : `Gen ${g}`}</option>)}
            </select>
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
              style={{ fontSize: '0.8rem' }}>
              {sources.map(s => <option key={s} value={s}>{s === "All" ? "All Sources" : s}</option>)}
            </select>
          </>
        )}
        <div className="flex items-center gap-1 px-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span style={{ fontSize: '0.75rem' }} className="text-muted-foreground">
            {viewMode === "tree" ? `${cows.length} total` : `${filteredCows.length} results`}
          </span>
        </div>
      </div>

      {viewMode === "tree" && (
        <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden">
          {/* Tree toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-saffron/10 bg-muted/20">
            <div className="flex items-center gap-2">
              {focusedRoot ? (
                <div className="flex items-center gap-2 bg-saffron/10 rounded-lg px-2.5 py-1">
                  <ImageWithFallback src={focusedRoot.image} alt={focusedRoot.name}
                    className="w-5 h-5 rounded-full object-cover border border-saffron/30" />
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
                  <VisualTreeNode cow={focusedRoot} onSelect={handleSelectCow} onFocus={setFocusedRoot} depth={0} maxDepth={maxDepth} />
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-12">
                  {foundationCows.map(cow => (
                    <div key={cow.id} className="flex flex-col items-center">
                      <VisualTreeNode cow={cow} onSelect={handleSelectCow} onFocus={setFocusedRoot} depth={0} maxDepth={maxDepth} />
                    </div>
                  ))}
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
              { color: "bg-gray-500", label: "Deceased" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">{l.label}</span>
              </div>
            ))}
            <div className="w-px h-3 bg-saffron/15" />
            <div className="flex items-center gap-1">
              <div className="w-4 h-0 border-t-2 border-saffron/40" />
              <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">Parent → Child</span>
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

      {viewMode === "generation" && (
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map(gen => {
            const genCows = filteredCows.filter(c => c.generation === gen);
            if (genCows.length === 0) return null;
            const genLabels = ["Foundation (2013-2017)", "Gen 1 (2017-2020)", "Gen 2 (2020-2023)", "Gen 3 (2023-2025)", "Gen 4 - Calves (2025-2026)"];
            return (
              <div key={gen} className="bg-white rounded-xl border border-saffron/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-saffron" />
                  <h3>{genLabels[gen]}</h3>
                  <span style={{ fontSize: '0.7rem' }} className="bg-saffron/10 text-saffron px-2 py-0.5 rounded-full">{genCows.length} cows</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {genCows.map(cow => (
                    <CowTile key={cow.id} cow={cow} onClick={handleSelectCow} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {filteredCows.map(cow => (
            <CowTile key={cow.id} cow={cow} onClick={handleSelectCow} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>
    </div>
  );
}

function VisualTreeNode({
  cow, onSelect, onFocus, depth, maxDepth,
}: {
  cow: Cow;
  onSelect: (c: Cow) => void;
  onFocus: (c: Cow) => void;
  depth: number;
  maxDepth: number;
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const children = useMemo(() => getChildren(cow.id), [cow.id]);
  const hasChildren = children.length > 0;
  const atMaxDepth = depth >= maxDepth;

  const statusRingColors: Record<string, string> = {
    Milking: "ring-green-400 shadow-green-400/20",
    Pregnant: "ring-pink-400 shadow-pink-400/20",
    Dry: "ring-gray-300 shadow-gray-300/20",
    Calf: "ring-cyan-400 shadow-cyan-400/20",
    Bull: "ring-[#1B3A6B] shadow-[#1B3A6B]/20",
    Deceased: "ring-gray-500 shadow-gray-500/20",
  };

  const statusBgColors: Record<string, string> = {
    Milking: "bg-green-500",
    Pregnant: "bg-pink-500",
    Dry: "bg-gray-400",
    Calf: "bg-cyan-500",
    Bull: "bg-[#1B3A6B]",
    Deceased: "bg-gray-500",
  };

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
          <div className={`relative w-11 h-11 ${cow.gender === "Female" ? "rounded-full" : "rounded-lg"} overflow-hidden ring-[2.5px] shadow-md ${statusRingColors[cow.status] || "ring-gray-300"}`}>
            <ImageWithFallback src={cow.image} alt={cow.name} className="w-full h-full object-cover" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${statusBgColors[cow.status] || "bg-gray-400"} border-2 border-white`} />
          </div>

          <p style={{ fontSize: '0.7rem', fontWeight: 600 }} className="mt-1 text-center max-w-[70px] truncate">{cow.name}</p>
          <p style={{ fontSize: '0.5rem' }} className="text-muted-foreground">{cow.tagNumber}</p>

          <div className="flex items-center gap-1 mt-0.5">
            {cow.dailyMilk > 0 && (
              <span className="flex items-center gap-0.5 text-saffron" style={{ fontSize: '0.5rem' }}>
                <Droplets className="w-2.5 h-2.5" />{cow.dailyMilk}L
              </span>
            )}
            <span className="text-muted-foreground" style={{ fontSize: '0.5rem' }}>{cow.totalBreedScore}/10</span>
          </div>

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
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-0.5 bg-saffron/25" style={{ height: children.length > 1 ? 12 : 0 }} />
                <VisualTreeNode
                  cow={child}
                  onSelect={onSelect}
                  onFocus={onFocus}
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

function CowTile({ cow, onClick }: { cow: Cow; onClick: (c: Cow) => void }) {
  const statusColors: Record<string, string> = {
    Milking: "bg-green-100 text-green-700",
    Pregnant: "bg-pink-100 text-pink-700",
    Calf: "bg-cyan-100 text-cyan-700",
    Bull: "bg-blue-100 text-navy",
    Dry: "bg-gray-100 text-gray-600",
    Deceased: "bg-gray-100 text-gray-600",
  };

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={() => onClick(cow)}
      className="bg-white rounded-xl border border-saffron/10 p-2.5 hover:shadow-md hover:shadow-saffron/10 transition-shadow flex flex-col items-center"
    >
      <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${cow.gender === "Female" ? "border-saffron/30" : "border-navy/30"}`}>
        <ImageWithFallback src={cow.image} alt={cow.name} className="w-full h-full object-cover" />
      </div>
      <p style={{ fontSize: '0.7rem', fontWeight: 600 }} className="mt-1 truncate w-full text-center">{cow.name}</p>
      <p style={{ fontSize: '0.55rem' }} className="text-muted-foreground">{cow.tagNumber}</p>
      <span style={{ fontSize: '0.5rem' }} className={`px-1.5 py-0.5 rounded-full mt-0.5 ${statusColors[cow.status] || "bg-gray-100 text-gray-600"}`}>
        {cow.status}
      </span>
      <div className="w-full mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-saffron to-navy"
          style={{ width: `${cow.totalBreedScore * 10}%` }} />
      </div>
      <span style={{ fontSize: '0.5rem' }} className="text-muted-foreground mt-0.5">{cow.totalBreedScore}/10</span>
    </motion.button>
  );
}