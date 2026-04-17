import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  Baby, Gift, Syringe, LogOut, Heart, ShoppingCart, ChevronDown, Leaf,
} from "lucide-react";
import { timelineData, heroImage } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const MONTHS_FULL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const eventIcons: Record<string, { icon: typeof Baby; color: string; bg: string; label: string }> = {
  birth: { icon: Baby, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Natural Birth" },
  donated_in: { icon: Gift, color: "text-saffron", bg: "bg-orange-50 border-saffron/20", label: "Donated In" },
  sperm_donation: { icon: Syringe, color: "text-navy", bg: "bg-blue-50 border-navy/20", label: "Sperm Donation / AI" },
  purchased: { icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "Purchased" },
  donated_out: { icon: LogOut, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Donated Out" },
  deceased: { icon: Heart, color: "text-red-500", bg: "bg-red-50 border-red-200", label: "Deceased" },
};

export function Timeline() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const totalGrowth = timelineData.reduce((sum, y) => sum + y.net, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="relative rounded-2xl overflow-hidden h-36 lg:h-44">
        <ImageWithFallback src={heroImage} alt="Somnath Temple" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 lg:px-10">
          <div>
            <p style={{ fontSize: '0.65rem' }} className="text-saffron-light tracking-widest uppercase mb-1">
              Somnath Temple Trust Gaushala &bull; Timeline Vine
            </p>
            <h1 className="text-white flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-400" />
              Herd Timeline
            </h1>
            <p style={{ fontSize: '0.8rem' }} className="text-white/70 mt-0.5">
              A living vine of your herd's journey — click any year to explore month-by-month events.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-saffron/10 p-3"
        style={{ boxShadow: "0 2px 12px rgba(255,107,0,0.06)" }}>
        {Object.entries(eventIcons).map(([type, { icon: Icon, color, label }]) => (
          <div key={type} className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="ml-auto flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">Net Gain</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">Net Loss</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 lg:-translate-x-1/2 w-1.5 z-0">
          <div className="w-full h-full rounded-full"
            style={{
              background: "linear-gradient(180deg, #28a745 0%, #FF6B00 30%, #1B3A6B 60%, #FF6B00 80%, #28a745 100%)",
              boxShadow: "0 0 12px rgba(40,167,69,0.15), 0 0 20px rgba(255,107,0,0.1)",
            }}
          />
          {[15, 30, 45, 60, 75, 90].map(pct => (
            <div key={pct} className="absolute w-3 h-3"
              style={{
                top: `${pct}%`,
                left: pct % 30 === 0 ? "-6px" : "6px",
                transform: `rotate(${pct * 3}deg)`,
              }}>
              <Leaf className="w-3 h-3 text-green-400/40" />
            </div>
          ))}
        </div>

        <div className="space-y-0 relative z-10">
          {timelineData.map((yearData, index) => {
            const isLeft = index % 2 === 0;
            const isExpanded = expandedYear === yearData.year;
            const netColor = yearData.net > 0 ? "from-green-500 to-green-600" : yearData.net < 0 ? "from-red-500 to-red-600" : "from-gray-400 to-gray-500";
            const netTextColor = yearData.net > 0 ? "text-green-600" : yearData.net < 0 ? "text-red-600" : "text-gray-500";

            return (
              <div key={yearData.year}>
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className={`relative flex items-center py-3 ${isLeft ? "lg:flex-row flex-row" : "lg:flex-row-reverse flex-row"}`}>

                  <div className={`hidden lg:block w-[calc(50%-2rem)] ${isLeft ? "pr-6 text-right" : "pl-6 text-left"}`}>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                      className={`inline-block rounded-2xl border p-4 transition-all max-w-sm cursor-pointer ${isLeft ? "ml-auto" : ""} ${isExpanded
                          ? "bg-white border-saffron/30 shadow-lg shadow-saffron/10"
                          : "bg-white/90 border-saffron/10 shadow-md hover:shadow-lg hover:shadow-saffron/10"
                        }`}
                      style={{
                        transform: "perspective(800px) rotateY(0deg)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2" style={{ justifyContent: isLeft ? "flex-end" : "flex-start" }}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${netColor} flex items-center justify-center text-white shadow-md`}
                          style={{
                            boxShadow: yearData.net > 0
                              ? "0 4px 15px rgba(40,167,69,0.3)"
                              : "0 4px 15px rgba(239,68,68,0.3)",
                          }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{String(yearData.year).slice(2)}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 600 }}>{yearData.year}</p>
                          <div className="flex items-center gap-1">
                            {yearData.net > 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> :
                              yearData.net < 0 ? <ArrowDownRight className="w-3 h-3 text-red-500" /> :
                                <Minus className="w-3 h-3 text-gray-400" />}
                            <span style={{ fontSize: '0.7rem' }} className={netTextColor}>
                              Net {yearData.net > 0 ? `+${yearData.net}` : yearData.net}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-auto ${isExpanded ? "rotate-180" : ""}`} />
                      </div>

                      <div className="flex gap-2 mb-2" style={{ justifyContent: isLeft ? "flex-end" : "flex-start" }}>
                        <div className="bg-green-50 rounded-lg px-2.5 py-1 border border-green-100"
                          style={{ boxShadow: "inset 0 1px 3px rgba(40,167,69,0.08)" }}>
                          <p style={{ fontSize: '0.55rem' }} className="text-green-600/70 uppercase">Incoming</p>
                          <p style={{ fontSize: '0.95rem', fontWeight: 700 }} className="text-green-600">+{yearData.incoming}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg px-2.5 py-1 border border-red-100"
                          style={{ boxShadow: "inset 0 1px 3px rgba(239,68,68,0.08)" }}>
                          <p style={{ fontSize: '0.55rem' }} className="text-red-500/70 uppercase">Outgoing</p>
                          <p style={{ fontSize: '0.95rem', fontWeight: 700 }} className="text-red-500">-{yearData.outgoing}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1" style={{ justifyContent: isLeft ? "flex-end" : "flex-start" }}>
                        {Object.entries(eventIcons).map(([type, info]) => {
                          const count = yearData.events.filter(e => e.type === type).length;
                          if (count === 0) return null;
                          const Icon = info.icon;
                          return (
                            <div key={type} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${info.bg}`}>
                              <Icon className={`w-2.5 h-2.5 ${info.color}`} />
                              <span style={{ fontSize: '0.6rem', fontWeight: 500 }} className={info.color}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.button>
                  </div>

                  <div className="absolute left-8 lg:left-1/2 lg:-translate-x-1/2 z-20">
                    <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 ${isLeft ? "right-full" : "left-full"} w-6`}
                      style={{
                        background: yearData.net > 0
                          ? "linear-gradient(90deg, rgba(40,167,69,0.5), rgba(40,167,69,0))"
                          : "linear-gradient(90deg, rgba(239,68,68,0.4), rgba(239,68,68,0))",
                        transform: isLeft ? undefined : "scaleX(-1)",
                      }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${netColor} flex items-center justify-center text-white border-[3px] border-white cursor-pointer`}
                      style={{
                        boxShadow: yearData.net > 0
                          ? "0 0 0 3px rgba(40,167,69,0.15), 0 4px 12px rgba(40,167,69,0.25)"
                          : yearData.net < 0
                            ? "0 0 0 3px rgba(239,68,68,0.15), 0 4px 12px rgba(239,68,68,0.25)"
                            : "0 0 0 3px rgba(156,163,175,0.15), 0 4px 12px rgba(156,163,175,0.25)",
                      }}
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                    >
                      {yearData.net > 0 ? <TrendingUp className="w-4 h-4" /> :
                        yearData.net < 0 ? <TrendingDown className="w-4 h-4" /> :
                          <Minus className="w-4 h-4" />}
                    </motion.div>
                  </div>

                  <div className="hidden lg:block w-[calc(50%-2rem)]" />

                  <div className="lg:hidden ml-16 flex-1">
                    <motion.button
                      onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                      className={`w-full text-left rounded-2xl border p-3 transition-all ${isExpanded ? "bg-white border-saffron/30 shadow-lg" : "bg-white/90 border-saffron/10 shadow-md"
                        }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${netColor} flex items-center justify-center text-white`}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{String(yearData.year).slice(2)}</span>
                        </div>
                        <div className="flex-1">
                          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{yearData.year}</p>
                          <span style={{ fontSize: '0.6rem' }} className={netTextColor}>
                            Net {yearData.net > 0 ? `+${yearData.net}` : yearData.net} &bull; In: {yearData.incoming} Out: {yearData.outgoing}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(eventIcons).map(([type, info]) => {
                          const count = yearData.events.filter(e => e.type === type).length;
                          if (count === 0) return null;
                          const Icon = info.icon;
                          return (
                            <div key={type} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${info.bg}`}>
                              <Icon className={`w-2.5 h-2.5 ${info.color}`} />
                              <span style={{ fontSize: '0.55rem', fontWeight: 500 }} className={info.color}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
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
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-2.5 rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #FF6B00 0%, #1B3A6B 100%)",
              boxShadow: "0 4px 20px rgba(255,107,0,0.2), 0 2px 10px rgba(27,58,107,0.15)",
              fontSize: '0.78rem',
            }}
          >
            Present &bull; +{totalGrowth} total herd growth since 2013
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Natural Births", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "birth").length, 0), color: "bg-green-50 text-green-700 border-green-200", shadow: "shadow-green-100" },
          { label: "Donated In", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "donated_in").length, 0), color: "bg-orange-50 text-saffron border-saffron/20", shadow: "shadow-orange-100" },
          { label: "Artificial Insemination", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "sperm_donation").length, 0), color: "bg-blue-50 text-navy border-navy/20", shadow: "shadow-blue-100" },
          { label: "Purchased", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "purchased").length, 0), color: "bg-purple-50 text-purple-700 border-purple-200", shadow: "shadow-purple-100" },
          { label: "Donated Out", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "donated_out").length, 0), color: "bg-amber-50 text-amber-700 border-amber-200", shadow: "shadow-amber-100" },
          { label: "Deceased", value: timelineData.reduce((s, y) => s + y.events.filter(e => e.type === "deceased").length, 0), color: "bg-red-50 text-red-600 border-red-200", shadow: "shadow-red-100" },
        ].map(s => (
          <motion.div key={s.label}
            whileHover={{ y: -3, scale: 1.02 }}
            className={`rounded-xl border p-3 ${s.color} shadow-sm ${s.shadow}`}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.5)",
            }}>
            <p style={{ fontSize: '0.65rem' }} className="opacity-70">{s.label}</p>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


function MonthlyBreakdown({
  yearData,
  isLeft,
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
    <div className={`ml-14 lg:ml-0 mb-4 ${isLeft ? "lg:mr-[calc(50%+2rem)] lg:pl-8" : "lg:ml-[calc(50%+2rem)] lg:pr-8"}`}>
      <div className="bg-white rounded-2xl border border-saffron/10 p-4 shadow-lg"
        style={{
          boxShadow: "0 8px 30px rgba(255,107,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          background: "linear-gradient(135deg, #ffffff 0%, #fefdfb 100%)",
        }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600 }} className="text-muted-foreground mb-3 flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-green-400" />
          {yearData.year} — Month-by-Month Breakdown
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1 mb-4">
          {MONTHS_FULL.map((m, i) => {
            const events = monthGroups[i] || [];
            const hasEvents = events.length > 0;
            const hasIncoming = events.some(e => ["birth", "donated_in", "sperm_donation", "purchased"].includes(e.type));
            const hasOutgoing = events.some(e => ["donated_out", "deceased"].includes(e.type));
            return (
              <div key={m}
                className={`text-center rounded-lg py-1.5 px-1 border transition-all ${hasEvents
                    ? hasOutgoing
                      ? "bg-red-50 border-red-200 shadow-sm"
                      : "bg-green-50 border-green-200 shadow-sm"
                    : "bg-muted/30 border-transparent"
                  }`}
                style={hasEvents ? {
                  boxShadow: hasOutgoing
                    ? "0 2px 8px rgba(239,68,68,0.1)"
                    : "0 2px 8px rgba(40,167,69,0.1)",
                } : {}}>
                <p style={{ fontSize: '0.6rem', fontWeight: 600 }} className={hasEvents ? (hasOutgoing ? "text-red-600" : "text-green-700") : "text-muted-foreground/50"}>
                  {m}
                </p>
                {hasEvents && (
                  <p style={{ fontSize: '0.7rem', fontWeight: 700 }} className={hasOutgoing ? "text-red-600" : "text-green-700"}>
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
              <motion.div key={month}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: month * 0.02 }}
                className="rounded-xl border border-saffron/8 bg-muted/15 p-2.5"
                style={{
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="text-muted-foreground mb-1.5 uppercase tracking-wide">
                  {MONTHS_FULL[month]} {yearData.year}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((event, i) => {
                    const info = eventIcons[event.type] || eventIcons.birth;
                    const Icon = info.icon;
                    return (
                      <motion.div key={i}
                        whileHover={{ scale: 1.05, y: -1 }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${info.bg} cursor-default`}
                        style={{
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}>
                        <Icon className={`w-3 h-3 ${info.color} shrink-0`} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{event.cowName}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
