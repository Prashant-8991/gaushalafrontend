import { motion } from "motion/react";

interface MilkCalendarCellProps {
  day: number;
  milk: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export function MilkCalendarCell({ day, milk, isToday, isCurrentMonth }: MilkCalendarCellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        relative rounded-xl border p-2.5 min-h-[72px] flex flex-col
        ${isToday
          ? "border-saffron bg-saffron/5 ring-2 ring-saffron/20 shadow-sm shadow-saffron/10"
          : milk != null
            ? "border-saffron/30 bg-white/80 dark:bg-card/80"
            : "border-border bg-muted/30"
        }
        ${!isCurrentMonth ? "opacity-40" : ""}
      `}
    >
      {/* Date number */}
      <span className={`
        text-[0.65rem] font-semibold leading-none mb-1
        ${isToday ? "text-saffron" : "text-muted-foreground"}
      `}>
        {day}
        {isToday && (
          <span className="ml-1 text-[0.5rem] font-medium text-saffron">Today</span>
        )}
      </span>

      {/* Milk value */}
      <div className="flex-1 flex items-end">
        {milk != null ? (
          <div className="flex items-baseline gap-0.5">
            <span className="text-[0.85rem] font-bold text-foreground">{milk}</span>
            <span className="text-[0.5rem] text-muted-foreground font-medium">L</span>
          </div>
        ) : (
          <span className="text-[0.55rem] text-muted-foreground/50 italic">No data</span>
        )}
      </div>

      {/* Milk indicator bar */}
      {milk != null && (
        <div className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-saffron/40 to-saffron/60" />
      )}
    </motion.div>
  );
}
