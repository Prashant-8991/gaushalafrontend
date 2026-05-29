import { useState } from "react";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Droplets, Loader2, AlertTriangle, CalendarDays } from "lucide-react";
import { useCattleMilk, type CattleMilkRecord } from "../hooks/useCattleMilk";
import { MilkCalendarGrid } from "./MilkCalendarGrid";

interface CattleMilkCalendarProps {
  tagNumber: string;
  cattleName: string;
  onClose: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CattleMilkCalendar({ tagNumber, cattleName, onClose }: CattleMilkCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { data, isLoading, error } = useCattleMilk(tagNumber);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const totalMilk = data?.reduce((sum, r) => sum + r.milk, 0) ?? 0;
  const avgMilk = data && data.length > 0 ? (totalMilk / data.length) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="relative w-full max-w-3xl bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
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

          {/* Stats row */}
          {!isLoading && data && (
            <div className="flex gap-4 mt-2">
              <div className="bg-saffron/10 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                <p className="text-[0.5rem] text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-sm font-bold text-saffron">{totalMilk.toFixed(1)} <span className="text-[0.6rem] font-normal">L</span></p>
              </div>
              {avgMilk != null && (
                <div className="bg-navy/10 dark:bg-navy/20 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                  <p className="text-[0.5rem] text-muted-foreground uppercase tracking-wider">Daily avg</p>
                  <p className="text-sm font-bold text-navy dark:text-navy-light">{avgMilk.toFixed(1)} <span className="text-[0.6rem] font-normal">L</span></p>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg px-3 py-1.5 text-center min-w-[80px]">
                <p className="text-[0.5rem] text-muted-foreground uppercase tracking-wider">Entries</p>
                <p className="text-sm font-bold text-foreground">{data.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-xl bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground/70" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-saffron" />
            <span className="text-sm font-semibold text-foreground">
              {MONTHS[month]} {year}
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-xl bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Calendar grid */}
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
              data={data}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pb-4 text-[0.6rem] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-saffron/20 border border-saffron/40" />
            <span>Has milk data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted/30 border border-border" />
            <span>No data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-saffron/10 border-2 border-saffron ring-2 ring-saffron/20" />
            <span>Today</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
