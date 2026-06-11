import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HandHeart, ArrowDownToLine, ArrowUpFromLine, Search, Filter, Calendar,
  Scale, Phone, User, Building, ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DonationRecord, getCowById, Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";
import { CowIcon } from "./icons/icons";
import { PageLoader } from "./ui/loader";

type FilterType = "All" | "Donated Out";
type FilterGender = "All" | "Female" | "Male";

interface DonatedOutApi {
  name: string | null;
  tag_number: string | null;
  donated_out_date: string | null;
  donated_to: string | null;
  mobile_number: string | null;
  animal_type: string | null;
  gender: string | null;
}

function mapDonatedOut(api: DonatedOutApi): DonationRecord {
  return {
    id: api.tag_number ?? `donated-${Math.random().toString(36).slice(2, 8)}`,
    cowId: null,
    cowName: api.name ?? "Unknown",
    cowImage: "",
    cowGender: api.gender === "Male" ? "Male" : "Female",
    cowTagNumber: api.tag_number ?? "",
    type: "Donated Out",
    date: api.donated_out_date ?? "",
    contact: {
      name: api.donated_to ?? "Unknown",
      organization: api.donated_to ?? "Unknown",
      district: "",
      phone: api.mobile_number ?? "",
      pocName: api.donated_to ?? "Unknown",
      pocPhone: api.mobile_number ?? "",
    },
    ageAtDonation: "",
    weightAtDonation: 0,
    healthAtDonation: "",
    breedCertified: false,
    remarks: "",
    currentUpdate: null,
    lastUpdateDate: null,
  };
}

export function Donations() {
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [filterGender, setFilterGender] = useState<FilterGender>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

  const { data: apiRecords, isLoading, error } = useQuery<DonatedOutApi[]>({
    queryKey: ["donated-out"],
    queryFn: () => { const base = import.meta.env.VITE_API_URL || "http://localhost:8000"; return fetch(`${base}/donations/donated-out`).then(r => { if (!r.ok) throw new Error("API error"); return r.json(); }) },
  });

  const donationRecords = useMemo(() => (apiRecords ?? []).map(mapDonatedOut), [apiRecords]);

  const filteredRecords = useMemo(() => {
    return donationRecords.filter(r => {
      const matchType = filterType === "All" || r.type === filterType;
      const matchGender = filterGender === "All" || r.cowGender === filterGender;
      const matchSearch =
        r.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cowTagNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchGender && matchSearch;
    });
  }, [donationRecords, filterType, filterGender, searchTerm]);

  const donatedInCount = donationRecords.filter(r => r.type === "Donated In").length;
  const donatedOutCount = donationRecords.filter(r => r.type === "Donated Out").length;
  const uniqueOrgs = new Set(donationRecords.map(r => r.contact.organization)).size;
  const uniqueDistricts = new Set(donationRecords.map(r => r.contact.district).filter(Boolean)).size;

  const handleViewProfile = (cowId: string | null) => {
    if (!cowId) return;
    const cow = getCowById(cowId);
    if (cow) setSelectedCow(cow);
  };

  if (isLoading) return <PageLoader label="Loading donations…" />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="surface p-8 text-center max-w-md"
        >
          <AlertTriangle className="w-8 h-8 text-destructive/70 mx-auto mb-3" />
          <p className="font-medium">Failed to load</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="eyebrow">Donations</p>
        <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] mt-1 flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-saffron" strokeWidth={1.6} />
          Donation records
        </h1>
        <p className="text-[0.82rem] text-muted-foreground mt-1">
          Records of cows donated to and from Somnath Gaushala.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: "Donated in",        value: donatedInCount,     icon: ArrowDownToLine, accent: "success" },
          { label: "Donated out",       value: donatedOutCount,    icon: ArrowUpFromLine, accent: "warning" },
          { label: "Unique recipients", value: uniqueOrgs,         icon: Building,        accent: "info" },
          { label: "Total records",     value: donationRecords.length, icon: HandHeart, accent: "muted" },
        ].map(kpi => {
          const ACC: Record<string, { bg: string; text: string; ring: string }> = {
            success: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
            warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
            info:    { bg: "bg-info/10 dark:bg-blue-500/10", text: "text-info dark:text-blue-300", ring: "ring-info/20 dark:ring-blue-500/20" },
            muted:   { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" },
          };
          const a = ACC[kpi.accent];
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="surface p-4 hover-lift">
              <div className={`w-8 h-8 rounded-md ${a.bg} ${a.text} ring-1 ${a.ring} flex items-center justify-center mb-2.5`}>
                <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
              </div>
              <p className="text-[1.4rem] font-semibold text-foreground metric leading-none">{kpi.value}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-1.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="surface p-2.5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text" placeholder="Search by name, tag, recipient…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-md bg-transparent text-[0.85rem] outline-none placeholder:text-muted-foreground/40 focus:bg-muted/40 transition-colors"
          />
        </div>
        <div className="inline-flex p-0.5 rounded-md bg-muted border border-border">
          {(["All", "Donated Out"] as FilterType[]).map(t => (
            <button
              key={t} onClick={() => setFilterType(t)}
              className={`h-7 px-3 rounded text-[0.75rem] font-medium transition-colors ${
                filterType === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "All" ? "All" : (
                <span className="inline-flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> Donated out</span>
              )}
            </button>
          ))}
        </div>
        <select
          value={filterGender} onChange={e => setFilterGender(e.target.value as FilterGender)}
          className="h-8 px-3 rounded-md bg-muted/40 border border-border text-[0.85rem] outline-none appearance-none focus:bg-card focus:border-foreground/30 transition-colors"
        >
          <option value="All">All gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
        <span className="text-[0.78rem] text-muted-foreground tabular">{filteredRecords.length} records</span>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="surface py-16 text-center">
          <HandHeart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-[0.9rem]">No donation records match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map((record, idx) => (
            <DonationCard
              key={record.id}
              record={record}
              index={idx}
              isExpanded={expandedId === record.id}
              onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DonationCard({
  record, index, isExpanded, onToggle, onViewProfile,
}: {
  record: DonationRecord;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onViewProfile: (cowId: string | null) => void;
}) {
  const isIn = record.type === "Donated In";
  const dateObj = new Date(record.date);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : record.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="surface overflow-hidden hover-lift"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ring-1 ${
          isIn ? "bg-success/10 text-success ring-success/20" : "bg-warning/10 text-warning ring-warning/20"
        }`}>
          {isIn ? <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={1.8} /> : <ArrowUpFromLine className="w-3.5 h-3.5" strokeWidth={1.8} />}
        </div>
        <div className="shrink-0">
          {record.cowImage ? (
            <ImageWithFallback src={record.cowImage} alt={record.cowName} className="w-9 h-9 rounded-md object-cover ring-1 ring-border" />
          ) : (
            <div className={`w-9 h-9 rounded-md flex items-center justify-center ring-1 ${
              isIn ? "bg-success/10 text-success ring-success/20" : "bg-warning/10 text-warning ring-warning/20"
            }`}>
              <CowIcon size={16} strokeWidth={1.6} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[0.92rem] font-semibold text-foreground">{record.cowName}</h3>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-medium border ${
              isIn ? "bg-success/8 text-success border-success/20" : "bg-warning/8 text-warning border-warning/20"
            }`}>
              {isIn ? "Donated in" : "Donated out"}
            </span>
            <span className="text-[0.68rem] text-muted-foreground font-mono">{record.cowTagNumber}</span>
          </div>
          <p className="text-[0.78rem] text-muted-foreground mt-0.5 truncate">
            {isIn ? "From" : "To"}: <span className="text-foreground">{record.contact.name}</span>
          </p>
        </div>
        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-[0.82rem] font-medium text-foreground metric">{formattedDate}</p>
          <p className="text-[0.65rem] text-muted-foreground mt-0.5">{record.cowGender}</p>
        </div>
        <div className="shrink-0 ml-1 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <SectionHeader icon={<CowIcon size={12} strokeWidth={2} className="text-saffron" />} title="Cow details" />
                  <div className="bg-muted/40 rounded-md p-3 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      {record.cowImage ? (
                        <ImageWithFallback src={record.cowImage} alt={record.cowName} className="w-12 h-12 rounded-md object-cover ring-1 ring-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-saffron/10 text-saffron ring-1 ring-saffron/20 flex items-center justify-center text-base font-semibold">
                          {record.cowName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[0.95rem] font-semibold text-foreground">{record.cowName}</p>
                        <p className="text-[0.7rem] text-muted-foreground font-mono">{record.cowTagNumber} · {record.cowGender}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailChip icon={<Calendar className="w-3 h-3" />} label="Date" value={formattedDate} />
                      <DetailChip icon={<Scale className="w-3 h-3" />} label="Gender" value={record.cowGender} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <SectionHeader icon={<Building className="w-3 h-3 text-warning" />} title="Recipient details" />
                  <div className="bg-warning/8 border border-warning/20 rounded-md p-3 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-warning/15 text-warning flex items-center justify-center">
                        <User className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>
                      <p className="text-[0.9rem] font-semibold text-foreground">{record.contact.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailChip icon={<Phone className="w-3 h-3" />} label="Mobile" value={record.contact.phone} />
                      <DetailChip icon={<Building className="w-3 h-3" />} label="Organization" value={record.contact.organization} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <h4 className="eyebrow">{title}</h4>
    </div>
  );
}

function DetailChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-md p-2 border border-border">
      <div className="flex items-center gap-1 text-muted-foreground/60 mb-0.5">
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <p className="text-[0.82rem] font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
