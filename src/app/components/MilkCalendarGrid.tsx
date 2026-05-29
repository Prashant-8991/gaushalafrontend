import { useMemo } from "react";
import { MilkCalendarCell } from "./MilkCalendarCell";
import type { MilkMap } from "../types/milk";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarDay {
  day: number;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface MilkCalendarGridProps {
  year: number;
  month: number;
  milkMap: MilkMap;
  editValues: Record<string, string>;
  savingDates: Set<string>;
  onCellChange: (dateStr: string, value: string) => void;
  onCellBlur: (dateStr: string) => void;
  isLoading: boolean;
}

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const totalSlots = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const days: CalendarDay[] = [];

  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevLastDay - i;
    days.push({ day: d, dateStr: "", isToday: false, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    days.push({
      day: d,
      dateStr,
      isToday: dateStr === `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
      isCurrentMonth: true,
    });
  }

  const remaining = totalSlots - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, dateStr: "", isToday: false, isCurrentMonth: false });
  }

  return days;
}

export function MilkCalendarGrid({
  year,
  month,
  milkMap,
  editValues,
  savingDates,
  onCellChange,
  onCellBlur,
  isLoading,
}: MilkCalendarGridProps) {
  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/20 min-h-[80px] animate-pulse p-2">
            <div className="h-3 w-6 rounded bg-muted/50 mb-2" />
            <div className="h-6 w-full rounded bg-muted/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="text-center text-[0.55rem] font-semibold uppercase tracking-widest text-muted-foreground/50 py-1"
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((d) => {
          if (!d.isCurrentMonth) {
            return <div key={d.dateStr || `empty-${d.day}`} className="min-h-[80px]" />;
          }
          return (
            <MilkCalendarCell
              key={d.dateStr}
              day={d.day}
              dateStr={d.dateStr}
              value={editValues[d.dateStr] ?? ""}
              isToday={d.isToday}
              hasData={d.dateStr in milkMap}
              isSaving={savingDates.has(d.dateStr)}
              onChange={onCellChange}
              onBlur={onCellBlur}
            />
          );
        })}
      </div>
    </div>
  );
}
