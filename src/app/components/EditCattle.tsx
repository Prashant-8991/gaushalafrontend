import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, AlertTriangle, Flower2, GitBranch, Heart, Droplets, Shield, ImagePlus, Trash2, ChevronDown, Plus, Calendar, Baby, ChevronLeft, ChevronRight, Pencil, X, Check, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ACQ = ["BIRTH", "DONATION", "PURCHASED", "બહારથી આવેલ"];
function fmtd(d: string | null) { if (!d) return "—"; const dt = new Date(d); return isNaN(dt.getTime()) ? d?.split("T")[0] : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const BREED_TRAITS = [
  { key: "head", label: "Head" }, { key: "ear", label: "Ear" }, { key: "eye", label: "Eye" },
  { key: "muzzle", label: "Muzzle" }, { key: "horn", label: "Horn" }, { key: "skin", label: "Skin" },
  { key: "tail", label: "Tail" }, { key: "hump", label: "Hump" }, { key: "udder", label: "Udder" },
  { key: "teat", label: "Teat" }, { key: "dewlap", label: "Dewlap" }, { key: "milk_vein", label: "Milk Vein" },
] as const;

export function EditCattle() {
  const { tagNumber } = useParams<{ tagNumber: string }>();
  const navigate = useNavigate(); const tag = tagNumber || "";
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>(["basic"]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const [f, setF] = useState<any>({});
  const [preg, setPreg] = useState<any[]>([]);
  const [milk, setMilk] = useState<any[]>([]);
  const [dailyMilk, setDailyMilk] = useState<Record<string, number>>({});
  const [vaccine, setVaccine] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [breedScore, setBreedScore] = useState<Record<string, string>>({});
  const [newPreg, setNewPreg] = useState({ conception_date: "", birth_date: "" });
  const [newMilk, setNewMilk] = useState({ date: "", milk: "" });
  const [milkMonth, setMilkMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

  useEffect(() => { if (!tag) return;
    Promise.all([
      fetch(`${API}/cattle-card/${tag}`).then(r => r.json()),
      fetch(`${API}/cattle/images/${tag}`).then(r => r.json().catch(() => [])),
    ]).then(([card, imgs]) => {
      const ov = card.overview || {};
      setF({
        name: ov.name || "", tag_number: ov.tag_number || tag, gender: ov.gender || "",
        animal_type: ov.animal_type || "", acquisition_type: ov.acquisition_type || "",
        date_of_birth: ov.DOB || "", weight_at_birth: ov.weight || "",
        is_pregnant: false, is_milking: false, is_present: ov.is_present || 1,
        brucellosis_status: ov.brucellosis_status || "UNKNOWN",
        mother_name: typeof ov.mother === "object" ? ov.mother?.name || "" : "",
        mother_tag_number: typeof ov.mother === "object" ? ov.mother?.tag_number || "" : "",
        father_name: typeof ov.father === "object" ? ov.father?.name || "" : "",
        father_tag_number: typeof ov.father === "object" ? ov.father?.tag_number || "" : "",
        lactation_cycle: ov.lactation_cycle || "", age: ov.age || "", physical_score: ov.physical_score || 0,
      });
      setBreedScore(ov.breed_score ? { hip_width: ov.breed_score.hip_width || "0", head: ov.breed_score.head || "0", ear: ov.breed_score.ear || "0", eye: ov.breed_score.eye || "0", muzzle: ov.breed_score.muzzle || "0", horn: ov.breed_score.horn || "0", skin: ov.breed_score.skin || "0", tail: ov.breed_score.tail || "0", hump: ov.breed_score.hump || "0", udder: ov.breed_score.udder || "0", teat: ov.breed_score.teat || "0", dewlap: ov.breed_score.dewlap || "0", milk_vein: ov.breed_score.milk_vein || "0" } : Object.fromEntries(BREED_TRAITS.map(t => [t.key, "0"])));
      setMilk(card.milk_by_month || []);
      setPreg(card.pregnancy_logs || []);
      setImages(imgs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetch(`${API}/cattle_vaccine`).then(r => r.json()).then(d => setVaccine((d || []).filter((x: any) => x.tag_number === tag))).catch(() => {});
  }, [tag]);

  useEffect(() => {
    if (!tag) return;
    const ym = `${milkMonth.year}-${String(milkMonth.month).padStart(2, "0")}`;
    fetch(`${API}/cattle-milk/?tag_number=${tag}&year_month=${ym}`).then(r => r.json()).then(d => {
      const map: Record<string, number> = {};
      (d || []).forEach((m: any) => { if (m.date) map[m.date] = m.milk; });
      setDailyMilk(map);
    }).catch(() => {});
  }, [tag, milkMonth]);

  const showMsg = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 3000); };
  const toggle = (s: string) => setExpanded(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const sf = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const startEdit = (key: string, val: any) => { setEditing(key); setEditVal(String(val ?? "")); };
  const saveEdit = async (key: string) => {
    const val = key === "weight_at_birth" ? parseFloat(editVal) || null : editVal;
    setF((p: any) => ({ ...p, [key]: val }));
    await fetch(`${API}/cattle/${encodeURIComponent(tag)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: key === "weight_at_birth" ? parseFloat(editVal) : editVal }) });
    setEditing(null); showMsg(true, `${key} updated`);
  };

  const saveBreedScore = async () => {
    await fetch(`${API}/cattle/physical-logs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: tag, ...Object.fromEntries(Object.entries(breedScore).map(([k, v]) => [k, v || "0"])) }) });
    showMsg(true, "Breed score saved");
  };

  const prevMonth = () => setMilkMonth(p => p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 });
  const nextMonth = () => setMilkMonth(p => p.month === 12 ? { year: p.year + 1, month: 1 } : { year: p.year, month: p.month + 1 });
  const addMilk = async () => { if (!newMilk.milk || !newMilk.date) return;
    await fetch(`${API}/insert-milk-data/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: tag, date: newMilk.date, milk: parseFloat(newMilk.milk) }) });
    const d = dailyMilk; d[newMilk.date] = parseFloat(newMilk.milk); setDailyMilk({...d});
    setNewMilk({ date: "", milk: "" }); showMsg(true, "Milk added");
  };

  const addPreg = async () => { if (!newPreg.conception_date || !newPreg.birth_date) return;
    await fetch(`${API}/cattle/pregnancy-logs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: tag, ...newPreg }) });
    const r = await fetch(`${API}/cattle-card/${tag}`); const d = await r.json(); setPreg(d.pregnancy_logs || []);
    setNewPreg({ conception_date: "", birth_date: "" }); showMsg(true, "Added");
  };
  const delPreg = async (id: number) => { await fetch(`${API}/cattle/pregnancy-logs/${id}`, { method: "DELETE" }); setPreg(p => p.filter(x => x.id !== id)); };
  const delImg = async (id: number) => { await fetch(`${API}/cattle/images/${id}`, { method: "DELETE" }); setImages(p => p.filter(x => x.id !== id)); };
  const upImgs = async (files: FileList) => {
    const fd = new FormData(); Array.from(files).forEach(f => fd.append("files", f));
    const r = await fetch(`${API}/cattle/images/upload`, { method: "POST", body: fd }); const d = await r.json();
    if (d.files?.length) {
      const urls = d.files.map((u: string) => u.startsWith("http") ? u : `${API}${u}`);
      await fetch(`${API}/cattle/images/batch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: tag, images: urls }) });
      const ri = await fetch(`${API}/cattle/images/${tag}`); setImages(await ri.json() || []); showMsg(true, "Uploaded");
    }
  };

  const monthDays = new Date(milkMonth.year, milkMonth.month, 0).getDate();
  const monthName = new Date(milkMonth.year, milkMonth.month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDay = new Date(milkMonth.year, milkMonth.month - 1, 1).getDay();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] flex items-center gap-2 truncate">
              <Flower2 className="w-5 h-5 text-saffron shrink-0" strokeWidth={1.6} />{f.name || tag}
            </h1>
            <p className="text-[0.82rem] text-muted-foreground tabular">{tag} · {f.gender} · {f.age}</p>
          </div>
        </div>
        <span className="chip chip-success text-[0.7rem]">{f.lactation_cycle || f.animal_type}</span>
      </motion.div>
      {msg && (
        <div className={`surface p-3 flex items-center gap-2 text-[0.85rem] ${msg.ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
          {msg.ok ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
          <span className={msg.ok ? "text-success" : "text-destructive"}>{msg.text}</span>
        </div>
      )}

      {/* BASIC — inline edit */}
      <Card icon={<Flower2 className="w-4 h-4" />} title="Basic Information" open={expanded.includes("basic")} onToggle={() => toggle("basic")}>
        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
          <IRow label="Name" field="name" val={f.name} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("name", f.name)} onSave={() => saveEdit("name")} onCancel={() => setEditing(null)} />
          <IRow label="Gender" field="gender" val={f.gender} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("gender", f.gender)} onSave={() => saveEdit("gender")} onCancel={() => setEditing(null)} />
          <IRow label="Date of Birth" field="date_of_birth" val={f.date_of_birth ? fmtd(f.date_of_birth) : "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("date_of_birth", f.date_of_birth)} onSave={() => saveEdit("date_of_birth")} onCancel={() => setEditing(null)} type="date" />
          <IRow label="Animal Type" field="animal_type" val={f.animal_type || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("animal_type", f.animal_type)} onSave={() => saveEdit("animal_type")} onCancel={() => setEditing(null)} />
          <IRow label="Acquisition" field="acquisition_type" val={f.acquisition_type || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("acquisition_type", f.acquisition_type)} onSave={() => saveEdit("acquisition_type")} onCancel={() => setEditing(null)} />
          <IRow label="Weight at Birth" field="weight_at_birth" val={f.weight_at_birth ? `${f.weight_at_birth} kg` : "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("weight_at_birth", f.weight_at_birth)} onSave={() => saveEdit("weight_at_birth")} onCancel={() => setEditing(null)} type="number" />
          <IRow label="Brucellosis" field="brucellosis_status" val={f.brucellosis_status || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("brucellosis_status", f.brucellosis_status)} onSave={() => saveEdit("brucellosis_status")} onCancel={() => setEditing(null)} />
        </div>
        <div className="flex items-center gap-6 mt-2"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.is_pregnant} onChange={e => sf("is_pregnant", e.target.checked)} /><span>Pregnant</span></label><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.is_milking} onChange={e => sf("is_milking", e.target.checked)} /><span>Milking</span></label></div>
      </Card>

      {/* FAMILY */}
      <Card icon={<GitBranch className="w-4 h-4" />} title="Family" open={expanded.includes("family")} onToggle={() => toggle("family")}>
        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
          <IRow label="Mother Name" field="mother_name" val={f.mother_name || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("mother_name", f.mother_name)} onSave={() => saveEdit("mother_name")} onCancel={() => setEditing(null)} />
          <IRow label="Mother Tag" field="mother_tag_number" val={f.mother_tag_number || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("mother_tag_number", f.mother_tag_number)} onSave={() => saveEdit("mother_tag_number")} onCancel={() => setEditing(null)} />
          <IRow label="Father Name" field="father_name" val={f.father_name || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("father_name", f.father_name)} onSave={() => saveEdit("father_name")} onCancel={() => setEditing(null)} />
          <IRow label="Father Tag" field="father_tag_number" val={f.father_tag_number || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("father_tag_number", f.father_tag_number)} onSave={() => saveEdit("father_tag_number")} onCancel={() => setEditing(null)} />
        </div>
      </Card>

      {/* MILK CALENDAR */}
      <Card icon={<Droplets className="w-4 h-4" />} title={`Milk Calendar — ${monthName}`} open={expanded.includes("milk")} onToggle={() => toggle("milk")}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-[0.88rem] font-semibold text-foreground tabular">{monthName}</span>
          <button onClick={nextMonth} className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames.map(d => <div key={d} className="text-center text-[0.6rem] text-muted-foreground font-medium uppercase tracking-wider py-1">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: monthDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${milkMonth.year}-${String(milkMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const milkVal = dailyMilk[dateStr];
            return (
              <div
                key={day}
                className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs border cursor-pointer transition-colors ${
                  milkVal != null
                    ? "bg-saffron/10 border-saffron/30 hover:bg-saffron/20"
                    : "bg-muted/30 border-transparent hover:border-saffron/20"
                }`}
                onClick={() => setNewMilk({ date: dateStr, milk: String(milkVal ?? "") })}
              >
                <span className="text-[0.65rem] text-foreground">{day}</span>
                {milkVal != null && <span className="text-[0.55rem] font-semibold text-saffron tabular">{milkVal}L</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-end gap-2 pt-2 border-t border-border">
          <div className="flex-1">
            <label className="eyebrow block mb-0.5">Date</label>
            <input type="date" value={newMilk.date} onChange={e => setNewMilk(p => ({ ...p, date: e.target.value }))} className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20" />
          </div>
          <div className="w-16">
            <label className="eyebrow block mb-0.5">L</label>
            <input type="number" step="0.1" value={newMilk.milk} onChange={e => setNewMilk(p => ({ ...p, milk: e.target.value }))} className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20" />
          </div>
          <button onClick={addMilk} className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 shrink-0 inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Set
          </button>
        </div>
      </Card>

      {/* BREED SCORE — progress inputs */}
      <Card icon={<Shield className="w-4 h-4" />} title="Breed Score" open={expanded.includes("breed")} onToggle={() => toggle("breed")}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[0.85rem]">
            <span className="text-muted-foreground w-20 shrink-0">Hip Width</span>
            <input
              type="text" value={breedScore.hip_width || "0"}
              onChange={e => setBreedScore(p => ({ ...p, hip_width: e.target.value }))}
              className="w-20 h-8 px-2 rounded-md border border-border bg-background text-[0.82rem] outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20"
            />
          </div>
          {BREED_TRAITS.map(t => {
            const val = parseFloat(breedScore[t.key] || "0");
            return (
              <div key={t.key} className="flex items-center gap-3">
                <span className="text-[0.78rem] text-muted-foreground w-20 shrink-0">{t.label}</span>
                <input type="range" min="0" max="10" step="0.5" value={val} onChange={e => setBreedScore(p => ({ ...p, [t.key]: e.target.value }))} className="flex-1 accent-saffron h-1.5" />
                <input type="number" min="0" max="10" step="0.5" value={breedScore[t.key] || "0"} onChange={e => setBreedScore(p => ({ ...p, [t.key]: e.target.value }))} className="w-14 h-8 px-1.5 rounded-md border border-border bg-background text-xs text-center outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20 tabular" />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={saveBreedScore}
            className="h-8 px-3.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Save score
          </button>
        </div>
      </Card>

      {/* VACCINE — simple list */}
      <Card icon={<Shield className="w-4 h-4" />} title="Vaccination" open={expanded.includes("vaccine")} onToggle={() => toggle("vaccine")}>
        {vaccine.length > 0 ? (
          <div className="space-y-1.5">
            {vaccine.map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between surface-soft px-3 py-2.5 text-[0.85rem]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.data === "overdue" ? "bg-red-500" : "bg-emerald-500"}`} />
                  <span className="font-medium text-foreground">{v.name}</span>
                  <span className="text-[0.72rem] text-muted-foreground">Last: {v.last_vaccination ? fmtd(v.last_vaccination) : "—"}</span>
                </div>
                <span className={`chip text-[0.7rem] ${
                  v.data === "overdue" ? "chip-danger" : "chip-success"
                }`}>{v.data}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[0.85rem] text-muted-foreground">No records.</p>}
      </Card>

      {/* PREGNANCY */}
      <Card icon={<Heart className="w-4 h-4" />} title="Pregnancy History" open={expanded.includes("preg")} onToggle={() => toggle("preg")}>
        <div className="space-y-1.5">
          {preg.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between surface-soft px-3 py-2.5 text-[0.85rem]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[0.78rem] inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />C: <b className="text-foreground">{fmtd(p.conception_date)}</b>
                </span>
                <span className="text-[0.78rem] inline-flex items-center gap-1">
                  <Baby className="w-3 h-3 text-muted-foreground" />B: <b className="text-foreground">{fmtd(p.birth_date)}</b>
                </span>
                <span className="text-[0.78rem] text-saffron font-medium">{p.gestation_period || ""}</span>
                <span className="text-[0.78rem] text-navy dark:text-blue-300">{p.calving_interval || ""}</span>
              </div>
              <button onClick={() => delPreg(p.id)} className="h-6 w-6 rounded-md hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-saffron/10"><input type="date" value={newPreg.conception_date} onChange={e => setNewPreg(p => ({ ...p, conception_date: e.target.value }))} className="px-2.5 py-1.5 rounded-lg border border-saffron/20 text-xs flex-1" /><span className="text-xs">→</span><input type="date" value={newPreg.birth_date} onChange={e => setNewPreg(p => ({ ...p, birth_date: e.target.value }))} className="px-2.5 py-1.5 rounded-lg border border-saffron/20 text-xs flex-1" /><button onClick={addPreg} className="px-3 py-1.5 rounded-lg bg-saffron text-white text-xs hover:opacity-90 shrink-0"><Plus className="w-3.5 h-3.5" /> Add</button></div>
        </div>
      </Card>

      {/* IMAGES */}
      <Card icon={<ImagePlus className="w-4 h-4" />} title="Images" open={expanded.includes("images")} onToggle={() => toggle("images")}>
        {images.length > 0 && <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">{images.map((img: any) => <div key={img.id} className="relative group rounded-lg overflow-hidden border border-saffron/10 aspect-square bg-muted"><img src={img.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as any).style.display = "none"; }} /><button onClick={() => delImg(img.id)} className="absolute top-1 right-1 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button></div>)}</div>}
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-saffron/20 rounded-xl p-5 cursor-pointer hover:border-saffron/40"><ImagePlus className="w-5 h-5 text-saffron/40" /><span className="text-sm text-muted-foreground">Upload images</span><input type="file" multiple accept="image/*" className="hidden" onChange={e => { if (e.target.files?.length) upImgs(e.target.files); }} /></label>
      </Card>
    </div>
  );
}

function Card({ icon, title, open, onToggle, children }: any) {
  return (
    <div className="surface overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 text-left transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-saffron/10 text-saffron ring-1 ring-saffron/20 flex items-center justify-center">{icon}</div>
          <h3 className="font-semibold text-[0.92rem] text-foreground">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-border pt-3">{children}</div>}
    </div>
  );
}

function IRow({ label, field, val, editing, editVal, setEditVal, onEdit, onSave, onCancel, type = "text" }: any) {
  const isEditing = editing === field;
  return (
    <div className="flex items-center py-2 border-b border-saffron/5 last:border-0 group">
      <span className="text-[0.6rem] text-muted-foreground uppercase w-28 shrink-0">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1">
          <input type={type} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} className="flex-1 px-2 py-1 rounded border border-saffron/30 bg-saffron/5 text-sm focus:outline-none focus:ring-1 focus:ring-saffron/50" />
          <button onClick={onSave} className="p-1 rounded hover:bg-green-50 text-green-600"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={onCancel} className="p-1 rounded hover:bg-red-50 text-red-400"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div onClick={onEdit} className="flex-1 text-sm font-medium cursor-pointer hover:bg-saffron/5 rounded px-2 py-1 transition-colors flex items-center gap-2">
          <span>{val || <span className="text-muted-foreground/30 italic">—</span>}</span>
          <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}
