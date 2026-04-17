import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HandHeart, ArrowDownToLine, ArrowUpFromLine, Search, Filter, Calendar,
  Scale, Phone, User, Building, MapPin, ShieldCheck, ChevronDown, ChevronUp,
  RefreshCw, Flower2,
} from "lucide-react";
import { donationRecords, DonationRecord, getCowById, Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";

type FilterType = "All" | "Donated In" | "Donated Out";
type FilterGender = "All" | "Female" | "Male";

export function Donations() {
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [filterGender, setFilterGender] = useState<FilterGender>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

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
  }, [filterType, filterGender, searchTerm]);

  const donatedInCount = donationRecords.filter(r => r.type === "Donated In").length;
  const donatedOutCount = donationRecords.filter(r => r.type === "Donated Out").length;
  const uniqueOrgs = new Set(donationRecords.map(r => r.contact.organization)).size;
  const uniqueDistricts = new Set(donationRecords.map(r => r.contact.district)).size;

  const handleViewProfile = (cowId: string | null) => {
    if (!cowId) return;
    const cow = getCowById(cowId);
    if (cow) setSelectedCow(cow);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-saffron" />
            Donation Records
          </h1>
          <p style={{ fontSize: "0.8rem" }} className="text-muted-foreground mt-0.5">
            Complete records of cows donated into and out of Somnath Temple Trust Gaushala, with donor/recipient details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Donated In", value: donatedInCount, icon: <ArrowDownToLine className="w-5 h-5" />, color: "from-green-500/10 to-green-600/5", iconColor: "text-green-600", border: "border-green-200" },
          { label: "Donated Out", value: donatedOutCount, icon: <ArrowUpFromLine className="w-5 h-5" />, color: "from-amber-500/10 to-amber-600/5", iconColor: "text-amber-600", border: "border-amber-200" },
          { label: "Unique Donors/Recipients", value: uniqueOrgs, icon: <Building className="w-5 h-5" />, color: "from-blue-500/10 to-blue-600/5", iconColor: "text-blue-600", border: "border-blue-200" },
          { label: "Districts Connected", value: uniqueDistricts, icon: <MapPin className="w-5 h-5" />, color: "from-purple-500/10 to-purple-600/5", iconColor: "text-purple-600", border: "border-purple-200" },
        ].map(kpi => (
          <div key={kpi.label}
            className={`bg-gradient-to-br ${kpi.color} rounded-xl p-4 border ${kpi.border}`}>
            <div className={`${kpi.iconColor} mb-2`}>{kpi.icon}</div>
            <p style={{ fontSize: "1.5rem", fontWeight: 700 }} className="text-foreground">{kpi.value}</p>
            <p style={{ fontSize: "0.7rem" }} className="text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 bg-white rounded-xl border border-saffron/10 p-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, tag, org, district..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-saffron/10 focus:outline-none focus:ring-2 focus:ring-saffron/30"
            style={{ fontSize: "0.8rem" }}
          />
        </div>

        <div className="flex bg-muted/50 rounded-lg p-0.5 border border-saffron/10">
          {(["All", "Donated In", "Donated Out"] as FilterType[]).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === type
                  ? "bg-saffron text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.78rem" }}
            >
              {type === "All" && "All"}
              {type === "Donated In" && (
                <span className="flex items-center gap-1">
                  <ArrowDownToLine className="w-3 h-3" /> Donated In
                </span>
              )}
              {type === "Donated Out" && (
                <span className="flex items-center gap-1">
                  <ArrowUpFromLine className="w-3 h-3" /> Donated Out
                </span>
              )}
            </button>
          ))}
        </div>

        <select
          value={filterGender}
          onChange={e => setFilterGender(e.target.value as FilterGender)}
          className="px-3 py-2 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
          style={{ fontSize: "0.8rem" }}
        >
          <option value="All">All Gender</option>
          <option value="Female">Female (Cows/Calves)</option>
          <option value="Male">Male (Bulls/Calves)</option>
        </select>

        <div className="flex items-center gap-1 px-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span style={{ fontSize: "0.75rem" }} className="text-muted-foreground">
            {filteredRecords.length} records
          </span>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16">
          <HandHeart className="w-12 h-12 text-saffron/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No donation records match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
          <CowCard
            cow={selectedCow}
            onClose={() => setSelectedCow(null)}
            onSelectCow={setSelectedCow}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DonationCard({
  record,
  index,
  isExpanded,
  onToggle,
  onViewProfile,
}: {
  record: DonationRecord;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onViewProfile: (cowId: string | null) => void;
}) {
  const isIn = record.type === "Donated In";
  const dateObj = new Date(record.date);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      className="bg-white rounded-xl border border-saffron/10 overflow-hidden hover:shadow-md hover:shadow-saffron/5 transition-shadow"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isIn
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          {isIn ? (
            <ArrowDownToLine className="w-5 h-5" />
          ) : (
            <ArrowUpFromLine className="w-5 h-5" />
          )}
        </div>

        <div className="shrink-0">
          <ImageWithFallback
            src={record.cowImage}
            alt={record.cowName}
            className={`w-12 h-12 rounded-full object-cover border-2 ${
              isIn ? "border-green-300" : "border-amber-300"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{record.cowName}</h3>
            <span
              style={{ fontSize: "0.6rem" }}
              className={`px-2 py-0.5 rounded-full ${
                isIn
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {record.type}
            </span>
            <span
              style={{ fontSize: "0.6rem" }}
              className="text-muted-foreground/50"
            >
              {record.cowTagNumber}
            </span>
            {record.breedCertified && (
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" title="Breed Certified" />
            )}
          </div>
          <p style={{ fontSize: "0.72rem" }} className="text-muted-foreground mt-0.5 truncate">
            {isIn ? "From" : "To"}: <span className="text-foreground/70">{record.contact.name}</span>
            {" — "}
            <span className="text-foreground/60">{record.contact.organization}</span>
          </p>
        </div>

        <div className="shrink-0 text-right hidden sm:block">
          <p style={{ fontSize: "0.78rem", fontWeight: 500 }} className="text-foreground/70">
            {formattedDate}
          </p>
          <p style={{ fontSize: "0.6rem" }} className="text-muted-foreground">
            {record.cowGender} &bull; {record.ageAtDonation} &bull; {record.weightAtDonation}kg
          </p>
        </div>

        <div className="shrink-0 ml-1">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-saffron/10 pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <SectionHeader icon={<Flower2 className="w-3.5 h-3.5 text-saffron" />} title="Cow Details" />

                  <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={record.cowImage}
                        alt={record.cowName}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-saffron/20"
                      />
                      <div>
                        <p style={{ fontSize: "1rem", fontWeight: 600 }}>{record.cowName}</p>
                        <p style={{ fontSize: "0.7rem" }} className="text-muted-foreground">
                          {record.cowTagNumber} &bull; {record.cowGender} &bull; Gir Breed
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {record.breedCertified && (
                            <span className="flex items-center gap-0.5 text-green-600" style={{ fontSize: "0.6rem" }}>
                              <ShieldCheck className="w-3 h-3" /> Breed Certified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <DetailChip
                        icon={<Calendar className="w-3 h-3" />}
                        label="Date"
                        value={formattedDate}
                      />
                      <DetailChip
                        icon={<Scale className="w-3 h-3" />}
                        label="Weight"
                        value={`${record.weightAtDonation} kg`}
                      />
                      <DetailChip
                        icon={<User className="w-3 h-3" />}
                        label="Age"
                        value={record.ageAtDonation}
                      />
                    </div>

                    <div className="bg-white rounded-lg p-2">
                      <p style={{ fontSize: "0.6rem" }} className="text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                        Health at {isIn ? "Arrival" : "Departure"}
                      </p>
                      <p style={{ fontSize: "0.75rem" }} className="text-foreground/70">
                        {record.healthAtDonation}
                      </p>
                    </div>

                    {record.cowId && (
                      <button
                        onClick={() => onViewProfile(record.cowId)}
                        className="w-full py-2 rounded-lg bg-saffron/8 border border-saffron/15 hover:bg-saffron/15 transition-colors"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <span className="text-saffron-dark">View Full Cow Profile</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-muted/20 rounded-lg p-3 border-l-3 border-saffron/30">
                    <p style={{ fontSize: "0.6rem" }} className="text-muted-foreground/50 uppercase tracking-wider mb-1">
                      Remarks
                    </p>
                    <p style={{ fontSize: "0.78rem" }} className="text-foreground/60 leading-relaxed">
                      {record.remarks}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <SectionHeader
                    icon={
                      isIn ? (
                        <ArrowDownToLine className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-600" />
                      )
                    }
                    title={isIn ? "Donor Details" : "Recipient Details"}
                  />

                  <div
                    className={`rounded-xl p-3 space-y-2.5 ${
                      isIn
                        ? "bg-green-50/50 border border-green-200/50"
                        : "bg-amber-50/50 border border-amber-200/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isIn ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600 }} className="text-foreground">
                          {record.contact.name}
                        </p>
                        <p style={{ fontSize: "0.72rem" }} className="text-muted-foreground flex items-center gap-1">
                          <Building className="w-3 h-3" /> {record.contact.organization}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <ContactChip
                        icon={<MapPin className="w-3 h-3" />}
                        label="District"
                        value={record.contact.district}
                      />
                      <ContactChip
                        icon={<Phone className="w-3 h-3" />}
                        label="Phone"
                        value={record.contact.phone}
                      />
                    </div>

                    <div
                      className={`rounded-lg p-2.5 ${
                        isIn ? "bg-green-100/50" : "bg-amber-100/50"
                      }`}
                    >
                      <p
                        style={{ fontSize: "0.6rem" }}
                        className="text-muted-foreground/50 uppercase tracking-wider mb-1.5"
                      >
                        Point of Contact (PoC)
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              isIn
                                ? "bg-green-200/50 text-green-700"
                                : "bg-amber-200/50 text-amber-700"
                            }`}
                          >
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.78rem", fontWeight: 500 }} className="text-foreground/80">
                              {record.contact.pocName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span style={{ fontSize: "0.7rem" }}>{record.contact.pocPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isIn && (
                    <div className="space-y-2">
                      <SectionHeader
                        icon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
                        title="Current Update"
                      />
                      {record.currentUpdate ? (
                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-200/50">
                          <p
                            style={{ fontSize: "0.78rem" }}
                            className="text-foreground/70 leading-relaxed"
                          >
                            {record.currentUpdate}
                          </p>
                          {record.lastUpdateDate && (
                            <p
                              style={{ fontSize: "0.6rem" }}
                              className="text-blue-500/60 mt-2 flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              Last updated:{" "}
                              {new Date(record.lastUpdateDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/50 text-center">
                          <p
                            style={{ fontSize: "0.75rem" }}
                            className="text-muted-foreground/50 italic"
                          >
                            No updates received yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <h4
        style={{ fontSize: "0.7rem", fontWeight: 600 }}
        className="text-foreground/50 uppercase tracking-widest"
      >
        {title}
      </h4>
    </div>
  );
}

function DetailChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-lg p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-saffron/60 mb-0.5">
        {icon}
        <span
          style={{ fontSize: "0.5rem" }}
          className="text-muted-foreground/40 uppercase tracking-wider"
        >
          {label}
        </span>
      </div>
      <p style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-foreground/70">
        {value}
      </p>
    </div>
  );
}

function ContactChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/60 rounded-lg p-2">
      <div className="flex items-center gap-1 text-muted-foreground/40 mb-0.5">
        {icon}
        <span style={{ fontSize: "0.5rem" }} className="uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p style={{ fontSize: "0.75rem", fontWeight: 500 }} className="text-foreground/70">
        {value}
      </p>
    </div>
  );
}