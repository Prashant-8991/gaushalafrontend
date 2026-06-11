import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, AlertTriangle, CheckCircle, Clock, Syringe, Filter, Search, Calendar,
  ChevronLeft, ChevronRight, ChevronDown, CheckSquare, Square, X, Send, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLoader } from "./ui/loader";

interface VaccineAlert {
  tag_number: string;
  cattle_name: string;
  name: string;
  data: string;
  last_vaccination: string;
  next_date: string;
}

const VACCINE_API = "http://10.83.29.77:8000/cattle_vaccine";
const LOCAL_API = "http://localhost:8000";

const VACCINE_META: Record<string, { color: string; bg: string; ring: string; abbr: string }> = {
  FMD:          { color: "text-info dark:text-blue-300",     bg: "bg-info/10 dark:bg-blue-500/10",       ring: "ring-info/20 dark:ring-blue-500/20",     abbr: "FMD" },
  "H.S.":       { color: "text-purple-600 dark:text-purple-300", bg: "bg-purple-500/10 dark:bg-purple-500/10", ring: "ring-purple-500/20 dark:ring-purple-500/20", abbr: "HS" },
  Brucellosis:  { color: "text-success dark:text-emerald-300", bg: "bg-success/10 dark:bg-emerald-500/10",   ring: "ring-success/20 dark:ring-emerald-500/20", abbr: "BRC" },
};

const PAGE_SIZES = [10, 25, 50];

function AlertGroup({
  title, alerts, badge, onDoneClick, defaultPageSize, defaultExpanded,
  selected, onToggleSelect,
}: {
  title: string;
  alerts: VaccineAlert[];
  badge: { color: string; bg: string; ring: string; icon: typeof Clock; label: string };
  vaccineMeta: typeof VACCINE_META;
  onDoneClick: (key: string) => void;
  defaultPageSize: number;
  defaultExpanded: boolean;
  selected: Set<string>;
  onToggleSelect: (key: string) => void;
}) {
  const BadgeIcon = badge.icon;
  const [collapsed, setCollapsed] = useState(!defaultExpanded);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const sectionRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(alerts.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = alerts.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const isLastPage = safePage >= totalPages - 1;

  return (
    <div ref={sectionRef}>
      <button
        onClick={() => { setCollapsed(!collapsed); setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg surface hover-lift mb-2 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${title === "Overdue" ? "bg-destructive" : title === "Due Today" ? "bg-warning" : title === "Due This Week" ? "bg-warning/70" : "bg-info"}`} />
          <h3 className="text-[0.92rem] font-semibold text-foreground">{title}</h3>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.7rem] font-medium ${badge.bg} ${badge.color} ring-1 ${badge.ring}`}>
            <BadgeIcon className="w-2.5 h-2.5" strokeWidth={2.4} />
            {alerts.length}
          </span>
        </div>
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              <AnimatePresence>
                {pageItems.map((alert, index) => {
                  const meta = VACCINE_META[alert.name] || { color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", abbr: alert.name?.slice(0, 3).toUpperCase() ?? "—" };
                  const selKey = `${alert.tag_number}-${alert.name}`;
                  const isSelected = selected.has(selKey);
                  return (
                    <motion.div
                      key={selKey}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.015, duration: 0.2 }}
                      className={`surface p-3.5 hover-lift h-full flex flex-col ${isSelected ? "ring-1 ring-foreground/40 border-foreground/30" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => onToggleSelect(selKey)}
                          className="shrink-0 mt-0.5 text-muted-foreground/30 hover:text-foreground transition-colors"
                        >
                          {isSelected
                            ? <CheckSquare className="w-4 h-4 text-foreground" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                        <div className={`w-8 h-8 rounded-md ${meta.bg} ${meta.color} ring-1 ${meta.ring} flex items-center justify-center shrink-0`}>
                          <Syringe className="w-3.5 h-3.5" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-[0.88rem] font-semibold truncate text-foreground">{alert.cattle_name || alert.tag_number}</h4>
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.62rem] font-medium ${badge.bg} ${badge.color}`}>
                              <BadgeIcon className="w-2.5 h-2.5" strokeWidth={2.4} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground mt-0.5 truncate">
                            {alert.name}{alert.data === "overdue" ? " · overdue" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                        <div>
                          <p className="eyebrow">Due</p>
                          <p className="text-[0.78rem] font-semibold text-foreground metric mt-0.5">
                            {new Date(alert.next_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDoneClick(selKey); }}
                          className="h-7 px-2.5 rounded-md bg-foreground text-background text-[0.72rem] font-medium hover:opacity-90 transition-opacity"
                        >
                          Mark done
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[0.65rem] font-semibold ${meta.color} px-1.5 py-0.5 rounded ${meta.bg} ring-1 ${meta.ring}`}>{meta.abbr}</span>
                        <span className="text-[0.65rem] text-muted-foreground truncate font-mono">{alert.tag_number}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {alerts.length > defaultPageSize && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <select
                  value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="h-7 px-2 rounded-md border border-border bg-card text-[0.72rem] outline-none focus:border-foreground/30"
                >
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setPage(0); }} disabled={safePage === 0}
                    className="h-7 px-2.5 rounded-md border border-border hover:bg-muted disabled:opacity-30 transition-colors text-[0.72rem]">First</button>
                  <button onClick={(e) => { e.stopPropagation(); setPage(Math.max(0, safePage - 1)); }} disabled={safePage === 0}
                    className="h-7 w-7 rounded-md hover:bg-muted disabled:opacity-30 transition-colors flex items-center justify-center">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[0.72rem] text-muted-foreground font-medium min-w-[3rem] text-center metric">{safePage + 1} / {totalPages}</span>
                  <button onClick={(e) => { e.stopPropagation(); setPage(Math.min(totalPages - 1, safePage + 1)); }} disabled={isLastPage}
                    className="h-7 w-7 rounded-md hover:bg-muted disabled:opacity-30 transition-colors flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setPage(totalPages - 1); }} disabled={isLastPage}
                    className="h-7 px-2.5 rounded-md border border-border hover:bg-muted disabled:opacity-30 transition-colors text-[0.72rem]">Last</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BatchVaccinateModal({
  open, selected, alerts, onClose, onConfirm,
}: {
  open: boolean;
  selected: Set<string>;
  alerts: VaccineAlert[];
  onClose: () => void;
  onConfirm: (records: { tag_number: string; vaccine_id: number; vaccinated_on: string }[]) => void;
}) {
  const [vaccinatedOn, setVaccinatedOn] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

  const selectedAlerts = alerts.filter((a) => selected.has(`${a.tag_number}-${a.name}`));
  const vaccineIdMap: Record<string, number> = { FMD: 1, "H.S.": 2, Brucellosis: 3, "Foot & Mouth Disease": 1, "Hemorrhagic Septicemia": 2 };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="surface-elevated max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-[0.95rem] font-semibold text-foreground">Batch vaccination</h3>
            <p className="text-[0.78rem] text-muted-foreground mt-0.5 tabular">{selectedAlerts.length} selected</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          <div>
            <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">Vaccination date</label>
            <input
              type="date" value={vaccinatedOn} onChange={(e) => setVaccinatedOn(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-border bg-background text-[0.85rem] outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-md p-2.5 bg-muted/30">
            {selectedAlerts.map((a) => {
              const meta = VACCINE_META[a.name] || { color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", abbr: a.name?.slice(0, 3).toUpperCase() ?? "—" };
              return (
                <div key={`${a.tag_number}-${a.name}`} className="flex items-center gap-2 text-[0.85rem] py-1">
                  <Syringe className={`w-3.5 h-3.5 ${meta.color}`} strokeWidth={1.8} />
                  <span className="font-medium text-foreground truncate">{a.cattle_name || a.tag_number}</span>
                  <span className={`text-[0.65rem] font-semibold ${meta.color} px-1.5 py-0.5 rounded ${meta.bg} ring-1 ${meta.ring}`}>{meta.abbr}</span>
                  {a.name === "Brucellosis" && <span className="text-[0.65rem] font-semibold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">updates record</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="h-8 px-3.5 rounded-md border border-border text-[0.85rem] text-foreground hover:bg-muted transition-colors font-medium"
          >Cancel</button>
          <button
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(selectedAlerts.map((a) => ({ tag_number: a.tag_number, vaccine_id: vaccineIdMap[a.name] || 1, vaccinated_on: vaccinatedOn })));
              setSubmitting(false);
            }}
            disabled={submitting}
            className="h-8 px-3.5 rounded-md bg-foreground text-background text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {submitting
              ? <><div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Saving…</>
              : <><Send className="w-3.5 h-3.5" /> Confirm</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export function Alerts() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterVaccine, setFilterVaccine] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchResult, setBatchResult] = useState<{ saved: number; failed: number } | null>(null);

  const { data, isLoading, isRefetching, refetch } = useQuery<VaccineAlert[]>({
    queryKey: ["cattleVaccine"],
    queryFn: () => fetch(VACCINE_API).then((r) => r.json()),
    refetchInterval: 30000,
  });

  const alerts = data || [];

  const grouped = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split("T")[0];
    const overdue: VaccineAlert[] = []; const dueToday: VaccineAlert[] = []; const dueThisWeek: VaccineAlert[] = []; const pending: VaccineAlert[] = [];
    for (const a of alerts) {
      if (searchTerm && !a.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) && !a.cattle_name.toLowerCase().includes(searchTerm.toLowerCase())) continue;
      if (filterStatus && a.data.toLowerCase() !== filterStatus.toLowerCase()) continue;
      if (filterVaccine && a.name !== filterVaccine) continue;
      if (a.data === "overdue") overdue.push(a);
      else if (a.next_date && a.next_date === today) dueToday.push(a);
      else if (a.next_date && a.next_date <= weekEndStr) dueThisWeek.push(a);
      else pending.push(a);
    }
    return { overdue, dueToday, dueThisWeek, pending };
  }, [alerts, searchTerm, filterStatus, filterVaccine]);

  const vaccineTypes = [...new Set(alerts.map((a) => a.name))];

  const handleDoneClick = (key: string) => {
    setSelected((prev) => { const next = new Set(prev); next.add(key); return next; });
    setShowBatchModal(true);
  };

  const handleBatchConfirm = async (records: { tag_number: string; vaccine_id: number; vaccinated_on: string }[]) => {
    try {
      const res = await fetch(`${LOCAL_API}/vaccination-batch`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(records),
      });
      const d = await res.json();
      setBatchResult(d);
      setSelected(new Set()); setShowBatchModal(false); refetch();
      setTimeout(() => setBatchResult(null), 4000);
    } catch (e) { console.error(e); }
  };

  const toggleSelect = (key: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const KPI_CARDS = [
    { key: "overdue",     icon: AlertTriangle, value: grouped.overdue.length,     label: "Overdue",       color: "destructive" },
    { key: "dueToday",    icon: Calendar,      value: grouped.dueToday.length,    label: "Due today",     color: "warning" },
    { key: "dueThisWeek", icon: Clock,         value: grouped.dueThisWeek.length, label: "Due this week", color: "amber" },
    { key: "pending",     icon: CheckCircle,   value: grouped.pending.length,     label: "Upcoming",      color: "info" },
    { key: "total",       icon: Syringe,       value: alerts.length,              label: "Total alerts",  color: "muted" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-3"
      >
        <div>
          <p className="eyebrow">Alerts</p>
          <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] mt-1 flex items-center gap-2">
            <Bell className="w-5 h-5 text-saffron" strokeWidth={1.6} />
            Alert center
          </h1>
          <p className="text-[0.82rem] text-muted-foreground mt-1">
            Select cards and vaccinate in batch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              className="h-8 px-3 rounded-md border border-border text-muted-foreground text-[0.8rem] hover:bg-muted transition-colors"
            >
              Clear ({selected.size})
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="h-8 px-3.5 rounded-md bg-foreground text-background text-[0.82rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            {isRefetching
              ? <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            Refresh
          </button>
        </div>
      </motion.div>

      {batchResult && (
        <div className={`surface p-3 flex items-center gap-2.5 ${batchResult.failed > 0 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
          {batchResult.failed > 0
            ? <AlertTriangle className="w-4 h-4 text-warning" />
            : <CheckCircle className="w-4 h-4 text-success" />
          }
          <p className="text-[0.85rem] font-medium text-foreground tabular">
            {batchResult.saved} saved{batchResult.failed > 0 ? `, ${batchResult.failed} failed` : ""}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        {KPI_CARDS.map((kpi) => (
          <SummaryCard key={kpi.key} icon={kpi.icon} value={kpi.value} label={kpi.label} color={kpi.color} />
        ))}
      </div>

      <div className="surface p-2.5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text" placeholder="Search by tag or name…"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-md bg-transparent text-[0.85rem] outline-none placeholder:text-muted-foreground/40 focus:bg-muted/40 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 pl-9 pr-7 rounded-md bg-muted/40 border border-border text-[0.85rem] outline-none appearance-none focus:bg-card focus:border-foreground/30 transition-colors"
          >
            <option value="">All status</option>
            <option value="overdue">Overdue</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <select
          value={filterVaccine} onChange={(e) => setFilterVaccine(e.target.value)}
          className="h-8 px-3 rounded-md bg-muted/40 border border-border text-[0.85rem] outline-none appearance-none focus:bg-card focus:border-foreground/30 transition-colors"
        >
          <option value="">All vaccines</option>
          {vaccineTypes.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {isLoading ? <PageLoader label="Loading alerts…" /> : !alerts.length ? (
        <div className="surface py-16 text-center">
          <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
          <p className="text-[0.95rem] font-semibold text-foreground">All caught up</p>
          <p className="text-[0.82rem] text-muted-foreground mt-1">No vaccine records found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.overdue.length > 0 && (
            <div data-section-title="Overdue">
              <AlertGroup
                title="Overdue" alerts={grouped.overdue}
                badge={{ color: "text-destructive", bg: "bg-destructive/8", ring: "ring-destructive/20", icon: AlertTriangle, label: "Overdue" }}
                vaccineMeta={VACCINE_META} onDoneClick={handleDoneClick}
                defaultPageSize={10} defaultExpanded={true}
                selected={selected} onToggleSelect={toggleSelect}
              />
            </div>
          )}
          {grouped.dueToday.length > 0 && (
            <div data-section-title="Due Today">
              <AlertGroup
                title="Due today" alerts={grouped.dueToday}
                badge={{ color: "text-warning", bg: "bg-warning/8", ring: "ring-warning/20", icon: Calendar, label: "Due today" }}
                vaccineMeta={VACCINE_META} onDoneClick={handleDoneClick}
                defaultPageSize={10} defaultExpanded={true}
                selected={selected} onToggleSelect={toggleSelect}
              />
            </div>
          )}
          {grouped.dueThisWeek.length > 0 && (
            <div data-section-title="Due This Week">
              <AlertGroup
                title="Due this week" alerts={grouped.dueThisWeek}
                badge={{ color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/8", ring: "ring-amber-500/20", icon: Clock, label: "Due soon" }}
                vaccineMeta={VACCINE_META} onDoneClick={handleDoneClick}
                defaultPageSize={10} defaultExpanded={false}
                selected={selected} onToggleSelect={toggleSelect}
              />
            </div>
          )}
          {grouped.pending.length > 0 && (
            <div data-section-title="Upcoming">
              <AlertGroup
                title="Upcoming" alerts={grouped.pending}
                badge={{ color: "text-info dark:text-blue-300", bg: "bg-info/8 dark:bg-blue-500/10", ring: "ring-info/20 dark:ring-blue-500/20", icon: Clock, label: "Upcoming" }}
                vaccineMeta={VACCINE_META} onDoneClick={handleDoneClick}
                defaultPageSize={10} defaultExpanded={false}
                selected={selected} onToggleSelect={toggleSelect}
              />
            </div>
          )}
        </div>
      )}

      <BatchVaccinateModal open={showBatchModal} selected={selected} alerts={alerts} onClose={() => setShowBatchModal(false)} onConfirm={handleBatchConfirm} />

      {selected.size > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pointer-events-none"
        >
          <div className="surface-elevated px-4 py-2.5 flex items-center gap-3 pointer-events-auto">
            <CheckSquare className="w-4 h-4 text-foreground" />
            <span className="text-[0.88rem] font-semibold text-foreground metric">{selected.size} selected</span>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => setShowBatchModal(true)}
              className="h-8 px-3.5 rounded-md bg-foreground text-background text-[0.82rem] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
            >
              <Syringe className="w-3.5 h-3.5" />
              Vaccinate selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="h-8 px-2.5 rounded-md border border-border text-muted-foreground text-[0.82rem] hover:bg-muted transition-colors"
            >Cancel</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, value, label, color }: { icon: typeof AlertTriangle; value: number; label: string; color: string }) {
  const styles: Record<string, { bg: string; text: string; ring: string }> = {
    destructive: { bg: "bg-destructive/10 dark:bg-destructive/8", text: "text-destructive dark:text-red-300", ring: "ring-destructive/15" },
    warning:     { bg: "bg-warning/10 dark:bg-amber-500/10",     text: "text-warning dark:text-amber-300",     ring: "ring-warning/20 dark:ring-amber-500/20" },
    amber:       { bg: "bg-amber-500/10",                       text: "text-amber-700 dark:text-amber-300",     ring: "ring-amber-500/20" },
    info:        { bg: "bg-info/10 dark:bg-blue-500/10",          text: "text-info dark:text-blue-300",          ring: "ring-info/20 dark:ring-blue-500/20" },
    muted:       { bg: "bg-muted",                                text: "text-muted-foreground",                  ring: "ring-border" },
  };
  const s = styles[color] || styles.muted;
  return (
    <div className="surface p-3.5 flex items-center gap-3 hover-lift">
      <div className={`w-8 h-8 rounded-md ${s.bg} ${s.text} ring-1 ${s.ring} flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className={`text-[1.35rem] font-semibold leading-none metric ${s.text}`}>{value}</p>
        <p className="text-[0.72rem] text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
