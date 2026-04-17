import { useState, useMemo, useRef } from "react";
import { Plus, Search, Edit2, Save, X, ChevronDown, ChevronUp, Check, AlertTriangle, Upload, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { cows, Cow, CowStatus, CowSource } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Tab = "add" | "edit";

const STATUSES_FEMALE: CowStatus[] = ["Milking", "Pregnant", "Dry", "Calf", "Deceased", "Donated Out"];
const STATUSES_MALE: CowStatus[] = ["Bull", "Calf", "Deceased", "Donated Out"];
const SOURCES: CowSource[] = ["Natural Birth", "Donated", "Sperm Donation", "Purchased"];
const HEALTH_STATUSES = ["Healthy", "Under Treatment", "Vaccinated"] as const;
const GENERATIONS = [0, 1, 2, 3, 4, 5];

const BREED_TRAITS = [
  { key: "headShape", label: "Head Shape" },
  { key: "hornCurvature", label: "Horn Curvature" },
  { key: "earShape", label: "Ear Shape" },
  { key: "humpSize", label: "Hump Size" },
  { key: "dewlap", label: "Dewlap" },
  { key: "bodyFrame", label: "Body Frame" },
  { key: "udderShape", label: "Udder Shape" },
  { key: "coatColor", label: "Coat Color" },
  { key: "tailLength", label: "Tail Length" },
  { key: "overallConformation", label: "Overall Conformation" },
] as const;

type BreedScoreForm = Record<(typeof BREED_TRAITS)[number]["key"], string>;

interface CowForm {
  name: string;
  gender: "Female" | "Male";
  dateOfBirth: string;
  source: CowSource;
  status: CowStatus;
  weight: string;
  generation: string;
  motherId: string;
  fatherId: string;
  healthStatus: "Healthy" | "Under Treatment" | "Vaccinated";
  lastVaccination: string;
  nextVaccination: string;
  dailyMilk: string;
  notes: string;
  imageUrl: string;
  gestationMonths: string;
  expectedDeliveryDate: string;
  lastCalvingDate: string;
  totalCalves: string;
  dateOfPassing: string;
  causeOfDeath: string;
  memorialNote: string;
  breedScore: BreedScoreForm;
}

const DEFAULT_BREED_SCORE: BreedScoreForm = {
  headShape: "6.0", hornCurvature: "6.0", earShape: "6.0",
  humpSize: "6.0", dewlap: "6.0", bodyFrame: "6.0",
  udderShape: "6.0", coatColor: "6.0", tailLength: "6.0", overallConformation: "6.0",
};

const EMPTY_FORM: CowForm = {
  name: "", gender: "Female", dateOfBirth: "", source: "Natural Birth",
  status: "Milking", weight: "", generation: "1", motherId: "", fatherId: "",
  healthStatus: "Healthy", lastVaccination: "", nextVaccination: "",
  dailyMilk: "", notes: "", imageUrl: "",
  gestationMonths: "", expectedDeliveryDate: "", lastCalvingDate: "", totalCalves: "",
  dateOfPassing: "", causeOfDeath: "", memorialNote: "",
  breedScore: { ...DEFAULT_BREED_SCORE },
};

const inputCls =
  "w-full h-9 rounded-md border border-input bg-[#FFF8F0] px-3 py-1 text-sm text-foreground outline-none transition-[color,box-shadow] focus:ring-[3px] focus:ring-saffron/30 focus:border-saffron placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";
const sectionCls = "bg-white rounded-xl border border-saffron/10 p-5 space-y-4";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function SaveBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-4">
      <Check className="w-4 h-4 text-green-600 shrink-0" />
      <p style={{ fontSize: "0.82rem" }}>{message}</p>
    </div>
  );
}

// ─── Photo Upload Field ─────────────────────────────────────────────────────

function PhotoUploadField({
  imageUrl,
  onUrlChange,
  onFileSelect,
}: {
  imageUrl: string;
  onUrlChange: (url: string) => void;
  onFileSelect: (preview: string) => void;
}) {
  const [urlMode, setUrlMode] = useState(!!imageUrl && !imageUrl.startsWith("blob:"));
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    onFileSelect(preview);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    onUrlChange("");
    onFileSelect("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className={labelCls}>Photo</label>
      {imageUrl ? (
        <div className="flex items-center gap-3 bg-muted/20 rounded-lg border border-saffron/10 p-3">
          <img
            src={imageUrl}
            alt="preview"
            className="w-16 h-16 rounded-lg object-cover border border-saffron/20 shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-medium" style={{ fontSize: "0.78rem" }}>Photo selected</p>
            <p className="text-muted-foreground truncate" style={{ fontSize: "0.68rem" }}>
              {imageUrl.startsWith("blob:") ? "Uploaded from device" : imageUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          {!urlMode ? (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragging ? "border-saffron bg-saffron/5" : "border-saffron/20 hover:border-saffron/40 hover:bg-muted/20"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-saffron" />
                </div>
                <p className="text-foreground font-medium" style={{ fontSize: "0.82rem" }}>
                  {dragging ? "Drop to upload" : "Click or drag & drop to upload"}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>JPG, PNG, WEBP · Max 5 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="button"
                onClick={() => setUrlMode(true)}
                className="mt-2 text-muted-foreground hover:text-saffron transition-colors"
                style={{ fontSize: "0.72rem" }}
              >
                Or enter a URL instead →
              </button>
            </>
          ) : (
            <>
              <input
                type="url"
                className={inputCls}
                placeholder="https://..."
                value={imageUrl}
                onChange={e => onUrlChange(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setUrlMode(false)}
                className="mt-2 text-muted-foreground hover:text-saffron transition-colors"
                style={{ fontSize: "0.72rem" }}
              >
                ← Upload a file instead
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Milk Calendar ────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY = new Date("2026-02-26");

function MilkCalendarSection({
  log,
  onChange,
}: {
  log: Record<string, string>;
  onChange: (log: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(true);
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const dateKey = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthEntries = Object.entries(log).filter(([k]) => {
    const [y, m] = k.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1;
  });
  const totalLitres = monthEntries.reduce((s, [, v]) => s + (parseFloat(v) || 0), 0);
  const filledDays = monthEntries.filter(([, v]) => parseFloat(v) > 0).length;
  const avg = filledDays > 0 ? (totalLitres / filledDays).toFixed(1) : "—";

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isFutureMonth =
      viewYear > TODAY.getFullYear() ||
      (viewYear === TODAY.getFullYear() && viewMonth >= TODAY.getMonth());
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const setDay = (day: number, val: string) =>
    onChange({ ...log, [dateKey(day)]: val });

  const isFutureDay = (day: number) =>
    new Date(viewYear, viewMonth, day) > TODAY;

  const isNextMonthFuture =
    viewYear > TODAY.getFullYear() ||
    (viewYear === TODAY.getFullYear() && viewMonth >= TODAY.getMonth());

  return (
    <div className="bg-white rounded-xl border border-saffron/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Droplets className="w-4 h-4 text-saffron" />
          <span className="font-medium text-foreground" style={{ fontSize: "0.9rem" }}>
            Daily Milk Log
          </span>
          {filledDays > 0 && (
            <span
              className="px-2 py-0.5 rounded-full bg-saffron/10 text-saffron font-semibold"
              style={{ fontSize: "0.72rem" }}
            >
              {totalLitres.toFixed(1)} L this month
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-saffron/10">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-saffron/5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="font-medium text-foreground" style={{ fontSize: "0.85rem" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isNextMonthFuture}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Day column headers */}
          <div className="grid grid-cols-7 gap-1 px-4 pt-3 pb-1">
            {DAY_LABELS.map(d => (
              <div
                key={d}
                className="text-center text-muted-foreground uppercase font-medium"
                style={{ fontSize: "0.6rem" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 px-4 pb-4">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(day);
              const val = log[key] ?? "";
              const isToday =
                viewYear === TODAY.getFullYear() &&
                viewMonth === TODAY.getMonth() &&
                day === TODAY.getDate();
              const future = isFutureDay(day);
              const hasValue = parseFloat(val) > 0;

              return (
                <div
                  key={day}
                  className={`rounded-lg border flex flex-col items-center p-1 gap-0.5 transition-colors ${
                    isToday
                      ? "border-saffron/50 bg-saffron/5"
                      : hasValue
                        ? "border-green-200 bg-green-50/60"
                        : "border-saffron/10 bg-muted/10"
                  } ${future ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <span
                    className={`font-semibold leading-none ${
                      isToday ? "text-saffron" : "text-muted-foreground"
                    }`}
                    style={{ fontSize: "0.58rem" }}
                  >
                    {day}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    disabled={future}
                    value={val}
                    onChange={e => setDay(day, e.target.value)}
                    placeholder="—"
                    className="w-full text-center bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/30 focus:bg-white focus:rounded focus:ring-1 focus:ring-saffron/30"
                    style={{ fontSize: "0.7rem", padding: "1px 0" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-6 px-5 py-3 border-t border-saffron/10 bg-muted/10">
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Month Total</p>
              <p className="font-bold text-foreground" style={{ fontSize: "0.88rem" }}>
                {totalLitres.toFixed(1)} L
              </p>
            </div>
            <div className="w-px h-7 bg-saffron/10" />
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Daily Average</p>
              <p className="font-bold text-foreground" style={{ fontSize: "0.88rem" }}>{avg} L</p>
            </div>
            <div className="w-px h-7 bg-saffron/10" />
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Days Logged</p>
              <p className="font-bold text-foreground" style={{ fontSize: "0.88rem" }}>
                {filledDays} / {daysInMonth}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cowToForm(cow: Cow): CowForm {
  return {
    name: cow.name,
    gender: cow.gender,
    dateOfBirth: cow.dateOfBirth,
    source: cow.source,
    status: cow.status,
    weight: String(cow.weight),
    generation: String(cow.generation),
    motherId: cow.motherId || "",
    fatherId: cow.fatherId || "",
    healthStatus: cow.healthStatus,
    lastVaccination: cow.lastVaccination,
    nextVaccination: cow.nextVaccination,
    dailyMilk: cow.dailyMilk > 0 ? String(cow.dailyMilk) : "",
    notes: cow.notes,
    imageUrl: cow.image,
    gestationMonths: cow.gestationMonths ? String(cow.gestationMonths) : "",
    expectedDeliveryDate: cow.expectedDeliveryDate || "",
    lastCalvingDate: cow.lastCalvingDate || "",
    totalCalves: cow.totalCalves > 0 ? String(cow.totalCalves) : "",
    dateOfPassing: cow.dateOfPassing || "",
    causeOfDeath: cow.causeOfDeath || "",
    memorialNote: cow.memorialNote || "",
    breedScore: {
      headShape: String(cow.breedScore.headShape),
      hornCurvature: String(cow.breedScore.hornCurvature),
      earShape: String(cow.breedScore.earShape),
      humpSize: String(cow.breedScore.humpSize),
      dewlap: String(cow.breedScore.dewlap),
      bodyFrame: String(cow.breedScore.bodyFrame),
      udderShape: String(cow.breedScore.udderShape),
      coatColor: String(cow.breedScore.coatColor),
      tailLength: String(cow.breedScore.tailLength),
      overallConformation: String(cow.breedScore.overallConformation),
    },
  };
}

// ─── Breed Score Section ─────────────────────────────────────────────────────

function BreedScoreSection({
  scores,
  onChange,
}: {
  scores: BreedScoreForm;
  onChange: (key: string, val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const avg = (
    Object.values(scores).reduce((s, v) => s + parseFloat(v || "0"), 0) /
    BREED_TRAITS.length
  ).toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-saffron/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground" style={{ fontSize: "0.9rem" }}>
            Breed Score
          </span>
          <span
            className="px-2 py-0.5 rounded-full bg-saffron/10 text-saffron font-semibold"
            style={{ fontSize: "0.72rem" }}
          >
            Avg {avg} / 10
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t border-saffron/10 pt-4">
          {BREED_TRAITS.map(trait => {
            const val = parseFloat(scores[trait.key] || "0");
            return (
              <div key={trait.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls + " mb-0"}>{trait.label}</label>
                  <span className="text-saffron font-semibold" style={{ fontSize: "0.8rem" }}>
                    {val.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={scores[trait.key]}
                  onChange={e => onChange(trait.key, e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-saffron cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Cow Form (shared for Add & Edit) ────────────────────────────────────────

function CowFormFields({
  form,
  setField,
  setBreedScore,
  milkLog,
  setMilkLog,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  form: CowForm;
  setField: (key: keyof CowForm, val: string) => void;
  setBreedScore: (key: string, val: string) => void;
  milkLog: Record<string, string>;
  setMilkLog: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
}) {
  const femaleCows = useMemo(
    () => cows.filter(c => c.gender === "Female" && c.status !== "Deceased" && c.status !== "Donated Out"),
    []
  );
  const maleCows = useMemo(
    () => cows.filter(c => c.gender === "Male" && c.status !== "Deceased" && c.status !== "Donated Out"),
    []
  );

  const statuses = form.gender === "Female" ? STATUSES_FEMALE : STATUSES_MALE;
  const isMilking = form.status === "Milking" || form.status === "Pregnant";
  const isPregnant = form.status === "Pregnant";
  const isDeceased = form.status === "Deceased";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className={sectionCls}>
        <h4 className="font-semibold text-foreground" style={{ fontSize: "0.9rem" }}>
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              required
              className={inputCls}
              placeholder="e.g. Kamdhenu"
              value={form.name}
              onChange={e => setField("name", e.target.value)}
            />
          </Field>
          <Field label="Gender">
            <select
              className={inputCls}
              value={form.gender}
              onChange={e => setField("gender", e.target.value as "Female" | "Male")}
            >
              <option>Female</option>
              <option>Male</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input
              required
              type="date"
              className={inputCls}
              value={form.dateOfBirth}
              onChange={e => setField("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field label="Breed">
            <input className={inputCls} value="Gir" disabled />
          </Field>
          <Field label="Source / Origin">
            <select
              className={inputCls}
              value={form.source}
              onChange={e => setField("source", e.target.value as CowSource)}
            >
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={e => setField("status", e.target.value as CowStatus)}
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Weight (kg)">
            <input
              required
              type="number"
              min="10"
              max="900"
              className={inputCls}
              placeholder="e.g. 340"
              value={form.weight}
              onChange={e => setField("weight", e.target.value)}
            />
          </Field>
          <Field label="Generation">
            <select
              className={inputCls}
              value={form.generation}
              onChange={e => setField("generation", e.target.value)}
            >
              {GENERATIONS.map(g => (
                <option key={g} value={g}>Gen {g}{g === 0 ? " (Foundation)" : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Mother">
            <select
              className={inputCls}
              value={form.motherId}
              onChange={e => setField("motherId", e.target.value)}
            >
              <option value="">— None / Unknown —</option>
              {femaleCows.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.tagNumber})</option>
              ))}
            </select>
          </Field>
          <Field label="Father">
            <select
              className={inputCls}
              value={form.fatherId}
              onChange={e => setField("fatherId", e.target.value)}
            >
              <option value="">— None / Sperm Donation —</option>
              {maleCows.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.tagNumber})</option>
              ))}
            </select>
          </Field>
          <PhotoUploadField
            imageUrl={form.imageUrl}
            onUrlChange={url => setField("imageUrl", url)}
            onFileSelect={preview => setField("imageUrl", preview)}
          />
          <div className="md:col-span-2">
            <Field label="Notes">
              <textarea
                rows={2}
                className={inputCls + " h-auto py-2 resize-none"}
                placeholder="Additional observations or notes about this cow"
                value={form.notes}
                onChange={e => setField("notes", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Health & Vaccination */}
      <div className={sectionCls}>
        <h4 className="font-semibold text-foreground" style={{ fontSize: "0.9rem" }}>
          Health & Vaccination
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Health Status">
            <select
              className={inputCls}
              value={form.healthStatus}
              onChange={e => setField("healthStatus", e.target.value as typeof HEALTH_STATUSES[number])}
            >
              {HEALTH_STATUSES.map(h => <option key={h}>{h}</option>)}
            </select>
          </Field>
          {isMilking && (
            <Field label="Daily Milk Output (Litres)">
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputCls}
                placeholder="e.g. 8.5"
                value={form.dailyMilk}
                onChange={e => setField("dailyMilk", e.target.value)}
              />
            </Field>
          )}
          <Field label="Last Vaccination Date">
            <input
              type="date"
              className={inputCls}
              value={form.lastVaccination}
              onChange={e => setField("lastVaccination", e.target.value)}
            />
          </Field>
          <Field label="Next Vaccination Due">
            <input
              type="date"
              className={inputCls}
              value={form.nextVaccination}
              onChange={e => setField("nextVaccination", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Pregnancy Details */}
      {isPregnant && (
        <div className={sectionCls}>
          <h4 className="font-semibold text-foreground" style={{ fontSize: "0.9rem" }}>
            Pregnancy Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gestation Months (so far)">
              <input
                type="number"
                min="1"
                max="9"
                className={inputCls}
                placeholder="1 – 9"
                value={form.gestationMonths}
                onChange={e => setField("gestationMonths", e.target.value)}
              />
            </Field>
            <Field label="Expected Delivery Date">
              <input
                type="date"
                className={inputCls}
                value={form.expectedDeliveryDate}
                onChange={e => setField("expectedDeliveryDate", e.target.value)}
              />
            </Field>
            <Field label="Last Calving Date">
              <input
                type="date"
                className={inputCls}
                value={form.lastCalvingDate}
                onChange={e => setField("lastCalvingDate", e.target.value)}
              />
            </Field>
            <Field label="Total Calves to Date">
              <input
                type="number"
                min="0"
                className={inputCls}
                placeholder="e.g. 3"
                value={form.totalCalves}
                onChange={e => setField("totalCalves", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Deceased Details */}
      {isDeceased && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h4 className="font-semibold text-red-800" style={{ fontSize: "0.9rem" }}>
              Passing Details
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date of Passing">
              <input
                type="date"
                className={inputCls}
                value={form.dateOfPassing}
                onChange={e => setField("dateOfPassing", e.target.value)}
              />
            </Field>
            <Field label="Cause of Passing">
              <input
                className={inputCls}
                placeholder="e.g. Old age — passed peacefully"
                value={form.causeOfDeath}
                onChange={e => setField("causeOfDeath", e.target.value)}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Memorial Note">
                <textarea
                  rows={2}
                  className={inputCls + " h-auto py-2 resize-none"}
                  placeholder="A note in memory of this cow..."
                  value={form.memorialNote}
                  onChange={e => setField("memorialNote", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Daily Milk Log Calendar */}
      {isMilking && (
        <MilkCalendarSection
          log={milkLog}
          onChange={setMilkLog}
        />
      )}

      {/* Breed Score */}
      <BreedScoreSection scores={form.breedScore} onChange={setBreedScore} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-saffron/20 text-muted-foreground hover:bg-muted/30 transition-colors text-sm"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md shadow-saffron/20 text-sm"
        >
          <Save className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Add New Cow ─────────────────────────────────────────────────────────────

function AddCowPanel() {
  const [form, setForm] = useState<CowForm>({ ...EMPTY_FORM, breedScore: { ...DEFAULT_BREED_SCORE } });
  const [milkLog, setMilkLog] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const setField = (key: keyof CowForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const setBreedScore = (key: string, val: string) =>
    setForm(f => ({ ...f, breedScore: { ...f.breedScore, [key]: val } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setForm({ ...EMPTY_FORM, breedScore: { ...DEFAULT_BREED_SCORE } });
    setMilkLog({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setSaved(false), 5000);
  };

  return (
    <div>
      {saved && <SaveBanner message="New cow record added successfully." />}
      <CowFormFields
        form={form}
        setField={setField}
        setBreedScore={setBreedScore}
        milkLog={milkLog}
        setMilkLog={setMilkLog}
        submitLabel="Add Cow"
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── Edit Existing Cow ────────────────────────────────────────────────────────

function EditCowPanel() {
  const [search, setSearch] = useState("");
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [form, setForm] = useState<CowForm>({ ...EMPTY_FORM, breedScore: { ...DEFAULT_BREED_SCORE } });
  const [milkLog, setMilkLog] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cows
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.tagNumber.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [search]);

  const setField = (key: keyof CowForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const setBreedScore = (key: string, val: string) =>
    setForm(f => ({ ...f, breedScore: { ...f.breedScore, [key]: val } }));

  const handleSelect = (cow: Cow) => {
    setSelectedCow(cow);
    setForm(cowToForm(cow));
    setSaved(false);
    // Pre-populate milk log from monthly records (spread evenly per day as a baseline)
    const log: Record<string, string> = {};
    cow.milkOutput.forEach(rec => {
      const year = rec.year;
      const monthIdx = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(rec.month);
      if (monthIdx === -1) return;
      const days = new Date(year, monthIdx + 1, 0).getDate();
      const daily = +(rec.liters / days * 30 / days).toFixed(1);
      for (let d = 1; d <= days; d++) {
        const key = `${year}-${String(monthIdx + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        log[key] = String(daily);
      }
    });
    setMilkLog(log);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  const handleCancel = () => {
    setSelectedCow(null);
    setSaved(false);
    setMilkLog({});
  };

  const statusDot: Record<string, string> = {
    Milking: "bg-green-500", Pregnant: "bg-pink-500", Dry: "bg-gray-400",
    Calf: "bg-cyan-500", Bull: "bg-navy", Deceased: "bg-red-700",
    "Donated Out": "bg-amber-600",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
      {/* Cow List */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-saffron/10 overflow-hidden">
        <div className="p-4 border-b border-saffron/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className={inputCls + " pl-9"}
              placeholder="Search by name, tag, or status…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          {filtered.map(cow => (
            <button
              key={cow.id}
              type="button"
              onClick={() => handleSelect(cow)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-saffron/5 last:border-0
                ${selectedCow?.id === cow.id
                  ? "bg-saffron/10 border-l-2 border-l-saffron"
                  : "hover:bg-muted/30"
                }`}
            >
              <ImageWithFallback
                src={cow.image}
                alt={cow.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-saffron/20"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground" style={{ fontSize: "0.82rem" }}>
                  {cow.name}
                </p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "0.68rem" }}>
                  {cow.tagNumber} · Gen {cow.generation} · {cow.gender}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={`w-2 h-2 rounded-full ${statusDot[cow.status] ?? "bg-gray-400"}`} />
                <span className="text-muted-foreground" style={{ fontSize: "0.68rem" }}>{cow.status}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8" style={{ fontSize: "0.82rem" }}>
              No cows match your search.
            </p>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="lg:col-span-3">
        {selectedCow ? (
          <div>
            <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-saffron/10 p-4">
              <ImageWithFallback
                src={selectedCow.image}
                alt={selectedCow.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-saffron/30"
              />
              <div>
                <p className="font-semibold text-foreground" style={{ fontSize: "0.95rem" }}>
                  {selectedCow.name}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                  {selectedCow.tagNumber} · {selectedCow.breed} · Gen {selectedCow.generation}
                </p>
              </div>
              <div className="ml-auto">
                <Edit2 className="w-4 h-4 text-saffron" />
              </div>
            </div>
            {saved && <SaveBanner message={`Changes to ${selectedCow.name}'s record saved successfully.`} />}
            <CowFormFields
              form={form}
              setField={setField}
              setBreedScore={setBreedScore}
              milkLog={milkLog}
              setMilkLog={setMilkLog}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-saffron/10 flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center mb-4">
              <Edit2 className="w-6 h-6 text-saffron" />
            </div>
            <p className="font-medium text-foreground mb-1" style={{ fontSize: "0.95rem" }}>
              Select a cow to edit
            </p>
            <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
              Search and select a cow from the list on the left. You can update all details, status, health records, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function AdminHerd() {
  const [tab, setTab] = useState<Tab>("add");

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-foreground font-bold" style={{ fontSize: "1.4rem" }}>
          Herd Management
        </h1>
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.82rem" }}>
          Add new cows to the herd or update existing records, health details, and statuses.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-saffron/10">
        {(["add", "edit"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-white text-foreground shadow-sm border border-saffron/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "add" ? (
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add New Cow
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Edit Existing Cow
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "add" ? <AddCowPanel /> : <EditCowPanel />}
    </div>
  );
}
