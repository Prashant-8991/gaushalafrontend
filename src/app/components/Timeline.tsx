import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  Baby, Gift, Syringe, LogOut, Heart, ShoppingCart, ChevronDown, Clock,
} from "lucide-react";
import { timelineData, heroImage } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowIcon, Female, Male, PregnantIcon, MilkDrop, Bull, Calf } from "./icons/icons";

const MONTHS_FULL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EVENT_META: Record<string, { icon: typeof Baby; color: string; bg: string; ring: string; label: string }> = {
  birth:          { icon: Baby,         color: "text-success",                bg: "bg-success/8",      ring: "border-success/20",  label: "Natural birth" },
  donated_in:     { icon: Gift,         color: "text-saffron",                bg: "bg-saffron/8",      ring: "border-saffron/20",  label: "Donated in" },
  sperm_donation: { icon: Syringe,      color: "text-navy dark:text-blue-300", bg: "bg-navy/8 dark:bg-blue-500/12", ring: "border-navy/20 dark:border-blue-500/20", label: "Sperm donation" },
  purchased:      { icon: ShoppingCart, color: "text-purple-600 dark:text-purple-300", bg: "bg-purple-500/8",  ring: "border-purple-500/20", label: "Purchased" },
  donated_out:    { icon: LogOut,       color: "text-amber-600 dark:text-amber-300", bg: "bg-amber-500/8",  ring: "border-amber-500/20", label: "Donated out" },
  deceased:       { icon: Heart,        color: "text-destructive",            bg: "bg-destructive/8",   ring: "border-destructive/20", label: "Deceased" },
};

export function Timeline() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const totalGrowth = timelineData.reduce((sum, y) => sum + y.net, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface overflow-hidden"
      >
        <div className="relative h-32 lg:h-40">
          <ImageWithFallback src={heroImage} alt="Somnath Temple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 lg:px-8">
            <div>
              <p className="eyebrow text-saffron-light">Herd timeline</p>
              <h1 className="text-[1.5rem] lg:text-[1.85rem] font-semibold text-white leading-tight tracking-[-0.02em] mt-1">
                A living history
              </h1>
              <p className="text-[0.85rem] text-white/65 mt-1.5 max-w-md">
                Click any year to expand the month-by-month events of the herd.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="surface px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2"
      >
        {Object.entries(EVENT_META).map(([type, info]) => {
          const Icon = info.icon;
          return (
            <div key={type} className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
              <Icon className={`w-3.5 h-3.5 ${info.color}`} strokeWidth={1.6} />
              {info.label}
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[0.75rem] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Net gain
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            Net loss
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-border z-0" />

        <div className="space-y-0 relative z-10">
          {timelineData.map((yearData, index) => {
            const isLeft = index % 2 === 0;
            const isExpanded = expandedYear === yearData.year;
            const netPositive = yearData.net > 0;
            const netNegative = yearData.net < 0;

            return (
              <div key={yearData.year}>
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center py-3"
                >
                  <div className={`hidden lg:block w-[calc(50%-2rem)] ${isLeft ? "pr-10 text-right" : "pl-10 text-left"}`}>
                    <button
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                      className={`inline-block rounded-lg border p-3.5 transition-all max-w-sm cursor-pointer text-left ${
                        isExpanded
                          ? "border-saffron/40 bg-card shadow-[0_2px_12px_rgba(20,23,31,0.06)]"
                          : "border-border bg-card hover-lift"
                      } ${isLeft ? "ml-auto" : ""}`}
                    >
                      <div className={`flex items-center gap-2.5 mb-3 ${isLeft ? "flex-row-reverse" : ""}`}>
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center text-white font-semibold text-[0.85rem] shrink-0 ${
                          netPositive ? "bg-success" : netNegative ? "bg-destructive" : "bg-muted-foreground"
                        }`}>
                          {String(yearData.year).slice(2)}
                        </div>
                        <div className={isLeft ? "text-right" : "text-left"}>
                          <p className="text-[0.95rem] font-semibold text-foreground leading-none metric">{yearData.year}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isLeft ? "justify-end" : ""}`}>
                            {netPositive ? <ArrowUpRight className="w-3 h-3 text-success" /> :
                              netNegative ? <ArrowDownRight className="w-3 h-3 text-destructive" /> :
                                <Minus className="w-3 h-3 text-muted-foreground" />}
                            <span className={`text-[0.72rem] font-medium metric ${
                              netPositive ? "text-success" : netNegative ? "text-destructive" : "text-muted-foreground"
                            }`}>
                              Net {netPositive ? `+${yearData.net}` : yearData.net}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>

                      <div className={`flex gap-1.5 ${isLeft ? "justify-end" : ""}`}>
                        <div className="bg-success/8 border border-success/20 rounded-md px-2 py-1">
                          <p className="text-[0.55rem] uppercase tracking-wider text-success/80">In</p>
                          <p className="text-[0.85rem] font-semibold text-success metric leading-tight">+{yearData.incoming}</p>
                        </div>
                        <div className="bg-destructive/8 border border-destructive/20 rounded-md px-2 py-1">
                          <p className="text-[0.55rem] uppercase tracking-wider text-destructive/80">Out</p>
                          <p className="text-[0.85rem] font-semibold text-destructive metric leading-tight">-{yearData.outgoing}</p>
                        </div>
                      </div>

                      <div className={`flex flex-wrap gap-1 mt-2.5 ${isLeft ? "justify-end" : ""}`}>
                        {Object.entries(EVENT_META).map(([type, info]) => {
                          const count = yearData.events.filter(e => e.type === type).length;
                          if (count === 0) return null;
                          const Icon = info.icon;
                          return (
                            <span key={type} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-medium border ${info.bg} ${info.ring} ${info.color}`}>
                              <Icon className="w-2.5 h-2.5" strokeWidth={2} />
                              <span className="metric">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  </div>

                  {/* Center node */}
                  <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 z-20">
                    <div className={`absolute top-1/2 -translate-y-1/2 h-px w-5 ${
                      isLeft ? "right-full" : "left-full"
                    } ${netPositive ? "bg-gradient-to-l from-success/40 to-transparent" :
                      netNegative ? "bg-gradient-to-l from-destructive/40 to-transparent" : "bg-border"
                    }`} />
                    <button
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-background transition-transform hover:scale-110 ${
                        netPositive ? "bg-success" : netNegative ? "bg-destructive" : "bg-muted-foreground"
                      }`}
                    >
                      {netPositive ? <TrendingUp className="w-3.5 h-3.5" /> :
                        netNegative ? <TrendingDown className="w-3.5 h-3.5" /> :
                          <Minus className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="hidden lg:block w-[calc(50%-2rem)]" />

                  {/* Mobile */}
                  <div className="lg:hidden ml-14 flex-1">
                    <button
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                      className={`w-full text-left rounded-lg border p-3 transition-all ${
                        isExpanded
                          ? "bg-card border-saffron/40 shadow-md"
                          : "bg-card border-border hover-lift"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold text-[0.78rem] ${
                          netPositive ? "bg-success" : netNegative ? "bg-destructive" : "bg-muted-foreground"
                        }`}>
                          {String(yearData.year).slice(2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[0.9rem] font-semibold text-foreground metric">{yearData.year}</p>
                          <span className={`text-[0.7rem] font-medium metric ${
                            netPositive ? "text-success" : netNegative ? "text-destructive" : "text-muted-foreground"
                          }`}>
                            Net {netPositive ? `+${yearData.net}` : yearData.net} · In {yearData.incoming} · Out {yearData.outgoing}
                          </span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(EVENT_META).map(([type, info]) => {
                          const count = yearData.events.filter(e => e.type === type).length;
                          if (count === 0) return null;
                          const Icon = info.icon;
                          return (
                            <span key={type} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.62rem] font-medium border ${info.bg} ${info.ring} ${info.color}`}>
                              <Icon className="w-2.5 h-2.5" strokeWidth={2} />
                              <span className="metric">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <MonthlyBreakdown yearData={yearData} isLeft={isLeft} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6 relative z-10">
          <div className="px-4 py-1.5 rounded-full bg-foreground text-background text-[0.78rem] font-medium inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Present · +{totalGrowth} herd growth since 2013
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
        {[
          { label: "Natural births",      value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "birth").length, 0),      icon: Baby,         color: "text-success" },
          { label: "Donated in",         value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "donated_in").length, 0), icon: Gift,         color: "text-saffron" },
          { label: "Sperm donation",     value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "sperm_donation").length, 0), icon: Syringe,      color: "text-navy dark:text-blue-300" },
          { label: "Purchased",          value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "purchased").length, 0),    icon: ShoppingCart, color: "text-purple-600 dark:text-purple-300" },
          { label: "Donated out",        value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "donated_out").length, 0), icon: LogOut,       color: "text-amber-600 dark:text-amber-300" },
          { label: "Deceased",           value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "deceased").length, 0),    icon: Heart,        color: "text-destructive" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="surface p-3.5 flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${s.color}`} strokeWidth={1.6} />
              <div className="min-w-0">
                <p className="text-[1.15rem] font-semibold text-foreground metric leading-none">{s.value}</p>
                <p className="text-[0.7rem] text-muted-foreground mt-1">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyBreakdown({
  yearData, isLeft,
}: {
  yearData: typeof timelineData[0];
  isLeft: boolean;
}) {
  const monthGroups = useMemo(() => {
    const groups: Record<number, typeof yearData.events> = {};
    yearData.events.forEach(e => {
      if (!groups[e.month]) groups[e.month] = [];
      groups[e.month].push(e);
    });
    return groups;
  }, [yearData.events]);

  const activeMonths = Object.keys(monthGroups).map(Number).sort((a, b) => a - b);

  return (
    <div className={`ml-14 lg:ml-0 mb-4 ${isLeft ? "lg:mr-[calc(50%+2rem)] lg:pl-10" : "lg:ml-[calc(50%+2rem)] lg:pr-10"}`}>
      <div className="surface p-4">
        <p className="text-[0.78rem] font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          {yearData.year} · month by month
        </p>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
          {MONTHS_FULL.map((m, i) => {
            const events = monthGroups[i] || [];
            const hasEvents = events.length > 0;
            const hasOutgoing = events.some(e => ["donated_out", "deceased"].includes(e.type));
            return (
              <div
                key={m}
                className={`text-center rounded-md py-1.5 px-1 border transition-colors ${
                  hasEvents
                    ? hasOutgoing
                      ? "bg-destructive/8 border-destructive/20"
                      : "bg-success/8 border-success/20"
                    : "bg-muted/30 border-transparent"
                }`}
              >
                <p className={`text-[0.6rem] font-semibold uppercase tracking-wider ${
                  hasEvents
                    ? hasOutgoing ? "text-destructive" : "text-success"
                    : "text-muted-foreground/50"
                }`}>{m}</p>
                {hasEvents && (
                  <p className={`text-[0.75rem] font-semibold metric mt-0.5 ${
                    hasOutgoing ? "text-destructive" : "text-success"
                  }`}>
                    {events.length}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {activeMonths.map(month => {
            const events = monthGroups[month];
            return (
              <div key={month} className="rounded-md border border-border bg-muted/30 p-2.5">
                <p className="text-[0.65rem] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  {MONTHS_FULL[month]} {yearData.year}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((event, i) => {
                    const info = EVENT_META[event.type] || EVENT_META.birth;
                    const Icon = info.icon;
                    return (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.72rem] font-medium border ${info.bg} ${info.ring} ${info.color}`}>
                        <Icon className="w-3 h-3" strokeWidth={1.8} />
                        {event.cowName}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
