import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertTriangle, Droplets, Shield, HandHeart, Search, Filter, RefreshCw, Clock, Calendar } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
function fmtd(d: string | null) { if (!d) return "—"; const dt = new Date(d); return isNaN(dt.getTime()) ? d?.split("T")[0] : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

interface CattleRow {
  tag_number: string; name: string; gender: string; animal_type: string;
  is_milking: boolean; is_present: boolean;
  milk_today: number; milk_input: string;
  v1_vaccinated: boolean; v1_last: string | null; v1_next: string | null;
  v2_vaccinated: boolean; v2_last: string | null; v2_next: string | null;
  v3_vaccinated: boolean; v3_last: string | null; v3_next: string | null;
}

export function DailyOps() {
  const [cattle, setCattle] = useState<CattleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterMilking, setFilterMilking] = useState<"all" | "milking" | "not_milking">("all");
  const [filterGender, setFilterGender] = useState<"all" | "Female" | "Male">("all");
  const [filterVaccine, setFilterVaccine] = useState<"all" | "fmd_due" | "hs_due" | "bruc_due">("all");
  const [donateModal, setDonateModal] = useState<CattleRow | null>(null);
  const [donateTo, setDonateTo] = useState("");
  const [donateMobile, setDonateMobile] = useState("");
  const [expandAllVaccine, setExpandAllVaccine] = useState(false);

  const today = new Date().toISOString().split("T")[0];

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
          milk_today: milkMap[c.tag_number] || 0, milk_input: "",
          v1_vaccinated: !fmd || fmd.data !== "overdue", v1_last: fmd?.last_vaccination || null, v1_next: fmd?.next_date || null,
          v2_vaccinated: !hs || hs.data !== "overdue", v2_last: hs?.last_vaccination || null, v2_next: hs?.next_date || null,
          v3_vaccinated: !bruc || bruc.data !== "overdue", v3_last: bruc?.last_vaccination || null, v3_next: bruc?.next_date || null,
        };
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const showMsg = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 3000); };

  const saveMilk = async (row: CattleRow) => {
    if (!row.milk_input && row.is_milking) return;
    setSaving(true);
    const updates: Promise<any>[] = [];
    if (row.milk_input) updates.push(fetch(`${API}/insert-milk-data/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: row.tag_number, date: today, milk: parseFloat(row.milk_input) }) }));
    else updates.push(fetch(`${API}/cattle/${row.tag_number}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_milking: row.is_milking ? 1 : 0 }) }));
    await Promise.all(updates);
    setCattle(p => p.map(x => x.tag_number === row.tag_number ? { ...x, milk_today: row.milk_input ? parseFloat(row.milk_input) : x.milk_today, milk_input: "" } : x));
    setSaving(false); showMsg(true, "Milk saved");
  };

  const saveVaccine = async (row: CattleRow, vNum: number) => {
    const vMap: Record<number, number> = { 1: 1, 2: 2, 3: 3 };
    await fetch(`${API}/vaccination-records/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: row.tag_number, vaccine_id: vMap[vNum], administered_date: today }) });
    showMsg(true, "Vaccination recorded");
    setTimeout(() => window.location.reload(), 500);
  };

  const toggleMilking = (tag: string) => {
    setCattle(p => p.map(x => x.tag_number === tag ? { ...x, is_milking: !x.is_milking, milk_input: !x.is_milking ? x.milk_input : "" } : x));
  };

  const handleDonate = async () => {
    if (!donateModal || !donateTo) return;
    await fetch(`${API}/cattle/${donateModal.tag_number}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_present: 0 }) });
    // Also insert into donated_out table via SQL directly
    try { await fetch(`${API}/cattle/donate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag_number: donateModal.tag_number, donated_to: donateTo, mobile_number: donateMobile }) }); } catch {}
    setCattle(p => p.filter(x => x.tag_number !== donateModal.tag_number));
    setDonateModal(null); setDonateTo(""); setDonateMobile(""); showMsg(true, "Cattle donated out");
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-saffron animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><Droplets className="w-6 h-6 text-saffron" />Daily Operations</h1><p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-saffron text-white text-sm flex items-center gap-1.5 hover:opacity-90"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {msg && <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>{msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{msg.text}</div>}

      <div className="flex items-center gap-3 bg-white rounded-xl border border-saffron/10 p-3">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tag..." className="flex-1 text-sm bg-transparent focus:outline-none" />
        <span className="text-xs text-muted-foreground">{filtered.length} cattle</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterGroup label="Milk" options={[{ key: "all", label: "All" }, { key: "milking", label: "Milking" }, { key: "not_milking", label: "Not Milking" }]} selected={filterMilking} onSelect={v => setFilterMilking(v as any)} />
        <div className="w-px h-6 bg-saffron/10" />
        <FilterGroup label="Gender" options={[{ key: "all", label: "All" }, { key: "Female", label: "Female" }, { key: "Male", label: "Male" }]} selected={filterGender} onSelect={v => setFilterGender(v as any)} />
        <div className="w-px h-6 bg-saffron/10" />
        <FilterGroup label="Vaccine" options={[{ key: "all", label: "All" }, { key: "fmd_due", label: "FMD Due" }, { key: "hs_due", label: "H.S. Due" }, { key: "bruc_due", label: "Brucellosis Due" }]} selected={filterVaccine} onSelect={v => setFilterVaccine(v as any)} />
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {cattle.length} cattle</span>
      </div>

      {/* Cattle Table */}
      <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-saffron/10">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase">Cattle</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase w-28">Milk Today</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase w-28">Milking?</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">FMD</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">H.S.</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase">Brucellosis</th>
                <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase w-20">Milk</th>
                <th className="text-center px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase w-16">Donate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.tag_number} className="border-b border-saffron/5 hover:bg-saffron/2 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-2.5"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.tag_number} &bull; {row.gender}</p></td>

                  {/* Milk input */}
                  <td className="px-3 py-2.5 text-center">
                    {row.is_milking ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input type="number" step="0.1" value={row.milk_input} onChange={e => setCattle(p => p.map(x => x.tag_number === row.tag_number ? { ...x, milk_input: e.target.value } : x))} placeholder={String(row.milk_today)} className="w-16 px-2 py-1.5 rounded border border-saffron/20 text-xs text-center focus:outline-none focus:ring-1 focus:ring-saffron/30" />
                        <span className="text-xs text-muted-foreground">L</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground italic">N/A</span>}
                  </td>

                  {/* Milking toggle */}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => toggleMilking(row.tag_number)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${row.is_milking ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                      {row.is_milking ? "Yes" : "No"}
                    </button>
                  </td>

                  {/* Vaccine FMD */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => saveVaccine(row, 1)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v1_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                        {row.v1_vaccinated ? "Done" : "Due"}
                      </button>
                      {(expandAllVaccine) && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v1_last)}</span><br /><span className={row.v1_next && new Date(row.v1_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v1_next)}</span></div>}
                    </div>
                  </td>

                  {/* Vaccine H.S. */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => saveVaccine(row, 2)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v2_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                        {row.v2_vaccinated ? "Done" : "Due"}
                      </button>
                      {(expandAllVaccine) && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v2_last)}</span><br /><span className={row.v2_next && new Date(row.v2_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v2_next)}</span></div>}
                    </div>
                  </td>

                  {/* Vaccine Brucellosis */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => saveVaccine(row, 3)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.v3_vaccinated ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                        {row.v3_vaccinated ? "Done" : "Due"}
                      </button>
                      {(expandAllVaccine) && <div className="text-[0.55rem] text-muted-foreground"><span>Last: {fmtd(row.v3_last)}</span><br /><span className={row.v3_next && new Date(row.v3_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v3_next)}</span></div>}
                    </div>
                  </td>

                  {/* Save Milk */}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => saveMilk(row)} disabled={saving || (!row.milk_input && row.is_milking)} className="px-3 py-1.5 rounded-lg bg-saffron text-white text-xs hover:opacity-90 disabled:opacity-40 flex items-center gap-1 mx-auto">
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </td>

                  {/* Donate */}
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => setDonateModal(row)} className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors flex items-center gap-1 mx-auto"><HandHeart className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
