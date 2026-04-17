import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Calendar, Baby, Droplets, Star, Flower2 } from "lucide-react";
import { cows, Cow, getChildren } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";

const DIYA_IMG = "https://images.unsplash.com/photo-1760973178154-f0d2f4b50816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBvaWwlMjBsYW1wJTIwZGl5YSUyMGZsYW1lfGVufDF8fHx8MTc3MjAwNjE2OXww&ixlib=rb-4.1.0&q=80&w=1080";
const MARIGOLD_IMG = "https://images.unsplash.com/photo-1760963809680-dbc4b0366948?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpZ29sZCUyMGZsb3dlcnMlMjBnYXJsYW5kJTIwb3JhbmdlfGVufDF8fHx8MTc3MjAwNjE2OXww&ixlib=rb-4.1.0&q=80&w=1080";

export function Memorial() {
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const deceasedCows = cows.filter(c => c.status === "Deceased");

  const totalLifetimeMilk = deceasedCows.reduce((s, c) => s + (c.lifetimeMilkLiters || 0), 0);
  const totalCalves = deceasedCows.reduce((s, c) => s + (c.totalCalves || 0), 0);
  const avgYearsOfService = deceasedCows.length > 0
    ? +(deceasedCows.reduce((s, c) => s + (c.yearsOfService || 0), 0) / deceasedCows.length).toFixed(1)
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-56 lg:h-72">
        <ImageWithFallback src={MARIGOLD_IMG} alt="Marigold garland" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e00]/95 via-[#1a0e00]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0e00]/40 to-transparent" />

        <div className="absolute top-4 right-6 w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden opacity-80"
          style={{ boxShadow: "0 0 30px rgba(255,165,0,0.4), 0 0 60px rgba(255,107,0,0.2)" }}>
          <ImageWithFallback src={DIYA_IMG} alt="Diya lamp" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <p style={{ fontSize: '0.65rem' }} className="text-saffron-light/80 tracking-[0.3em] uppercase mb-2">
            Somnath Gaushala
          </p>
          <h1 className="text-white flex items-center gap-3" style={{ fontSize: '1.8rem' }}>
            <Flower2 className="w-7 h-7 text-saffron-light" />
            Memorial Hall
          </h1>
          <p style={{ fontSize: '0.85rem' }} className="text-white/60 mt-1 max-w-xl">
            In loving remembrance of our departed Gau Matas who graced our gaushala with their presence.
            Their service and spirit live on through their children and the herd they helped build.
          </p>

          <div className="flex gap-4 mt-4">
            {[
              { label: "Remembered", value: deceasedCows.length, icon: <Heart className="w-3.5 h-3.5" /> },
              { label: "Calves Given", value: totalCalves, icon: <Baby className="w-3.5 h-3.5" /> },
              { label: "Lifetime Milk", value: `${(totalLifetimeMilk / 1000).toFixed(0)}K L`, icon: <Droplets className="w-3.5 h-3.5" /> },
              { label: "Avg Service", value: `${avgYearsOfService} yrs`, icon: <Star className="w-3.5 h-3.5" /> },
            ].map(s => (
              <div key={s.label}
                className="bg-white/10 backdrop-blur rounded-xl px-3 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-saffron-light mb-0.5">
                  {s.icon}
                  <span style={{ fontSize: '0.55rem' }} className="uppercase tracking-wider text-white/50">{s.label}</span>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }} className="text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {deceasedCows.length === 0 ? (
        <div className="text-center py-16">
          <Flower2 className="w-12 h-12 text-saffron/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No departed souls to remember yet.</p>
          <p style={{ fontSize: '0.8rem' }} className="text-muted-foreground/50 mt-1">May all our Gau Matas live long and healthy lives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {deceasedCows.map((cow, i) => (
            <MemorialCard key={cow.id} cow={cow} index={i} onSelect={setSelectedCow} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center py-8"
      >
        <div className="inline-block bg-gradient-to-r from-saffron/5 via-saffron/10 to-saffron/5 rounded-2xl px-8 py-5 border border-saffron/15"
          style={{ boxShadow: "0 4px 20px rgba(255,107,0,0.06)" }}>
          <Flower2 className="w-6 h-6 text-saffron/40 mx-auto mb-2" />
          <p style={{ fontSize: '0.9rem' }} className="text-saffron-dark/70 italic max-w-md mx-auto">
            "Gavo vishvasya matarah" — Cows are the mothers of the entire world.
          </p>
          <p style={{ fontSize: '0.7rem' }} className="text-muted-foreground/50 mt-2">
            — Rig Veda
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MemorialCard({
  cow, index, onSelect,
}: {
  cow: Cow;
  index: number;
  onSelect: (c: Cow) => void;
}) {
  const children = getChildren(cow.id);
  const birthDate = new Date(cow.dateOfBirth);
  const passingDate = cow.dateOfPassing ? new Date(cow.dateOfPassing) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,165,0,0.05), rgba(255,107,0,0.1))",
          filter: "blur(8px)",
        }}
      />

      <div className="relative bg-white rounded-2xl border border-saffron/15 overflow-hidden"
        style={{
          boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
        }}>

        <div className="relative bg-gradient-to-br from-[#1a0e00] via-[#2a1500] to-[#1a0e00] p-5 pb-4">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-saffron/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-saffron/3 blur-2xl" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative cursor-pointer"
                onClick={() => onSelect(cow)}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-saffron/40"
                  style={{
                    boxShadow: "0 0 15px rgba(255,107,0,0.15), inset 0 0 20px rgba(0,0,0,0.3)",
                  }}>
                  <ImageWithFallback src={cow.image} alt={cow.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-t from-saffron to-yellow-300 flex items-center justify-center"
                  style={{ boxShadow: "0 0 8px rgba(255,165,0,0.5)" }}>
                  <span style={{ fontSize: '0.5rem' }}>🪔</span>
                </div>
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }} className="text-white mb-0.5">{cow.name}</h3>
              <p style={{ fontSize: '0.65rem' }} className="text-saffron-light/70 tracking-widest uppercase">{cow.tagNumber} &bull; Gen {cow.generation}</p>

              <div className="flex items-center gap-1.5 mt-2">
                <Calendar className="w-3 h-3 text-white/30" />
                <span style={{ fontSize: '0.7rem' }} className="text-white/50">
                  {birthDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  {passingDate && (
                    <>
                      {" — "}
                      {passingDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </>
                  )}
                </span>
              </div>
              {cow.yearsOfService != null && (
                <p style={{ fontSize: '0.6rem' }} className="text-saffron-light/50 mt-0.5">
                  {cow.yearsOfService} years of loving service
                </p>
              )}
            </div>
          </div>

          {cow.causeOfDeath && (
            <div className="mt-3 bg-white/5 rounded-lg px-3 py-2 border border-white/5 relative z-10">
              <p style={{ fontSize: '0.55rem' }} className="text-white/25 uppercase tracking-wider mb-0.5">Cause</p>
              <p style={{ fontSize: '0.75rem' }} className="text-white/50">{cow.causeOfDeath}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-saffron/10 border-b border-saffron/10">
          <Stat icon={<Droplets className="w-3 h-3 text-saffron/60" />}
            label="Lifetime Milk"
            value={cow.lifetimeMilkLiters ? `${(cow.lifetimeMilkLiters / 1000).toFixed(1)}K L` : "—"} />
          <Stat icon={<Baby className="w-3 h-3 text-pink-400/60" />}
            label="Calves Given"
            value={cow.totalCalves?.toString() || "—"} />
          <Stat icon={<Star className="w-3 h-3 text-yellow-500/60" />}
            label="Breed Score"
            value={`${cow.totalBreedScore}/10`} />
        </div>

        {children.length > 0 && (
          <div className="px-4 py-3 border-b border-saffron/10">
            <p style={{ fontSize: '0.6rem' }} className="text-muted-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400/40" />
              Living Legacy — {children.length} {children.length === 1 ? "child" : "children"} in the herd
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {children.slice(0, 5).map(child => (
                <button key={child.id} onClick={() => onSelect(child)}
                  className="flex items-center gap-1 bg-saffron/5 hover:bg-saffron/10 rounded-lg px-2 py-1 transition-colors border border-saffron/10">
                  <ImageWithFallback src={child.image} alt={child.name}
                    className="w-5 h-5 rounded-full object-cover border border-saffron/20" />
                  <span style={{ fontSize: '0.65rem' }} className="text-saffron-dark/70">{child.name}</span>
                  <span style={{ fontSize: '0.5rem' }} className="text-muted-foreground/40">{child.status}</span>
                </button>
              ))}
              {children.length > 5 && (
                <span style={{ fontSize: '0.6rem' }} className="text-muted-foreground/40 self-center">+{children.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {cow.memorialNote && (
          <div className="px-4 py-3">
            <p style={{ fontSize: '0.78rem' }} className="text-muted-foreground/60 italic leading-relaxed">
              "{cow.memorialNote}"
            </p>
          </div>
        )}

        <div className="px-4 pb-3">
          <button onClick={() => onSelect(cow)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-saffron/8 to-saffron/4 border border-saffron/15 hover:border-saffron/30 transition-colors text-center"
            style={{ fontSize: '0.7rem' }}>
            <span className="text-saffron-dark/60">View Full Profile</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="py-2.5 px-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <span style={{ fontSize: '0.5rem' }} className="text-muted-foreground/40 uppercase tracking-wider">{label}</span>
      </div>
      <p style={{ fontSize: '0.9rem', fontWeight: 700 }} className="text-foreground/70">{value}</p>
    </div>
  );
}
