import { Loader2 } from "lucide-react";

interface MilkCalendarCellProps {
  day: number;
  dateStr: string;
  value: string;
  isToday: boolean;
  hasData: boolean;
  isSaving: boolean;
  onChange: (dateStr: string, value: string) => void;
  onBlur: (dateStr: string) => void;
}

export function MilkCalendarCell({
  day,
  dateStr,
  value,
  isToday,
  hasData,
  isSaving,
  onChange,
  onBlur,
}: MilkCalendarCellProps) {
  return (
    <div
      className={`
        relative rounded-xl border p-2 min-h-[80px] flex flex-col
        ${isToday
          ? "border-saffron bg-saffron/5 ring-2 ring-saffron/20"
          : hasData
            ? "border-saffron/25 bg-card"
            : "border-border bg-muted/20"
        }
      `}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[0.6rem] font-semibold ${isToday ? "text-saffron" : "text-muted-foreground"}`}>
          {day}
          {isToday && <span className="ml-1 text-[0.45rem] font-medium text-saffron">Today</span>}
        </span>
        {hasData && <span className="w-1.5 h-1.5 rounded-full bg-saffron/60" />}
      </div>

      {/* Editable input */}
      <div className="flex-1 flex items-center gap-1">
        <input
          type="number"
          step="0.1"
          min="0"
          value={value}
          onChange={(e) => onChange(dateStr, e.target.value)}
          onBlur={() => onBlur(dateStr)}
          disabled={isSaving}
          className={`
            w-full h-7 rounded-md border bg-background px-1.5 text-[0.75rem] font-medium
            text-foreground text-center
            placeholder:text-muted-foreground/40
            focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasData ? "border-saffron/20" : "border-dashed border-border"}
          `}
          placeholder="—"
        />
        <span className="text-[0.5rem] text-muted-foreground font-medium shrink-0">L</span>
      </div>

      {/* Saving overlay */}
      {isSaving && (
        <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-saffron animate-spin" />
        </div>
      )}
    </div>
  );
}
