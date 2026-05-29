import { useMemo } from "react";
import { MilkCalendarCell } from "./MilkCalendarCell";
import type { CattleMilkRecord } from "../hooks/useCattleMilk";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MilkCalendarGridProps {
  year: number;
  month: number;
  data: CattleMilkRecord[] | undefined;
  isLoading: boolean;
}

export function MilkCalendarGrid({ year, month, data, isLoading }: MilkCalendarGridProps) {
  const milkMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!data) return map;
    for (const record of data) {
      map.set(record.date, record.milk);
    }
    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();
    const totalSlots = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const days: Array<{
      day: number;
      milk: number | null;
      isToday: boolean;
      isCurrentMonth: boolean;
      key: string;
    }> = [];

    // Previous month fill
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      days.push({
        day: d,
        milk: null,
        isToday: false,
        isCurrentMonth: false,
        key: `prev-${d}`,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        milk: milkMap.get(dateStr) ?? null,
        isToday: dateStr === todayStr,
        isCurrentMonth: true,
        key: dateStr,
      });
    }

    // Next month fill
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        milk: null,
        isToday: false,
        isCurrentMonth: false,
        key: `next-${d}`,
      });
    }

    return days;
  }, [year, month, milkMap]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/20 min-h-[72px] animate-pulse p-2.5">
            <div className="h-3 w-6 rounded bg-muted/50 mb-2" />
            <div className="h-4 w-10 rounded bg-muted/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((d) => (
          <MilkCalendarCell
            key={d.key}
            day={d.day}
            milk={d.milk}
            isToday={d.isToday}
            isCurrentMonth={d.isCurrentMonth}
          />
        ))}
      </div>
    </div>
  );
}
