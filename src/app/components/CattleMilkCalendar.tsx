import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Droplets, Loader2, AlertTriangle, CalendarDays, Save } from "lucide-react";
import { useMilkCalendar } from "../hooks/useMilkCalendar";
import { useSaveMilkData } from "../hooks/useSaveMilkData";
import { MilkCalendarGrid } from "./MilkCalendarGrid";
import type { MilkMap } from "../types/milk";

interface CattleMilkCalendarProps {
  tagNumber: string;
  cattleName: string;
  onClose: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function CattleMilkCalendar({ tagNumber, cattleName, onClose }: CattleMilkCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const yearMonth = toYearMonth(year, month);

  const { data: milkMap, isLoading, error } = useMilkCalendar(tagNumber, yearMonth);
  const saveMutation = useSaveMilkData(tagNumber, yearMonth);

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [dirtyDates, setDirtyDates] = useState<Set<string>>(new Set());
  const [savingDates, setSavingDates] = useState<Set<string>>(new Set());

  // Sync editValues from fetched milkMap
  useEffect(() => {
    if (!milkMap) return;
    setEditValues((prev) => {
      const next: Record<string, string> = {};
      // Build keys for current month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        // Prefer existing edit value (user may have typed) else use API data
        next[dateStr] = prev[dateStr] ?? (milkMap[dateStr] !== undefined ? String(milkMap[dateStr]) : "");
      }
      return next;
    });
    setDirtyDates(new Set());
    setSavingDates(new Set());
  }, [milkMap, year, month]);

  const handleCellChange = useCallback((dateStr: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [dateStr]: value }));
    setDirtyDates((prev) => new Set(prev).add(dateStr));
  }, []);

  const handleCellBlur = useCallback(
    (dateStr: string) => {
      const val = editValues[dateStr];
      if (val === undefined || val === "") return;
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) return;
      // Only save if value actually differs from API data
      const apiVal = milkMap?.[dateStr];
      if (apiVal !== undefined && Math.abs(apiVal - num) < 0.01) return;

      setSavingDates((prev) => new Set(prev).add(dateStr));
      saveMutation.mutate(
        { tag_number: tagNumber, date: dateStr, milk: num },
        {
          onSettled: () => {
            setSavingDates((prev) => {
              const next = new Set(prev);
              next.delete(dateStr);
              return next;
            });
            setDirtyDates((prev) => {
              const next = new Set(prev);
              next.delete(dateStr);
              return next;
            });
          },
        },
      );
    },
    [editValues, milkMap, tagNumber, saveMutation],
  );

  const handleSaveAll = useCallback(() => {
    for (const dateStr of dirtyDates) {
      const val = editValues[dateStr];
      if (val === undefined || val === "") continue;
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) continue;
      setSavingDates((prev) => new Set(prev).add(dateStr));
      saveMutation.mutate(
        { tag_number: tagNumber, date: dateStr, milk: num },
        {
          onSettled: () => {
            setSavingDates((prev) => {
              const next = new Set(prev);
              next.delete(dateStr);
              return next;
            });
            setDirtyDates((prev) => {
              const next = new Set(prev);
              next.delete(dateStr);
              return next;
            });
          },
        },
      );
    }
  }, [dirtyDates, editValues, tagNumber, saveMutation]);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const milkingDays = milkMap ? Object.keys(milkMap).length : 0;
  const totalMilk = milkMap ? Object.values(milkMap).reduce((s, v) => s + v, 0) : 0;
  const avgMilk = milkingDays > 0 ? totalMilk / milkingDays : null;
  const hasDirty = dirtyDates.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="relative w-full max-w-4xl bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="relative bg-gradient-to-br from-saffron/10 via-background to-saffron/5 p-5 pb-3 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shadow-lg shadow-saffron/20">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{cattleName}</h2>
              <p className="text-[0.7rem] text-muted-foreground font-mono">{tagNumber}</p>
            </div>
          </div>

          {!isLoading && milkMap && (
            <div className="flex gap-3 mt-2 flex-wrap">
              <StatCard label="Total" value={`${totalMilk.toFixed(1)} L`} color="saffron" />
              {avgMilk != null && <StatCard label="Daily avg" value={`${avgMilk.toFixed(1)} L`} color="navy" />}
              <StatCard label="Milking days" value={`${milkingDays} days`} color="muted" />
              {hasDirty && <StatCard label="Unsaved" value={`${dirtyDates.size}`} color="amber" />}
            </div>
          )}
        </div>

        {/* ─── Month Navigator ─── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/10">
          <button
            onClick={prevMonth}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-saffron" />
            <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
          </div>

          <button
            onClick={nextMonth}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Calendar Grid ─── */}
        <div className="p-5">
          {error && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-sm font-medium text-foreground">Failed to load milk data</p>
              <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
            </div>
          ) : (
            <MilkCalendarGrid
              year={year}
              month={month}
              milkMap={milkMap ?? {}}
              editValues={editValues}
              savingDates={savingDates}
              onCellChange={handleCellChange}
              onCellBlur={handleCellBlur}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* ─── Footer: Legend + Save All ─── */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3 text-[0.55rem] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-saffron/20 border border-saffron/40" /> Has data
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-muted/30 border border-border" /> No data
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-saffron/10 border-2 border-saffron ring-2 ring-saffron/20" /> Today
            </span>
          </div>

          {hasDirty && (
            <button
              onClick={handleSaveAll}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron text-white text-sm font-medium hover:bg-saffron-dark transition-colors disabled:opacity-50 shadow-lg shadow-saffron/20"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save All ({dirtyDates.size})
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const bgMap: Record<string, string> = {
    saffron: "bg-saffron/10",
    navy: "bg-navy/10 dark:bg-navy/20",
    muted: "bg-muted/50",
    amber: "bg-amber-100 dark:bg-amber-900/20",
  };
  const textMap: Record<string, string> = {
    saffron: "text-saffron",
    navy: "text-navy dark:text-navy-light",
    muted: "text-foreground",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className={`${bgMap[color]} rounded-lg px-3 py-1.5 text-center min-w-[80px]`}>
      <p className="text-[0.45rem] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold ${textMap[color]}`}>{value}</p>
    </div>
  );
}
