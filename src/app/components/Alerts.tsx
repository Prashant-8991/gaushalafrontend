import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, AlertTriangle, CheckCircle, Clock, Syringe, Filter, Search, Calendar, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, CheckSquare, Square, X, Send,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const vaccineColors: Record<string, { color: string; bg: string }> = {
  FMD: { color: "text-blue-600", bg: "bg-blue-50" },
  "H.S.": { color: "text-purple-600", bg: "bg-purple-50" },
  Brucellosis: { color: "text-emerald-600", bg: "bg-emerald-50" },
};

const vaccineIdMap: Record<string, number> = { FMD: 1, "H.S.": 2, Brucellosis: 3, "Foot & Mouth Disease": 1, "Hemorrhagic Septicemia": 2 };

const PAGE_SIZES = [10, 25, 50];

function AlertGroup({
  title, alerts, badge, vaccineColors, onDoneClick, defaultPageSize, defaultExpanded,
  selected, onToggleSelect,
}: {
  title: string;
  alerts: VaccineAlert[];
  badge: { color: string; bg: string; icon: typeof Clock; label: string };
  vaccineColors: Record<string, { color: string; bg: string }>;
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
  const start = safePage * pageSize;
  const end = start + pageSize;
  const pageItems = alerts.slice(start, end);
  const isLastPage = safePage >= totalPages - 1;

  return (
    <div ref={sectionRef}>
      <div
        onClick={() => { setCollapsed(!collapsed); sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-saffron/10 cursor-pointer hover:shadow-sm transition-shadow mb-2"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${title === "Overdue" ? "bg-red-500" : title === "Due Today" ? "bg-orange-400" : title === "Due This Week" ? "bg-yellow-400" : "bg-blue-400"}`} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>{alerts.length}</span>
          <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">{alerts.length} record{alerts.length !== 1 ? "s" : ""}</span>
        </div>
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnimatePresence>
                {pageItems.map((alert, index) => {
                  const vc = vaccineColors[alert.name] || { color: "text-gray-600", bg: "bg-gray-50" };
                  const selKey = `${alert.tag_number}-${alert.name}`;
                  const isSelected = selected.has(selKey);
                  return (
                    <motion.div
                      key={selKey}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ delay: index * 0.02 }}
                      className={`bg-white rounded-xl border p-3 hover:shadow-md transition-shadow h-full flex flex-col ${title === "Overdue" ? "border-red-200 border-t-4 border-t-red-500" : "border-saffron/10 border-t-4 border-t-yellow-400"} ${isSelected ? "ring-2 ring-saffron" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <button onClick={() => onToggleSelect(selKey)} className="shrink-0 mt-0.5">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-saffron" /> : <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />}
                        </button>
                        <div className={`w-8 h-8 rounded-lg ${vc.bg} flex items-center justify-center shrink-0`}>
                          <Syringe className={`w-4 h-4 ${vc.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-medium truncate">{alert.cattle_name || alert.tag_number}</h4>
                            <span style={{ fontSize: '0.6rem' }} className={`px-1.5 py-0.5 rounded-full border ${badge.bg} ${badge.color}`}>
                              <BadgeIcon className="w-2.5 h-2.5 inline mr-0.5" />{badge.label}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground mt-0.5">
                            {alert.name}{alert.data === "overdue" ? " overdue" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-saffron/5">
                        <div>
                          <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground">Due</p>
                          <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {new Date(alert.next_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDoneClick(selKey); }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-colors text-xs">Done</button>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span style={{ fontSize: '0.6rem' }} className={vc.color}>{alert.name}</span>
                        <span style={{ fontSize: '0.6rem' }} className="text-muted-foreground truncate">{alert.tag_number}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {alerts.length > defaultPageSize && (
              <div className="flex items-center justify-center gap-4 pt-3 pb-1">
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="text-xs rounded-lg border border-saffron/10 bg-white px-2 py-1.5 focus:outline-none">
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
                </select>
                <div className="flex items-center gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setPage(0); }} disabled={safePage === 0}
                    className="px-2.5 py-1 text-xs rounded-lg border border-saffron/10 hover:bg-gray-50 disabled:opacity-30 transition-colors">First</button>
                  <button onClick={(e) => { e.stopPropagation(); setPage(Math.max(0, safePage - 1)); }} disabled={safePage === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <span className="text-xs text-muted-foreground font-medium min-w-[3.5rem] text-center">{safePage + 1} / {totalPages}</span>
                  <button onClick={(e) => { e.stopPropagation(); setPage(Math.min(totalPages - 1, safePage + 1)); }} disabled={isLastPage}
                    className="p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setPage(totalPages - 1); }} disabled={isLastPage}
                    className="px-2.5 py-1 text-xs rounded-lg border border-saffron/10 hover:bg-gray-50 disabled:opacity-30 transition-colors">Last</button>
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-saffron/10">
          <h3 className="font-semibold">Batch Vaccination ({selectedAlerts.length} selected)</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label style={{ fontSize: '0.75rem' }} className="text-muted-foreground block mb-1.5">Vaccination Date</label>
            <input type="date" value={vaccinatedOn} onChange={(e) => setVaccinatedOn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30" />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-saffron/10 rounded-xl p-3">
            {selectedAlerts.map((a) => {
              const vc = vaccineColors[a.name] || { color: "text-gray-600", bg: "bg-gray-50" };
              return (
                <div key={`${a.tag_number}-${a.name}`} className="flex items-center gap-2 text-sm">
                  <Syringe className={`w-3.5 h-3.5 ${vc.color}`} />
                  <span className="font-medium">{a.cattle_name || a.tag_number}</span>
                  <span style={{ fontSize: '0.7rem' }} className={`px-1.5 py-0.5 rounded-full ${vc.bg} ${vc.color}`}>{a.name}</span>
                  {a.name === "Brucellosis" && <span style={{ fontSize: '0.6rem' }} className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">updates cattle</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-saffron/10 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-saffron/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={async () => {
            setSubmitting(true);
            const records = selectedAlerts.map((a) => ({
              tag_number: a.tag_number,
              vaccine_id: vaccineIdMap[a.name] || 1,
              vaccinated_on: vaccinatedOn,
            }));
            await onConfirm(records);
            setSubmitting(false);
          }} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-saffron to-saffron-dark text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1">
            {submitting ? "Saving..." : <><Send className="w-4 h-4" /> Confirm Vaccination</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Alerts() {
  const queryClient = useQueryClient();
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
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
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
  const totalCount = alerts.length;

  const handleDoneClick = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setShowBatchModal(true);
  };

  const handleBatchConfirm = async (records: { tag_number: string; vaccine_id: number; vaccinated_on: string }[]) => {
    try {
      const res = await fetch(`${LOCAL_API}/vaccination-batch`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
      const data = await res.json();
      setBatchResult(data);
      setSelected(new Set());
      setShowBatchModal(false);
      refetch();
      setTimeout(() => setBatchResult(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const allVisibleKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const a of alerts) {
      if (!searchTerm && !filterStatus && !filterVaccine) {
        keys.add(`${a.tag_number}-${a.name}`);
      }
    }
    return keys;
  }, [alerts, searchTerm, filterStatus, filterVaccine]);

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const KPI_CARDS = [
    { key: "overdue", icon: AlertTriangle, value: grouped.overdue.length, label: "Overdue", color: "red", sectionTitle: "Overdue" },
    { key: "dueToday", icon: Calendar, value: grouped.dueToday.length, label: "Due Today", color: "orange", sectionTitle: "Due Today" },
    { key: "dueThisWeek", icon: Clock, value: grouped.dueThisWeek.length, label: "Due This Week", color: "yellow", sectionTitle: "Due This Week" },
    { key: "pending", icon: CheckCircle, value: grouped.pending.length, label: "Pending", color: "green", sectionTitle: "Upcoming" },
    { key: "total", icon: Syringe, value: totalCount, label: "Total", color: "blue", sectionTitle: null },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-saffron" />
            Alert Center
          </h1>
          <p style={{ fontSize: '0.85rem' }} className="text-muted-foreground mt-1">
            Select cards and vaccinate in batch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors">Clear ({selected.size})</button>
          )}
          <button onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-saffron to-saffron-dark text-white text-sm hover:opacity-90 transition-opacity">
            {isRefetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />} Refresh
          </button>
        </div>
      </div>

      {batchResult && (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${batchResult.failed > 0 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
          {batchResult.failed > 0 ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
          <div>
            <p style={{ fontWeight: 500 }} className={batchResult.failed > 0 ? "text-yellow-800" : "text-green-800"}>
              {batchResult.saved} saved{batchResult.failed > 0 ? `, ${batchResult.failed} failed` : ""} successfully
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.key} onClick={() => { if (!kpi.sectionTitle) return; const el = document.querySelector(`[data-section-title="${kpi.sectionTitle}"]`); el?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className={kpi.sectionTitle ? "cursor-pointer" : ""}>
            <SummaryCard icon={kpi.icon} value={kpi.value} label={kpi.label} color={kpi.color} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-saffron/10 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by tag or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted/50 border border-saffron/10 focus:outline-none focus:ring-2 focus:ring-saffron/30" style={{ fontSize: '0.85rem' }} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30" style={{ fontSize: '0.85rem' }}>
            <option value="">All Status</option>
            <option value="overdue">Overdue</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <select value={filterVaccine} onChange={(e) => setFilterVaccine(e.target.value)}
          className="px-4 py-2 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30" style={{ fontSize: '0.85rem' }}>
          <option value="">All Vaccines</option>
          {vaccineTypes.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-saffron animate-spin" /><span className="ml-3 text-muted-foreground">Loading vaccine data...</span></div>
      ) : !alerts.length ? (
        <div className="text-center py-12 bg-white rounded-xl border border-saffron/10">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No vaccine records found</p>
          <p style={{ fontSize: '0.85rem' }} className="text-muted-foreground">No data available from the vaccine API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.overdue.length > 0 && (
            <div data-section-title="Overdue">
              <AlertGroup title="Overdue" alerts={grouped.overdue} badge={{ color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle, label: "Overdue" }} vaccineColors={vaccineColors} onDoneClick={handleDoneClick} defaultPageSize={10} defaultExpanded={true} selected={selected} onToggleSelect={toggleSelect} />
            </div>
          )}
          {grouped.dueToday.length > 0 && (
            <div data-section-title="Due Today">
              <AlertGroup title="Due Today" alerts={grouped.dueToday} badge={{ color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Calendar, label: "Due Today" }} vaccineColors={vaccineColors} onDoneClick={handleDoneClick} defaultPageSize={10} defaultExpanded={true} selected={selected} onToggleSelect={toggleSelect} />
            </div>
          )}
          {grouped.dueThisWeek.length > 0 && (
            <div data-section-title="Due This Week">
              <AlertGroup title="Due This Week" alerts={grouped.dueThisWeek} badge={{ color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock, label: "Due Soon" }} vaccineColors={vaccineColors} onDoneClick={handleDoneClick} defaultPageSize={10} defaultExpanded={false} selected={selected} onToggleSelect={toggleSelect} />
            </div>
          )}
          {grouped.pending.length > 0 && (
            <div data-section-title="Upcoming">
              <AlertGroup title="Upcoming" alerts={grouped.pending} badge={{ color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Clock, label: "Upcoming" }} vaccineColors={vaccineColors} onDoneClick={handleDoneClick} defaultPageSize={10} defaultExpanded={false} selected={selected} onToggleSelect={toggleSelect} />
            </div>
          )}
        </div>
      )}

      <BatchVaccinateModal open={showBatchModal} selected={selected} alerts={alerts} onClose={() => setShowBatchModal(false)} onConfirm={handleBatchConfirm} />

      {selected.size > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-saffron/20 px-6 py-4 flex items-center gap-4 pointer-events-auto">
            <CheckSquare className="w-5 h-5 text-saffron" />
            <span style={{ fontWeight: 500 }}>{selected.size} selected</span>
            <div className="h-6 w-px bg-saffron/10" />
            <button onClick={() => setShowBatchModal(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-saffron to-saffron-dark text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Syringe className="w-4 h-4" /> Vaccinate Selected
            </button>
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, value, label, color }: { icon: typeof AlertTriangle; value: number; label: string; color: string }) {
  const colors: Record<string, string> = {
    red: "from-red-50 to-red-100 border-red-200 text-red-700 bg-red-100",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700 bg-orange-100",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700 bg-yellow-100",
    green: "from-green-50 to-green-100 border-green-200 text-green-700 bg-green-100",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700 bg-blue-100",
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`bg-gradient-to-br ${c} rounded-xl border p-4 flex items-center gap-3 hover:shadow-md transition-shadow`}>
      <div className={`w-10 h-10 rounded-full ${c.split(" ")[3]} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.split(" ")[2]}`} />
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className={c.split(" ")[2]}>{value}</p>
        <p style={{ fontSize: '0.7rem' }} className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
