import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Mic, MicOff, Loader2, AlertTriangle, SlidersHorizontal, X, StickyNote, Plus, Trash2, Edit2, Eye, Upload, Camera, Image as ImageIcon, CalendarDays, Save, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SiHappycow } from "react-icons/si";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface CattleItem {
  tag_number: string;
  name: string;
  gender: string;
  acquisition_type: string;
  animal_type: string;
  is_milking: number | null;
  is_pregnant: number | null;
}

interface RemarkImage { id: number; image_url: string }
interface Remark {
  id: number;
  tag_number: string;
  title: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  images: RemarkImage[];
}

const GENDERS = ["Male", "Female"];
const ACQUISITION_TYPES = ["BIRTH", "બહારથી આવેલ", "DONATION", "આંધળી ગાય", "PURCHASED"];
const ANIMAL_TYPES = ["BULL", "COW", "OX", "MALE CALF", "FEMALE CALF", "આજીવન મા બની શકશે નહી"];
const ANIMAL_ICONS: Record<string, string> = { BULL: "🐂", COW: "🐄", OX: "🐂", "MALE CALF": "🐃", "FEMALE CALF": "🐄" };
const GENDER_BADGE: Record<string, string> = {
  Male: "bg-blue-100 text-blue-700 border-blue-200",
  Female: "bg-pink-100 text-pink-700 border-pink-200",
};

function RemarkModal({ tag, cattleName, onClose, onSaved }: { tag: string; cattleName: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadRemarks = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/cattle/${encodeURIComponent(tag)}/remarks`);
      if (r.ok) setRemarks(await r.json());
    } catch {}
  }, [tag]);

  useEffect(() => { loadRemarks(); }, [loadRemarks]);

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  useEffect(() => {
    if (cameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera API not supported in this browser");
      return;
    }
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      if (!stream) throw new Error("No stream");
      streamRef.current = stream;
      setCameraOpen(true);
      // Wait for video element to mount
      setTimeout(async () => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          try { await videoRef.current.play(); } catch {}
        }
      }, 100);
    } catch (e: any) {
      console.error("Camera error", e);
      if (e?.name === "NotAllowedError") toast.error("Camera permission denied. Please allow camera access.");
      else if (e?.name === "NotFoundError") toast.error("No camera found on this device");
      else if (e?.name === "NotReadableError") toast.error("Camera is busy or not readable");
      else toast.error("Camera not available: " + (e?.message || "Unknown error"));
    }
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
      setFiles(prev => [...prev, file]);
      toast.success("Photo captured");
    }, "image/jpeg", 0.9);
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      let remarkId = editingId;
      if (editingId) {
        const r = await fetch(`${API_BASE}/cattle-remarks/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), description: description.trim() }),
        });
        if (!r.ok) throw new Error("Update failed");
      } else {
        const r = await fetch(`${API_BASE}/cattle-remarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag_number: tag, title: title.trim(), description: description.trim() }),
        });
        if (!r.ok) throw new Error("Create failed");
        const data = await r.json();
        remarkId = data.id;
      }
      if (files.length > 0 && remarkId) {
        const fd = new FormData();
        files.forEach(f => fd.append("files", f));
        const ur = await fetch(`${API_BASE}/cattle-remarks/${remarkId}/images/upload`, { method: "POST", body: fd });
        if (!ur.ok) throw new Error("Image upload failed");
      }
      toast.success(editingId ? "Remark updated" : "Remark created");
      setTitle(""); setDescription(""); setFiles([]); setEditingId(null); stopCamera();
      loadRemarks(); onSaved();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
    setSaving(false);
  };

  const handleEdit = (rm: Remark) => {
    setEditingId(rm.id);
    setTitle(rm.title);
    setDescription(rm.description || "");
    setFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this remark?")) return;
    await fetch(`${API_BASE}/cattle-remarks/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    loadRemarks(); onSaved();
  };

  const handleDeleteImage = async (imageId: number) => {
    await fetch(`${API_BASE}/cattle-remarks/images/${imageId}`, { method: "DELETE" });
    loadRemarks();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-saffron/10 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md"><StickyNote className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold">Notes for {cattleName} <span className="font-mono text-xs text-muted-foreground">#{tag}</span></h2>
              <p className="text-xs text-muted-foreground">{editingId ? "Editing remark" : "Create a new remark"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Existing remarks list */}
          {remarks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Existing Remarks ({remarks.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {remarks.map(rm => (
                  <div key={rm.id} className="rounded-xl border border-saffron/10 bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{rm.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{rm.description || "—"}</p>
                        <p className="text-[0.6rem] text-muted-foreground mt-1">{rm.updated_at ? new Date(rm.updated_at).toLocaleString("en-IN") : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEdit(rm)} className="p-1.5 rounded-lg bg-white border border-saffron/10 hover:bg-saffron/10 text-saffron"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(rm.id)} className="p-1.5 rounded-lg bg-white border border-red-100 hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {rm.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {rm.images.map(img => (
                          <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-saffron/10 group">
                            <img src={`${API_BASE}${img.image_url}`} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => handleDeleteImage(img.id)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-saffron/10 pt-4" />
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> {editingId ? "Edit Remark" : "New Remark"}</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Health check, feeding note..." className="w-full px-3 py-2.5 rounded-xl border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detailed notes..." className="w-full px-3 py-2.5 rounded-xl border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Images</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-saffron/10 bg-muted">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-saffron/20 hover:border-saffron/40 bg-muted/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-saffron/5 transition-colors">
                  <Upload className="w-5 h-5 text-saffron" />
                  <span className="text-[0.65rem] font-medium text-muted-foreground">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={e => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]) }} />
                </label>
              </div>

              {/* Camera */}
              <div className="rounded-xl border border-saffron/10 bg-muted/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Camera</span>
                  {!cameraOpen ? (
                    <button onClick={startCamera} className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy-dark">Open Camera</button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button onClick={capture} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium">Capture</button>
                      <button onClick={stopCamera} className="px-3 py-1.5 rounded-lg bg-white border border-saffron/20 text-xs">Close</button>
                    </div>
                  )}
                </div>
                {cameraOpen && (
                  <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-saffron/10 p-4 flex items-center justify-end gap-2">
          {editingId && <button onClick={() => { setEditingId(null); setTitle(""); setDescription(""); setFiles([]); }} className="px-4 py-2 rounded-xl border border-saffron/20 text-sm hover:bg-muted">Cancel Edit</button>}
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-saffron/20 text-sm hover:bg-muted">Close</button>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "Update" : "Save Remark"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Notes() {
  const API_BASE_LOCAL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [cattleList, setCattleList] = useState<CattleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [acqFilter, setAcqFilter] = useState<string[]>([]);
  const [animalFilter, setAnimalFilter] = useState<string[]>([]);
  const [milkingFilter, setMilkingFilter] = useState<boolean | null>(null);
  const [pregnantFilter, setPregnantFilter] = useState<boolean | null>(null);
  const [bullOptions, setBullOptions] = useState<{ tag_number: string; name: string | null }[]>([]);
  const [bullSearch, setBullSearch] = useState("");
  const [bullOpen, setBullOpen] = useState(false);
  const [selectedBull, setSelectedBull] = useState<string>("SOM-157");
  const [bullMode, setBullMode] = useState<"bull" | "not_bull" | null>(null);
  const [bullChildren, setBullChildren] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCattleName, setSelectedCattleName] = useState<string>("");

  useEffect(() => {
    fetch(`${API_BASE_LOCAL}/all-present-cattle`)
      .then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json(); })
      .then((data: CattleItem[]) => { setCattleList(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_LOCAL}/cattle/bull-tags`).then(r => r.ok ? r.json() : []).then((rows: any[]) => { if (rows?.length) setBullOptions(rows); }).catch(() => {});
  }, []);

  const filteredBulls = bullOptions.filter(o => {
    const q = bullSearch.trim().toLowerCase();
    if (!q) return true;
    return o.tag_number.toLowerCase().includes(q) || (o.name || "").toLowerCase().includes(q);
  });

  const handleBullMode = async (mode: "bull" | "not_bull") => {
    setBullMode(mode);
    setBullChildren(new Set());
    try {
      const r = await fetch(`${API_BASE_LOCAL}/cattle/bull/${encodeURIComponent(selectedBull)}/children?mode=bull`);
      const d = await r.json();
      setBullChildren(new Set((d.children || []).map((c: any) => c.tag_number)));
    } catch {}
  };

  const filtered = useMemo(() => {
    let base = cattleList.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tag_number.toLowerCase().includes(search.toLowerCase());
      const matchGender = genderFilter.length === 0 || genderFilter.includes(c.gender);
      const matchAcq = acqFilter.length === 0 || acqFilter.includes(c.acquisition_type);
      const matchAnimal = animalFilter.length === 0 || animalFilter.includes(c.animal_type);
      const matchMilking = milkingFilter === null || (milkingFilter ? c.is_milking === 1 : c.is_milking === 0 || c.is_milking === null);
      const matchPregnant = pregnantFilter === null || (pregnantFilter ? c.is_pregnant === 1 : c.is_pregnant === 0 || c.is_pregnant === null);
      return matchSearch && matchGender && matchAcq && matchAnimal && matchMilking && matchPregnant;
    });
    if (bullMode === "bull") base = base.filter(c => bullChildren.has(c.tag_number));
    else if (bullMode === "not_bull") base = base.filter(c => !bullChildren.has(c.tag_number));
    // when searching, also filter by selectedTag if any? search already handles
    return base;
  }, [cattleList, search, genderFilter, acqFilter, animalFilter, milkingFilter, pregnantFilter, bullMode, bullChildren]);

  const activeFilterCount = genderFilter.length + acqFilter.length + animalFilter.length + (milkingFilter !== null ? 1 : 0) + (pregnantFilter !== null ? 1 : 0) + (bullMode !== null ? 1 : 0);
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  const clearAll = () => { setGenderFilter([]); setAcqFilter([]); setAnimalFilter([]); setMilkingFilter(null); setPregnantFilter(null); setBullMode(null); setBullChildren(new Set()); };

  const selectedCattle = selectedTag ? cattleList.find(c => c.tag_number === selectedTag) : null;

  const handleCardClick = (c: CattleItem) => {
    setSelectedTag(c.tag_number);
    setSelectedCattleName(c.name);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /><span className="ml-3 text-muted-foreground">Loading cattle...</span></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="bg-red-50 rounded-2xl p-8 text-center max-w-md"><AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" /><p>{error}</p></div></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md"><StickyNote className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground">Search cattle and manage remarks • {filtered.length} of {cattleList.length} cattle</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cattle by tag number/name..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400" style={{ fontSize: '0.9rem' }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`h-[48px] px-4 rounded-xl border flex items-center gap-2 ${showFilters ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-muted-foreground border-amber-200 hover:border-amber-300"}`}>
          <SlidersHorizontal className="w-4 h-4" /><span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Filters</span>
          {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-white text-amber-600 text-[0.6rem] font-bold flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-visible">
            <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-5 shadow-lg overflow-visible">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-amber-600" /> Filters</h3>{activeFilterCount > 0 && <button onClick={clearAll} className="text-xs text-amber-600 flex items-center gap-1"><X className="w-3 h-3" /> Clear all</button>}</div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Gender</p>
                <div className="flex gap-2">
                  {["Male","Female"].map(g=>(
                    <button key={g} onClick={()=> setGenderFilter(toggle(genderFilter,g))} className={`px-4 py-2 rounded-xl border text-xs font-medium ${genderFilter.includes(g) ? g==="Male"?"bg-blue-500 text-white border-blue-500":"bg-pink-500 text-white border-pink-500" : "bg-transparent border-amber-200"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Acquisition Type</p>
                <div className="flex flex-wrap gap-2">
                  {["BIRTH","બહારથી આવેલ","DONATION","PURCHASED"].map(a=>(
                    <button key={a} onClick={()=> setAcqFilter(toggle(acqFilter,a))} className={`px-3 py-1.5 rounded-lg border text-xs ${acqFilter.includes(a) ? "bg-amber-500 text-white border-amber-500" : "bg-transparent border-amber-200"}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Animal Type</p>
                <div className="flex flex-wrap gap-2">
                  {["BULL","COW","OX","MALE CALF","FEMALE CALF"].map(a=>(
                    <button key={a} onClick={()=> setAnimalFilter(toggle(animalFilter,a))} className={`px-3 py-1.5 rounded-lg border text-xs ${animalFilter.includes(a) ? "bg-navy text-white border-navy" : "bg-transparent border-amber-200"}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Milking Status</p>
                <div className="flex gap-2">
                  {[{label:"Milking",value:true},{label:"Not Milking",value:false}].map(o=>(
                    <button key={o.label} onClick={()=> setMilkingFilter(milkingFilter===o.value?null:o.value)} className={`px-4 py-2 rounded-xl border text-xs ${milkingFilter===o.value ? "bg-navy text-white border-navy" : "bg-transparent border-amber-200"}`}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pregnancy Status</p>
                <div className="flex gap-2">
                  {[{label:"Pregnant",value:true},{label:"Not Pregnant",value:false}].map(o=>(
                    <button key={o.label} onClick={()=> setPregnantFilter(pregnantFilter===o.value?null:o.value)} className={`px-4 py-2 rounded-xl border text-xs ${pregnantFilter===o.value ? "bg-pink-500 text-white border-pink-500" : "bg-transparent border-amber-200"}`}>{o.label}</button>
                  ))}
                </div>
              </div>
              {/* Bull Filter */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">Bull Filter</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input value={bullOpen ? bullSearch : (bullOptions.find(b=>b.tag_number===selectedBull)?.name ? `${selectedBull} — ${bullOptions.find(b=>b.tag_number===selectedBull)?.name}` : selectedBull)} onChange={e=>{setBullSearch(e.target.value); setBullOpen(true)}} onFocus={()=>{setBullSearch(""); setBullOpen(true)}} onBlur={()=> setTimeout(()=>setBullOpen(false),180)} placeholder="Search bull by tag or name..." className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-amber-200 bg-white text-sm" />
                  <button type="button" onClick={()=> setBullOpen(o=>!o)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted"><ChevronDown className={`w-4 h-4 transition-transform ${bullOpen?'rotate-180':''}`} /></button>
                  {bullOpen && (
                    <div className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border-2 border-navy/20 bg-white shadow-2xl">
                      {bullOptions.filter(o=>{const q=bullSearch.trim().toLowerCase(); if(!q) return true; return o.tag_number.toLowerCase().includes(q) || (o.name||"").toLowerCase().includes(q)}).map(o=>(
                        <button key={o.tag_number} onMouseDown={e=>{e.preventDefault(); setSelectedBull(o.tag_number); setBullSearch(""); setBullOpen(false)}} className={`w-full text-left px-4 py-2.5 flex flex-col hover:bg-navy hover:text-white border-b last:border-0 ${selectedBull===o.tag_number?'bg-navy text-white':''}`}>
                          <span className="text-sm font-mono font-bold">{o.tag_number}</span><span className="text-xs opacity-70">{o.name||"—"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> handleBullMode("bull")} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${bullMode==="bull"?"bg-navy text-white border-navy":"bg-white border-navy/20"}`}>Bull {selectedBull}</button>
                  <button onClick={()=> handleBullMode("not_bull")} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${bullMode==="not_bull"?"bg-amber-500 text-white border-amber-500":"bg-white border-amber-200"}`}>Not Bull {selectedBull}</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected cattle details */}
      {selectedTag && selectedCattle && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">{selectedCattle.name.charAt(0)}</div>
            <div>
              <p className="font-semibold">{selectedCattle.name} <span className="font-mono text-xs text-muted-foreground">#{selectedCattle.tag_number}</span></p>
              <p className="text-xs text-muted-foreground">{selectedCattle.gender} • {selectedCattle.animal_type} • {selectedCattle.acquisition_type}</p>
            </div>
          </div>
          <button onClick={()=> setSelectedTag(null)} className="p-2 hover:bg-white/50 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Cattle Grid */}
      {filtered.length===0 ? (
        <div className="text-center py-16"><SiHappycow className="w-16 h-16 text-amber-300 mx-auto mb-3"/><p className="text-muted-foreground">No cattle found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(c=>(
            <button key={c.tag_number} onClick={()=> handleCardClick(c)} className="bg-white rounded-xl border border-amber-100 p-4 text-left hover:shadow-lg hover:border-amber-300 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${c.gender==="Male"?"bg-blue-500":"bg-pink-500"}`}>{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{c.name}</p>
                  <p className="text-xs font-mono text-amber-600">{c.tag_number}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{c.animal_type}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Remark Modal */}
      <AnimatePresence>
        {selectedTag && (
          <RemarkModal tag={selectedTag} cattleName={selectedCattleName} onClose={()=> setSelectedTag(null)} onSaved={()=> {}} />
        )}
      </AnimatePresence>
    </div>
  );
}
