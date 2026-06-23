import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertTriangle, Droplets, Shield, HandHeart, Search, RefreshCw, X, ChevronDown, ChevronUp, Milk } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders(token: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function fmtd(d: string | null) { if (!d) return "—"; const dt = new Date(d); return isNaN(dt.getTime()) ? d?.split("T")[0] : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

interface CattleRow {
  tag_number: string; name: string; gender: string; animal_type: string;
  is_milking: boolean; is_present: boolean;
  milk_today: number;
  v1_vaccinated: boolean; v1_last: string | null; v1_next: string | null;
  v2_vaccinated: boolean; v2_last: string | null; v2_next: string | null;
  v3_vaccinated: boolean; v3_last: string | null; v3_next: string | null;
}

interface Change {
  tag_number: string;
  name: string;
  milk_litres?: number;
  is_milking?: number;
  vaccine_fmd_done?: boolean;
  vaccine_hs_done?: boolean;
  vaccine_brucellosis_done?: boolean;
}

export function DailyOps() {
  const { token } = useAuth();
  const [cattle, setCattle] = useState<CattleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterMilking, setFilterMilking] = useState<"all" | "milking" | "not_milking">("all");
  const [filterGender, setFilterGender] = useState<"all" | "Female" | "Male">("all");
  const [filterVaccine, setFilterVaccine] = useState<"all" | "fmd_due" | "hs_due" | "bruc_due">("all");
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [confirmModal, setConfirmModal] = useState(false);
  const [expandAllVaccine, setExpandAllVaccine] = useState(false);
  const [donateModal, setDonateModal] = useState<CattleRow | null>(null);
  const [donateTo, setDonateTo] = useState("");
  const [donateMobile, setDonateMobile] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const showMsg = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/all-present-cattle`).then(r => r.json()),
      fetch(`${API}/cattle_vaccine`).then(r => r.json()),
      fetch(`${API}/cattle-milk/?tag_number=&year_month=${new Date().toISOString().slice(0, 7)}`).then(r => r.json().catch(() => [])),
    ]).then(([cList, vList, mList]) => {
      const vaccineMap: Record<string, any[]> = {};
      (vList || []).forEach((v: any) => { if (!vaccineMap[v.tag_number]) vaccineMap[v.tag_number] = []; vaccineMap[v.tag_number].push(v); });
      const milkMap: Record<string, number> = {};
      (mList || []).forEach((m: any) => { if (m.tag_number && m.date === today) milkMap[m.tag_number] = m.milk; });
      setCattle((cList || []).map((c: any) => {
        const vacs = vaccineMap[c.tag_number] || [];
        const fmd = vacs.find((v: any) => v.name === "FMD" || v.name?.includes("Foot"));
        const hs = vacs.find((v: any) => v.name === "H.S." || v.name?.includes("Haemorrhagic"));
        const bruc = vacs.find((v: any) => v.name === "Brucellosis");
        return {
          tag_number: c.tag_number, name: c.name, gender: c.gender, animal_type: c.animal_type,
          is_milking: c.is_milking === 1, is_present: true,
          milk_today: milkMap[c.tag_number] || 0,
          v1_vaccinated: !fmd || fmd.data !== "overdue", v1_last: fmd?.last_vaccination || null, v1_next: fmd?.next_date || null,
          v2_vaccinated: !hs || hs.data !== "overdue", v2_last: hs?.last_vaccination || null, v2_next: hs?.next_date || null,
          v3_vaccinated: !bruc || bruc.data !== "overdue", v3_last: bruc?.last_vaccination || null, v3_next: bruc?.next_date || null,
        };
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveChange = (tag: string, partial: Partial<Change>) => {
    setChanges(prev => ({
      ...prev,
      [tag]: { ...(prev[tag] || { tag_number: tag, name: cattle.find(c => c.tag_number === tag)?.name || tag }), ...partial },
    }));
  };

  const removeChange = (tag: string) => {
    setChanges(prev => {
      const next = { ...prev };
      delete next[tag];
      return next;
    });
  };

  const toggleMilking = (tag: string) => {
    const row = cattle.find(c => c.tag_number === tag);
    if (!row) return;
    const newVal = !row.is_milking;
    setCattle(p => p.map(x => x.tag_number === tag ? { ...x, is_milking: newVal, milk_input: "" } : x));
    saveChange(tag, { is_milking: newVal ? 1 : 0 });
  };

  const setMilkToday = (tag: string, val: string) => {
    const row = cattle.find(c => c.tag_number === tag);
    if (!row) return;
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      saveChange(tag, { milk_litres: parsed });
    } else if (val === "") {
      removeChange(tag);
    }
  };

  const setVaccineStatus = (tag: string, key: "vaccine_fmd_done" | "vaccine_hs_done" | "vaccine_brucellosis_done") => {
    const row = cattle.find(c => c.tag_number === tag);
    if (!row) return;
    const vaccKey = key === "vaccine_fmd_done" ? "v1_vaccinated" : key === "vaccine_hs_done" ? "v2_vaccinated" : "v3_vaccinated";
    if (row[vaccKey]) return; // already vaccinated, prevent re-click
    setCattle(p => p.map(x => x.tag_number === tag ? { ...x, [vaccKey]: true } : x));
    saveChange(tag, { [key]: true });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/daily-ops/batch`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(Object.values(changes)),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      const failed = data.items?.filter((i: any) => !i.success) || [];
      if (failed.length > 0) {
        showMsg(false, `${failed.length} item(s) failed to save`);
      } else {
        showMsg(true, `Saved ${Object.keys(changes).length} change(s) successfully`);
      }
      setChanges({});
      setConfirmModal(false);
    } catch (e: any) {
      showMsg(false, e.message || "Save failed");
    }
    setSaving(false);
  };

  const handleDonate = async () => {
    if (!donateModal || !donateTo) return;
    try {
      await fetch(`${API}/cattle/donate`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ tag_number: donateModal.tag_number, donated_to: donateTo, mobile_number: donateMobile }),
      });
      setCattle(p => p.filter(x => x.tag_number !== donateModal.tag_number));
      setDonateModal(null); setDonateTo(""); setDonateMobile("");
      showMsg(true, "Cattle donated out");
    } catch {
      showMsg(false, "Donation failed");
    }
  };

  const filtered = cattle.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.tag_number?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterMilking === "milking" && !c.is_milking) return false;
    if (filterMilking === "not_milking" && c.is_milking) return false;
    if (filterGender !== "all" && c.gender !== filterGender) return false;
    if (filterVaccine === "fmd_due" && c.v1_vaccinated) return false;
    if (filterVaccine === "hs_due" && c.v2_vaccinated) return false;
    if (filterVaccine === "bruc_due" && c.v3_vaccinated) return false;
    return true;
  });

  const changeCount = Object.keys(changes).length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-saffron animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><Droplets className="w-6 h-6 text-saffron" />Daily Operations</h1><p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
        <div className="flex items-center gap-2">
          {changeCount > 0 && (
            <button onClick={() => setConfirmModal(true)} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-lg shadow-saffron/20">
              <Save className="w-4 h-4" /> Save {changeCount} Change{changeCount > 1 ? "s" : ""}
            </button>
          )}
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-lg border border-saffron/20 text-sm flex items-center gap-1.5 hover:bg-muted/30"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {msg && <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>{msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{msg.text}</div>}

      {changeCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-amber-700">{changeCount} pending change{changeCount > 1 ? "s" : ""} — click the Save button to review and submit</span>
          <button onClick={() => setChanges({})} className="text-xs text-amber-600 hover:underline">Discard all</button>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white rounded-xl border border-saffron/10 p-3">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tag..." className="flex-1 text-sm bg-transparent focus:outline-none" />
        <span className="text-xs text-muted-foreground">{filtered.length} cattle</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterGroup label="Milk" options={[{ key: "all", label: "All" }, { key: "milking", label: "Milking" }, { key: "not_milking", label: "Not Milking" }]} selected={filterMilking} onSelect={v => setFilterMilking(v as any)} />
        <div className="w-px h-6 bg-saffron/10" />
        <FilterGroup label="Gender" options={[{ key: "all", label: "All" }, { key: "Female", label: "Female" }, { key: "Male", label: "Male" }]} selected={filterGender} onSelect={v => setFilterGender(v as any)} />
        <div className="w-px h-6 bg-saffron/10" />
        <FilterGroup label="Vaccine" options={[{ key: "all", label: "All" }, { key: "fmd_due", label: "FMD Due" }, { key: "hs_due", label: "H.S. Due" }, { key: "bruc_due", label: "Brucellosis Due" }]} selected={filterVaccine} onSelect={v => setFilterVaccine(v as any)} />
        <button onClick={() => setExpandAllVaccine(!expandAllVaccine)} className="ml-auto text-xs text-saffron hover:underline flex items-center gap-1">{expandAllVaccine ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Vacc. Dates</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-saffron/10">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase">Cattle</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase w-28">Milk Today</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase w-24">Milking</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">FMD</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">H.S.</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">Brucellosis</th>
                <th className="text-center px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase w-16">Donate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const hasChange = changes[row.tag_number] !== undefined;
                const ch = changes[row.tag_number];
                return (
                  <tr key={row.tag_number} className={`border-b border-saffron/5 hover:bg-saffron/2 transition-colors ${hasChange ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{row.name}</p>
                        {hasChange && <span className="w-2 h-2 rounded-full bg-amber-400" title="Has pending changes" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{row.tag_number} &bull; {row.gender}</p>
                    </td>

                    {/* Milk Today */}
                    <td className="px-3 py-2.5 text-center">
                      {row.is_milking || ch?.is_milking === 1 ? (
                        <div className="flex items-center gap-1 justify-center">
                          <input
                            type="number" step="0.1"
                            value={ch?.milk_litres ?? ""}
                            onChange={e => setMilkToday(row.tag_number, e.target.value)}
                            placeholder={String(row.milk_today || "")}
                            className="w-16 px-2 py-1.5 rounded border border-saffron/20 text-xs text-center focus:outline-none focus:ring-1 focus:ring-saffron/30"
                          />
                          <span className="text-xs text-muted-foreground">L</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">N/A</span>
                      )}
                    </td>

                    {/* Milking dropdown */}
                    <td className="px-3 py-2.5 text-center">
                      <select
                        value={hasChange && ch?.is_milking !== undefined ? ch.is_milking : (row.is_milking ? 1 : 0)}
                        onChange={e => toggleMilking(row.tag_number)}
                        className="px-2 py-1.5 rounded border border-saffron/20 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-saffron/30"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </td>

                    {/* FMD */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => setVaccineStatus(row.tag_number, "vaccine_fmd_done")} disabled={row.v1_vaccinated && !ch?.vaccine_fmd_done} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v1_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                          {row.v1_vaccinated ? "Done" : "Due"}
                        </button>
                        {expandAllVaccine && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v1_last)}</span><br /><span className={row.v1_next && new Date(row.v1_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v1_next)}</span></div>}
                      </div>
                    </td>

                    {/* H.S. */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => setVaccineStatus(row.tag_number, "vaccine_hs_done")} disabled={row.v2_vaccinated && !ch?.vaccine_hs_done} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v2_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                          {row.v2_vaccinated ? "Done" : "Due"}
                        </button>
                        {expandAllVaccine && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v2_last)}</span><br /><span className={row.v2_next && new Date(row.v2_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v2_next)}</span></div>}
                      </div>
                    </td>

                    {/* Brucellosis */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => setVaccineStatus(row.tag_number, "vaccine_brucellosis_done")} disabled={row.v3_vaccinated && !ch?.vaccine_brucellosis_done} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v3_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                          {row.v3_vaccinated ? "Done" : "Due"}
                        </button>
                        {expandAllVaccine && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v3_last)}</span><br /><span className={row.v3_next && new Date(row.v3_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v3_next)}</span></div>}
                      </div>
                    </td>

                    {/* Donate */}
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => setDonateModal(row)} className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors flex items-center gap-1 mx-auto"><HandHeart className="w-3 h-3" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {changeCount > 0 && (
        <div className="sticky bottom-4 z-40 flex justify-center">
          <button onClick={() => setConfirmModal(true)} disabled={saving} className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-saffron text-white text-sm font-bold shadow-2xl shadow-saffron/40 hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : `Review & Save ${changeCount} Change${changeCount > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { if (!saving) setConfirmModal(false); }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-saffron/10">
              <h3 className="font-bold text-lg">Review Changes</h3>
              <button onClick={() => { if (!saving) setConfirmModal(false); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3 flex-1">
              {Object.values(changes).map(ch => (
                <div key={ch.tag_number} className="bg-muted/20 rounded-xl p-4 border border-saffron/10">
                  <p className="font-semibold text-sm mb-2">{ch.name} <span className="text-xs text-muted-foreground font-normal">({ch.tag_number})</span></p>
                  <div className="flex flex-wrap gap-2">
                    {ch.milk_litres !== undefined && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs"><Droplets className="w-3 h-3" /> Milk: {ch.milk_litres} L</span>}
                    {ch.is_milking !== undefined && <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${ch.is_milking ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}><Milk className="w-3 h-3" /> Milking: {ch.is_milking ? "Yes" : "No"}</span>}
                    {ch.vaccine_fmd_done && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs"><Shield className="w-3 h-3" /> FMD Vaccinated</span>}
                    {ch.vaccine_hs_done && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs"><Shield className="w-3 h-3" /> H.S. Vaccinated</span>}
                    {ch.vaccine_brucellosis_done && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs"><Shield className="w-3 h-3" /> Brucellosis Vaccinated</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-saffron/10">
              <button onClick={() => setConfirmModal(false)} disabled={saving} className="px-4 py-2 rounded-lg border border-saffron/20 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-saffron text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? "Saving..." : `Confirm ${changeCount} Change${changeCount > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDonateModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Donate Out: {donateModal.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{donateModal.tag_number} &bull; {donateModal.gender}</p>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground block mb-1">Donated To *</label><input value={donateTo} onChange={e => setDonateTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30" placeholder="Organization / Person name" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Mobile Number</label><input value={donateMobile} onChange={e => setDonateMobile(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30" placeholder="+91..." /></div>
              <div className="flex items-center justify-end gap-3 pt-2"><button onClick={() => setDonateModal(null)} className="px-4 py-2 rounded-lg border border-saffron/10 text-sm">Cancel</button><button onClick={handleDonate} disabled={!donateTo} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50">Confirm Donation</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onSelect }: { label: string; options: { key: string; label: string }[]; selected: string; onSelect: (v: string) => void }) {
  return <div className="flex items-center gap-1.5">
    <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="flex bg-muted/50 rounded-lg p-0.5">
      {options.map(o => (
        <button key={o.key} onClick={() => onSelect(o.key)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${selected === o.key ? "bg-saffron text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{o.label}</button>
      ))}
    </div>
  </div>;
}