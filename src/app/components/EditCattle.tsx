import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, AlertTriangle, Flower2, GitBranch, Heart, Droplets, Shield, ImagePlus, Trash2, ChevronDown, Plus, Calendar, Baby, ChevronLeft, ChevronRight, Pencil, X, Check, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ACQ = ["BIRTH", "DONATION", "PURCHASED", "બહારથી આવેલ"];
function fmtd(d: string | null) { if (!d) return "—"; const dt = new Date(d); return isNaN(dt.getTime()) ? d?.split("T")[0] : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const BREED_TRAITS = [
  { key: "head", label: "Head" }, { key: "ear", label: "Ear" }, { key: "eye", label: "Eye" },
  { key: "muzzle", label: "Muzzle" }, { key: "horn", label: "Horn" }, { key: "skin", label: "Skin" },
  { key: "tail", label: "Tail" }, { key: "hump", label: "Hump" }, { key: "udder", label: "Udder" },
  { key: "teat", label: "Teat" }, { key: "dewlap", label: "Dewlap" }, { key: "milk_vein", label: "Milk Vein" },
] as const;

function getAuthHeaders(token: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function toIntFlag(v: any): number {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v ? 1 : 0;
  if (typeof v === "string") return v === "1" || v === "true" ? 1 : 0;
  return 0;
}

export function EditCattle() {
  const { tagNumber } = useParams<{ tagNumber: string }>();
  const navigate = useNavigate(); const tag = tagNumber || "";
  const { token } = useAuth();
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
      const isMilking = ov.lactation_cycle === "Lactating" || ov.average_milk_per_day != null;
      const isPregnant = ov.lactation_cycle === "Pregnant";
      setF({
        name: ov.name || "", tag_number: ov.tag_number || tag, gender: ov.gender || "",
        animal_type: ov.animal_type || "", acquisition_type: ov.acquisition_type || "",
        date_of_birth: ov.DOB || "", weight_at_birth: ov.weight || "",
        is_pregnant: isPregnant, is_milking: isMilking, is_present: ov.is_present ?? 1,
        brucellosis_status: ov.brucellosis_status || "UNKNOWN",
        mother_name: (typeof ov.mother === "object" ? ov.mother?.name || "" : "") || ov.mother_tag_number || "",
        mother_tag_number: ov.mother_tag_number || (typeof ov.mother === "object" ? ov.mother?.tag_number || "" : ""),
        father_name: (typeof ov.father === "object" ? ov.father?.name || "" : "") || ov.father_tag_number || "",
        father_tag_number: ov.father_tag_number || (typeof ov.father === "object" ? ov.father?.tag_number || "" : ""),
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

  const showMsg = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };
  const toggle = (s: string) => setExpanded(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const sf = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const buildUpdatePayload = (nextF: any) => ({
    name: nextF.name,
    tag_number: nextF.tag_number,
    gender: nextF.gender,
    animal_type: nextF.animal_type,
    acquisition_type: nextF.acquisition_type,
    date_of_birth: nextF.date_of_birth,
    weight_at_birth: nextF.weight_at_birth ? parseFloat(nextF.weight_at_birth) : null,
    is_present: toIntFlag(nextF.is_present),
    is_pregnant: toIntFlag(nextF.is_pregnant),
    is_milking: toIntFlag(nextF.is_milking),
    brucellosis_status: nextF.brucellosis_status || "UNKNOWN",
    mother_name: nextF.mother_name || null,
    mother_tag_number: nextF.mother_tag_number || null,
    father_name: nextF.father_name || null,
    father_tag_number: nextF.father_tag_number || null,
  });

  const saveCattleUpdate = async (nextF: any) => {
    const res = await fetch(`${API}/cattle/${encodeURIComponent(tag)}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(buildUpdatePayload(nextF)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Update failed" }));
      throw new Error(err.detail || "Update failed");
    }
    return res.json();
  };

  const startEdit = (key: string, val: any) => { setEditing(key); setEditVal(String(val ?? "")); };
  const confirmEdit = (action: string) => window.confirm(`Do you want to ${action}?`);

  const saveEdit = async (key: string) => {
    if (!confirmEdit("edit this field")) return;
    const val = key === "weight_at_birth" ? parseFloat(editVal) || "" : editVal;
    const nextF = { ...f, [key]: val };
    setF(nextF);
    try {
      await saveCattleUpdate(nextF);
      setEditing(null);
      showMsg(true, `${key.replace(/_/g, " ")} updated`);
    } catch (e: any) {
      showMsg(false, e.message || "Update failed");
      setEditing(null);
    }
  };

  const toggleFlag = async (key: "is_pregnant" | "is_milking") => {
    if (!confirmEdit(`mark this cattle as ${!f[key] ? key.replace("is_", "") : "not " + key.replace("is_", "")}`)) return;
    const nextF = { ...f, [key]: !f[key] };
    setF(nextF);
    try {
      await saveCattleUpdate(nextF);
      showMsg(true, `${key.replace("is_", "").replace(/^./, s => s.toUpperCase())} ${nextF[key] ? "enabled" : "disabled"}`);
    } catch (e: any) {
      showMsg(false, e.message || "Update failed");
      setF(f);
    }
  };

  const saveBreedScore = async () => {
    try {
      const res = await fetch(`${API}/cattle/physical-logs`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ tag_number: tag, ...Object.fromEntries(Object.entries(breedScore).map(([k, v]) => [k, v || "0"])) }),
      });
      if (!res.ok) throw new Error("Failed to save breed score");
      showMsg(true, "Breed score saved");
    } catch (e: any) {
      showMsg(false, e.message || "Breed score save failed");
    }
  };

  const prevMonth = () => setMilkMonth(p => p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 });
  const nextMonth = () => setMilkMonth(p => p.month === 12 ? { year: p.year + 1, month: 1 } : { year: p.year, month: p.month + 1 });
  const addMilk = async () => { if (!newMilk.milk || !newMilk.date) return;
    try {
      const res = await fetch(`${API}/insert-milk-data/`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ tag_number: tag, date: newMilk.date, milk: parseFloat(newMilk.milk) }),
      });
      if (!res.ok) throw new Error("Failed to add milk log");
      const d = { ...dailyMilk, [newMilk.date]: parseFloat(newMilk.milk) };
      setDailyMilk(d);
      setNewMilk({ date: "", milk: "" });
      showMsg(true, "Milk added");
    } catch (e: any) {
      showMsg(false, e.message || "Milk add failed");
    }
  };

  const addPreg = async () => { if (!newPreg.conception_date || !newPreg.birth_date) return;
    try {
      const res = await fetch(`${API}/cattle/pregnancy-logs`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ tag_number: tag, ...newPreg }),
      });
      if (!res.ok) throw new Error("Failed to add pregnancy log");
      const r = await fetch(`${API}/cattle-card/${tag}`); const d = await r.json(); setPreg(d.pregnancy_logs || []);
      setNewPreg({ conception_date: "", birth_date: "" }); showMsg(true, "Added");
    } catch (e: any) {
      showMsg(false, e.message || "Pregnancy add failed");
    }
  };
  const delPreg = async (id: number) => {
    try {
      const res = await fetch(`${API}/cattle/pregnancy-logs/${id}`, { method: "DELETE", headers: getAuthHeaders(token) });
      if (!res.ok) throw new Error("Failed to delete pregnancy log");
      setPreg(p => p.filter(x => x.id !== id));
      showMsg(true, "Pregnancy log removed");
    } catch (e: any) {
      showMsg(false, e.message || "Delete failed");
    }
  };
  const delImg = async (id: number) => {
    try {
      const res = await fetch(`${API}/cattle/images/${id}`, { method: "DELETE", headers: getAuthHeaders(token) });
      if (!res.ok) throw new Error("Failed to delete image");
      setImages(p => p.filter(x => x.id !== id));
      showMsg(true, "Image removed");
    } catch (e: any) {
      showMsg(false, e.message || "Delete failed");
    }
  };
  const upImgs = async (files: FileList) => {
    try {
      const fd = new FormData(); Array.from(files).forEach(f => fd.append("files", f));
      const r = await fetch(`${API}/cattle/images/upload`, { method: "POST", body: fd });
      const d = await r.json();
      if (d.files?.length) {
        const urls = d.files.map((u: string) => u.startsWith("http") ? u : `${API}${u}`);
        const rb = await fetch(`${API}/cattle/images/batch`, { method: "POST", headers: getAuthHeaders(token), body: JSON.stringify({ tag_number: tag, images: urls }) });
        if (!rb.ok) throw new Error("Failed to save image batch");
        const ri = await fetch(`${API}/cattle/images/${tag}`); setImages(await ri.json() || []); showMsg(true, "Uploaded");
      }
    } catch (e: any) {
      showMsg(false, e.message || "Upload failed");
    }
  };

  const monthDays = new Date(milkMonth.year, milkMonth.month, 0).getDate();
  const monthName = new Date(milkMonth.year, milkMonth.month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDay = new Date(milkMonth.year, milkMonth.month - 1, 1).getDay();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-saffron animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button><div><h1 className="text-xl font-bold flex items-center gap-2"><Flower2 className="w-5 h-5 text-saffron" />{f.name || tag}</h1><p className="text-xs text-muted-foreground">{tag} &bull; {f.gender} &bull; {f.age}</p></div></div>
        <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{f.lactation_cycle || f.animal_type}</span>
      </div>
      {msg && <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm animate-pulse ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>{msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{msg.text}</div>}

      {/* BASIC — inline edit */}
      <Card icon={<Flower2 className="w-4 h-4" />} title="Basic Information" open={expanded.includes("basic")} onToggle={() => toggle("basic")}>
        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
          <IRow label="Name" field="name" val={f.name} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("name", f.name)} onSave={() => saveEdit("name")} onCancel={() => setEditing(null)} />
          <IRow label="Gender" field="gender" val={f.gender} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("gender", f.gender)} onSave={() => saveEdit("gender")} onCancel={() => setEditing(null)} options={["Female", "Male"]} />
          <IRow label="Date of Birth" field="date_of_birth" val={f.date_of_birth ? fmtd(f.date_of_birth) : "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("date_of_birth", f.date_of_birth)} onSave={() => saveEdit("date_of_birth")} onCancel={() => setEditing(null)} type="date" />
          <IRow label="Animal Type" field="animal_type" val={f.animal_type || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("animal_type", f.animal_type)} onSave={() => saveEdit("animal_type")} onCancel={() => setEditing(null)} options={["આજીવન મા બની શકશે નહી", "BULL", "FEMALE CALF", "OX", "COW", "MALE CALF"]} />
          <IRow label="Acquisition" field="acquisition_type" val={f.acquisition_type || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("acquisition_type", f.acquisition_type)} onSave={() => saveEdit("acquisition_type")} onCancel={() => setEditing(null)} />
          <IRow label="Weight at Birth" field="weight_at_birth" val={f.weight_at_birth ? `${f.weight_at_birth} kg` : "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("weight_at_birth", f.weight_at_birth)} onSave={() => saveEdit("weight_at_birth")} onCancel={() => setEditing(null)} type="number" />
          <IRow label="Brucellosis" field="brucellosis_status" val={f.brucellosis_status || "—"} editing={editing} editVal={editVal} setEditVal={setEditVal} onEdit={() => startEdit("brucellosis_status", f.brucellosis_status)} onSave={() => saveEdit("brucellosis_status")} onCancel={() => setEditing(null)} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button type="button" onClick={() => toggleFlag("is_pregnant")} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${f.is_pregnant ? "bg-pink-50 border-pink-200 text-pink-700" : "bg-white border-saffron/20 text-muted-foreground hover:bg-pink-50/50"}`}>
            <Heart className={`w-4 h-4 ${f.is_pregnant ? "fill-pink-500 text-pink-500" : "text-muted-foreground"}`} />
            <span>Pregnant</span>
            <span className={`ml-1 w-2 h-2 rounded-full ${f.is_pregnant ? "bg-pink-500" : "bg-gray-300"}`} />
          </button>
          <button type="button" onClick={() => toggleFlag("is_milking")} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${f.is_milking ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-saffron/20 text-muted-foreground hover:bg-blue-50/50"}`}>
            <Droplets className={`w-4 h-4 ${f.is_milking ? "text-blue-500" : "text-muted-foreground"}`} />
            <span>Milking</span>
            <span className={`ml-1 w-2 h-2 rounded-full ${f.is_milking ? "bg-blue-500" : "bg-gray-300"}`} />
          </button>
        </div>
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
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium">{monthName}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames.map(d => <div key={d} className="text-center text-[0.6rem] text-muted-foreground font-medium py-1">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: monthDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${milkMonth.year}-${String(milkMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const milkVal = dailyMilk[dateStr];
            return (
              <div key={day} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs border cursor-pointer transition-colors ${milkVal != null ? "bg-saffron/10 border-saffron/30 hover:bg-saffron/20" : "bg-muted/30 border-transparent hover:border-saffron/10"}`}
                onClick={() => setNewMilk({ date: dateStr, milk: String(milkVal ?? "") })}>
                <span className="text-[0.65rem]">{day}</span>
                {milkVal != null && <span className="text-[0.55rem] font-semibold text-saffron">{milkVal}L</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-end gap-2 pt-2 border-t border-saffron/10">
          <div className="flex-1"><label className="text-[0.55rem] text-muted-foreground block mb-0.5">Date</label><input type="date" value={newMilk.date} onChange={e => setNewMilk(p => ({ ...p, date: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-saffron/20 text-xs" /></div>
          <div className="w-16"><label className="text-[0.55rem] text-muted-foreground block mb-0.5">L</label><input type="number" step="0.1" value={newMilk.milk} onChange={e => setNewMilk(p => ({ ...p, milk: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-saffron/20 text-xs" /></div>
          <button onClick={addMilk} className="px-3 py-1.5 rounded-lg bg-saffron text-white text-xs hover:opacity-90 shrink-0"><Plus className="w-3.5 h-3.5" /> Set</button>
        </div>
      </Card>

      {/* BREED SCORE — progress inputs */}
      <Card icon={<Shield className="w-4 h-4" />} title="Breed Score" open={expanded.includes("breed")} onToggle={() => toggle("breed")}>
        <div className="space-y-3">
          <div className="text-sm"><span className="text-muted-foreground">Hip Width:</span> <input type="text" value={breedScore.hip_width || "0"} onChange={e => setBreedScore(p => ({ ...p, hip_width: e.target.value }))} className="px-2 py-1 rounded border border-saffron/20 text-sm w-20 ml-2" /></div>
          {BREED_TRAITS.map(t => {
            const val = parseFloat(breedScore[t.key] || "0");
            return (
              <div key={t.key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{t.label}</span>
                <input type="range" min="0" max="10" step="0.5" value={val} onChange={e => setBreedScore(p => ({ ...p, [t.key]: e.target.value }))} className="flex-1 accent-saffron h-1.5" />
                <input type="number" min="0" max="10" step="0.5" value={breedScore[t.key] || "0"} onChange={e => setBreedScore(p => ({ ...p, [t.key]: e.target.value }))} className="w-14 px-1.5 py-1 rounded border border-saffron/20 text-xs text-center" />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-3"><button onClick={saveBreedScore} className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Save Score</button></div>
      </Card>

      {/* VACCINE — simple list */}
      <Card icon={<Shield className="w-4 h-4" />} title="Vaccination" open={expanded.includes("vaccine")} onToggle={() => toggle("vaccine")}>
        {vaccine.length > 0 ? <div className="space-y-1.5">{vaccine.map((v: any, i: number) => (
          <div key={i} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2.5 text-sm">
            <div className="flex items-center gap-3"><span className={`w-2 h-2 rounded-full ${v.data === "overdue" ? "bg-red-500" : "bg-green-500"}`} /><span className="font-medium">{v.name}</span><span className="text-xs text-muted-foreground">Last: {v.last_vaccination ? fmtd(v.last_vaccination) : "—"}</span></div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.data === "overdue" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{v.data}</span>
          </div>
        ))}</div> : <p className="text-sm text-muted-foreground">No records.</p>}
      </Card>

      {/* PREGNANCY */}
      <Card icon={<Heart className="w-4 h-4" />} title="Pregnancy History" open={expanded.includes("preg")} onToggle={() => toggle("preg")}>
        <div className="space-y-1.5">
          {preg.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2.5 text-sm">
              <div className="flex items-center gap-3 flex-wrap"><span className="text-xs"><Calendar className="w-3 h-3 inline mr-1" />C: <b>{fmtd(p.conception_date)}</b></span><span className="text-xs"><Baby className="w-3 h-3 inline mr-1" />B: <b>{fmtd(p.birth_date)}</b></span><span className="text-xs text-saffron font-medium">{p.gestation_period || ""}</span><span className="text-xs text-navy">{p.calving_interval || ""}</span></div>
              <button onClick={() => delPreg(p.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
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
  return <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden shadow-sm"><button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 text-left"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-saffron/10 flex items-center justify-center">{icon}</div><h3 className="font-semibold text-sm">{title}</h3></div><ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} /></button>{open && <div className="px-4 pb-4">{children}</div>}</div>;
}

function IRow({ label, field, val, editing, editVal, setEditVal, onEdit, onSave, onCancel, type = "text", options }: any) {
  const isEditing = editing === field;
  return (
    <div className="flex items-center py-2 border-b border-saffron/5 last:border-0 group">
      <span className="text-[0.6rem] text-muted-foreground uppercase w-28 shrink-0">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1">
          {options ? (
            <select value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} className="flex-1 px-2 py-1 rounded border border-saffron/30 bg-saffron/5 text-sm focus:outline-none focus:ring-1 focus:ring-saffron/50">
              <option value="">— Select —</option>
              {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input type={type} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} className="flex-1 px-2 py-1 rounded border border-saffron/30 bg-saffron/5 text-sm focus:outline-none focus:ring-1 focus:ring-saffron/50" />
          )}
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
