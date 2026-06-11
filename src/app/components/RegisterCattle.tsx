import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, Flower2, GitBranch, Shield, ChevronRight, ChevronLeft, ImagePlus, Trash2, Upload } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ACQUISITION_TYPES = ["BIRTH", "DONATION", "PURCHASED", "બહારથી આવેલ"];
const PHYSICAL_TRAITS = [
  { key: "hip_width", label: "Hip Width", type: "text" }, { key: "head", label: "Head Score", type: "number" },
  { key: "ear", label: "Ear Score", type: "number" }, { key: "eye", label: "Eye Score", type: "number" },
  { key: "muzzle", label: "Muzzle Score", type: "number" }, { key: "horn", label: "Horn Score", type: "number" },
  { key: "skin", label: "Skin Score", type: "number" }, { key: "tail", label: "Tail Score", type: "number" },
  { key: "hump", label: "Hump Score", type: "number" }, { key: "udder", label: "Udder Score", type: "number" },
  { key: "teat", label: "Teat Score", type: "number" }, { key: "dewlap", label: "Dewlap Score", type: "number" },
  { key: "milk_vein", label: "Milk Vein Score", type: "number" },
] as const;

export function RegisterCattle() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; tag_number?: string } | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "", tag_number: "", gender: "", animal_type: "", acquisition_type: "", date_of_birth: "", weight_at_birth: "",
    is_pregnant: false, is_milking: false, brucellosis_status: "UNKNOWN",
    mother_name: "", mother_tag_number: "", father_name: "", father_tag_number: "",
  });
  const [physical, setPhysical] = useState<Record<string, string>>(Object.fromEntries(PHYSICAL_TRAITS.map(t => [t.key, "0"])));
  const [motherSearch, setMotherSearch] = useState(""); const [fatherSearch, setFatherSearch] = useState("");
  const [motherResults, setMotherResults] = useState<any[]>([]); const [fatherResults, setFatherResults] = useState<any[]>([]);
  const [motherOpen, setMotherOpen] = useState(false); const [fatherOpen, setFatherOpen] = useState(false);

  const ageInMonths = useMemo(() => {
    if (!form.date_of_birth) return 999; const d = new Date(form.date_of_birth); if (isNaN(d.getTime())) return 999;
    return (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
  }, [form.date_of_birth]);
  const animalTypeOptions = useMemo(() => {
    if (!form.gender) return [];
    if (form.gender === "Female" && ageInMonths < 36) return ["FEMALE CALF", "COW", "આજીવન મા બની શકશે નહી"];
    if (form.gender === "Female") return ["COW"];
    if (form.gender === "Male" && ageInMonths < 36) return ["MALE CALF", "OX", "BULL"];
    if (form.gender === "Male") return ["OX", "BULL"]; return [];
  }, [form.gender, ageInMonths]);
  useEffect(() => { if (!animalTypeOptions.includes(form.animal_type)) setForm(p => ({ ...p, animal_type: "" })); }, [animalTypeOptions]);

  const sf = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
  const removeImageFile = (i: number) => setImageFiles(p => p.filter((_, idx) => idx !== i));

  const searchCattle = useCallback(async (q: string, cb: (r: any[]) => void) => {
    if (!q?.trim()) { cb([]); return; }
    try { const r = await fetch(`${API}/cattle-search?q=${encodeURIComponent(q)}`); cb(await r.json() || []); } catch { cb([]); }
  }, []);
  useEffect(() => { searchCattle(motherSearch, setMotherResults); }, [motherSearch]);
  useEffect(() => { searchCattle(fatherSearch, setFatherResults); }, [fatherSearch]);

  const selectParent = (type: "mother" | "father", row: any) => {
    if (type === "mother") { sf("mother_tag_number", row.tag_number); sf("mother_name", row.name); setMotherSearch(row.name); setMotherResults([]); setMotherOpen(false); }
    else { sf("father_tag_number", row.tag_number); sf("father_name", row.name); setFatherSearch(row.name); setFatherResults([]); setFatherOpen(false); }
  };
  const clearParent = (type: "mother" | "father") => {
    if (type === "mother") { sf("mother_tag_number", ""); sf("mother_name", ""); setMotherSearch(""); }
    else { sf("father_tag_number", ""); sf("father_name", ""); setFatherSearch(""); }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!imageFiles.length) return []; setUploading(true);
    const fd = new FormData(); imageFiles.forEach(f => fd.append("files", f));
    try { const r = await fetch(`${API}/cattle/images/upload`, { method: "POST", body: fd }); const d = await r.json(); return d.files || []; }
    catch { return []; } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.gender) return; setLoading(true); setResult(null);
    try {
      const uploadedUrls = await uploadImages();
      const res = await fetch(`${API}/cattle/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.name, tag_number: form.tag_number || undefined, gender: form.gender, animal_type: form.animal_type || undefined,
        acquisition_type: form.acquisition_type || undefined, date_of_birth: form.date_of_birth || undefined,
        mother_name: form.mother_name || undefined, mother_tag_number: form.mother_tag_number || undefined,
        father_name: form.father_name || undefined, father_tag_number: form.father_tag_number || undefined,
        weight_at_birth: form.weight_at_birth ? parseFloat(form.weight_at_birth) : undefined,
        is_pregnant: form.is_pregnant ? 1 : 0, is_milking: form.is_milking ? 1 : 0, brucellosis_status: form.brucellosis_status,
      })});
      const data = await res.json();
      if (data.success) {
        await fetch(`${API}/cattle/physical-logs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: data.tag_number, ...Object.fromEntries(PHYSICAL_TRAITS.map(t => [t.key, physical[t.key] || "0"])) }) });
        if (uploadedUrls.length) { const fullUrls = uploadedUrls.map(u => u.startsWith("http") ? u : `${API}${u}`); await fetch(`${API}/cattle/images/batch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: data.tag_number, images: fullUrls }) }); }
      }
      setResult(data);
    } catch { setResult({ success: false, message: "Network error" }); }
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      <Header onBack={() => navigate(-1)} step={step} />
      <Progress step={step} />
      {result && <Toast result={result} />}
      <div className="surface p-5">
        {step === 1 && <Step1 form={form} sf={sf} ageInMonths={ageInMonths} animalTypeOptions={animalTypeOptions} />}
        {step === 2 && <Step2 {...{ motherSearch, setMotherSearch, motherResults, motherOpen, setMotherOpen, fatherSearch, setFatherSearch, fatherResults, fatherOpen, setFatherOpen, form, selectParent, clearParent }} />}
        {step === 3 && <Step3 physical={physical} setPhysical={setPhysical} imageFiles={imageFiles} setImageFiles={setImageFiles} removeImageFile={removeImageFile} uploading={uploading} />}
        <Nav step={step} setStep={setStep} loading={loading} onSubmit={handleSubmit} canNext={!!form.name && !!form.gender} />
      </div>
    </div>
  );
}

function Header({ onBack, step }: { onBack: () => void; step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2.5"
    >
      <button onClick={onBack} className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
      </button>
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] flex items-center gap-2 mt-0.5">
          <Flower2 className="w-5 h-5 text-saffron" strokeWidth={1.6} /> Register cattle
        </h1>
        <p className="text-[0.82rem] text-muted-foreground">Step {step} of 3</p>
      </div>
    </motion.div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3].map(i => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${step >= i ? "bg-foreground" : "bg-border"}`} />
      ))}
    </div>
  );
}

function Toast({ result }: { result: { success: boolean; message: string; tag_number?: string } }) {
  return (
    <div className={`surface p-3 flex items-center gap-2.5 ${result.success ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
      {result.success
        ? <CheckCircle className="w-3.5 h-3.5 text-success" />
        : <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
      }
      <div>
        <p className="font-medium text-[0.88rem] text-foreground">{result.message}</p>
        {result.tag_number && <p className="text-[0.78rem] text-muted-foreground font-mono">Tag: {result.tag_number}</p>}
      </div>
    </div>
  );
}

function Nav({ step, setStep, loading, onSubmit, canNext }: { step: number; setStep: (s: number) => void; loading: boolean; onSubmit: () => void; canNext: boolean }) {
  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
      {step > 1
        ? <button onClick={() => setStep(step - 1)} className="h-9 px-4 rounded-lg border border-border text-foreground text-[0.85rem] font-medium hover:bg-muted transition-colors inline-flex items-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
        : <div />
      }
      <div className="flex items-center gap-2">
        {step < 3 && (
          <button onClick={() => setStep(step + 1)} disabled={!canNext} className="h-9 px-4 rounded-lg bg-foreground text-background text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        {step === 3 && (
          <button onClick={onSubmit} disabled={loading || !canNext} className="h-9 px-5 rounded-lg bg-foreground text-background text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2">
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Registering…</>
              : <><CheckCircle className="w-3.5 h-3.5" /> Register Cattle</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

function Step1({ form, sf, ageInMonths, animalTypeOptions }: any) {
  return (
    <>
      <h3 className="eyebrow mb-4 flex items-center gap-1.5"><Flower2 className="w-3.5 h-3.5 text-saffron" /> Basic information</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <F label="Cattle Name *" value={form.name} onChange={v => sf("name", v)} placeholder="e.g. Lakshmi" />
          <F label="Tag Number" value={form.tag_number} onChange={v => sf("tag_number", v)} placeholder="Auto-generated" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <S label="Gender *" value={form.gender} onChange={v => sf("gender", v)} options={[{ v: "", l: "Select…" }, { v: "Female", l: "Female" }, { v: "Male", l: "Male" }]} />
          <F label="Date of Birth" value={form.date_of_birth} onChange={v => sf("date_of_birth", v)} type="date" />
        </div>
        {form.gender && (
          <S
            label={`Animal Type ${ageInMonths < 999 ? `(~${Math.floor(ageInMonths / 12)}y ${ageInMonths % 12}m)` : ""}`}
            value={form.animal_type} onChange={v => sf("animal_type", v)}
            options={[{ v: "", l: "Select…" }, ...animalTypeOptions.map((a: string) => ({ v: a, l: a }))]}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <S label="Acquisition Type" value={form.acquisition_type} onChange={v => sf("acquisition_type", v)} options={[{ v: "", l: "Select…" }, ...ACQUISITION_TYPES.map(a => ({ v: a, l: a }))]} />
          <F label="Weight at Birth (kg)" value={form.weight_at_birth} onChange={v => sf("weight_at_birth", v)} type="number" placeholder="e.g. 25.5" />
        </div>
        <S label="Brucellosis Status" value={form.brucellosis_status} onChange={v => sf("brucellosis_status", v)} options={[{ v: "UNKNOWN", l: "Unknown" }, { v: "NOT_VACCINATED", l: "Not Vaccinated" }, { v: "VACCINATED", l: "Vaccinated" }, { v: "NOT_APPLICABLE", l: "Not Applicable" }]} />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-[0.85rem] text-foreground">
            <input type="checkbox" checked={form.is_pregnant} onChange={e => sf("is_pregnant", e.target.checked)} className="w-4 h-4 rounded border-border text-saffron focus:ring-saffron/30" />
            <span>Currently pregnant</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[0.85rem] text-foreground">
            <input type="checkbox" checked={form.is_milking} onChange={e => sf("is_milking", e.target.checked)} className="w-4 h-4 rounded border-border text-saffron focus:ring-saffron/30" />
            <span>Currently milking</span>
          </label>
        </div>
      </div>
    </>
  );
}

function Step2(props: any) {
  const { motherSearch, setMotherSearch, motherResults, motherOpen, setMotherOpen, fatherSearch, setFatherSearch, fatherResults, fatherOpen, setFatherOpen, form, selectParent, clearParent } = props;
  return (
    <>
      <h3 className="eyebrow mb-4 flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 text-saffron" /> Parent details</h3>
      <div className="space-y-4">
        <ParentSearch label="Search mother" search={motherSearch} setSearch={setMotherSearch} results={motherResults} open={motherOpen} setOpen={setMotherOpen} selectedTag={form.mother_tag_number} selectedName={form.mother_name} onSelect={(r: any) => selectParent("mother", r)} onClear={() => clearParent("mother")} />
        <ParentSearch label="Search father" search={fatherSearch} setSearch={setFatherSearch} results={fatherResults} open={fatherOpen} setOpen={setFatherOpen} selectedTag={form.father_tag_number} selectedName={form.father_name} onSelect={(r: any) => selectParent("father", r)} onClear={() => clearParent("father")} />
      </div>
    </>
  );
}

function Step3({ physical, setPhysical, imageFiles, setImageFiles, removeImageFile, uploading }: any) {
  return (
    <>
      <h3 className="eyebrow mb-4 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-saffron" /> Physical conformation
        <span className="text-[0.72rem] font-normal text-muted-foreground normal-case tracking-normal">(optional — defaults 0)</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PHYSICAL_TRAITS.map(t =>
          <F key={t.key} label={t.label} value={physical[t.key]} onChange={v => setPhysical((p: any) => ({ ...p, [t.key]: v }))} type={t.type} placeholder="0" />
        )}
      </div>
      <hr className="border-border my-4" />
      <h3 className="eyebrow mb-4 flex items-center gap-1.5">
        <ImagePlus className="w-3.5 h-3.5 text-saffron" /> Cattle images
        <span className="text-[0.72rem] font-normal text-muted-foreground normal-case tracking-normal">(optional)</span>
      </h3>
      <div className="space-y-2">
        {imageFiles.map((f: File, i: number) => (
          <div key={i} className="flex items-center justify-between surface-soft px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Upload className="w-3.5 h-3.5 text-saffron shrink-0" />
              <span className="text-[0.85rem] text-foreground truncate">{f.name}</span>
              <span className="text-[0.72rem] text-muted-foreground shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button type="button" onClick={() => removeImageFile(i)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-saffron/40 hover:bg-muted/30 transition-colors">
          <ImagePlus className="w-5 h-5 text-muted-foreground" />
          <span className="text-[0.85rem] text-muted-foreground">Click to upload images</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={e => { if (e.target.files) setImageFiles((p: File[]) => [...p, ...Array.from(e.target.files!)]) }} />
        </label>
        {uploading && (
          <p className="text-[0.78rem] text-saffron inline-flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> Uploading…
          </p>
        )}
      </div>
    </>
  );
}

function ParentSearch({ label, search, setSearch, results, open, setOpen, selectedTag, selectedName, onSelect, onClear }: any) {
  return (
    <div>
      <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">{label}</label>
      {selectedTag ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-lg px-3 py-2.5">
          <div>
            <span className="text-[0.88rem] font-medium text-foreground">{selectedName || selectedTag}</span>
            <span className="text-[0.78rem] text-muted-foreground ml-2 font-mono">{selectedTag}</span>
          </div>
          <button type="button" onClick={onClear} className="text-[0.78rem] text-red-500 hover:underline">Remove</button>
        </div>
      ) : (
        <div className="relative">
          <input
            value={search} onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 250)}
            placeholder="Type to search by name or tag…"
            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[0.85rem] outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/15 transition-colors"
          />
          {open && results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 surface-elevated max-h-48 overflow-y-auto">
              {results.map((r: any) => (
                <button
                  key={r.tag_number} type="button" onMouseDown={() => onSelect(r)}
                  className="w-full text-left px-3 py-2 text-[0.85rem] hover:bg-muted border-b border-border/60 last:border-0 flex items-center justify-between"
                >
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="text-[0.72rem] text-muted-foreground font-mono">{r.tag_number}</span>
                </button>
              ))}
            </div>
          )}
          {open && search && results.length === 0 && (
            <div className="absolute z-10 w-full mt-1 surface-elevated p-3 text-[0.85rem] text-muted-foreground text-center">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[0.85rem] outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/15 transition-colors"
      />
    </div>
  );
}

function S({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-[0.85rem] outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/15 transition-colors appearance-none"
      >
        {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
