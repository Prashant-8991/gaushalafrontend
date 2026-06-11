import { useState, useEffect } from "react";
import { motion } from "motion/react";
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between gap-3"
      >
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="text-[1.5rem] font-semibold text-foreground leading-tight tracking-[-0.02em] mt-1 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-saffron" strokeWidth={1.6} />
            Daily operations
          </h1>
          <p className="text-[0.82rem] text-muted-foreground mt-1 tabular">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="h-8 px-3 rounded-md border border-border text-foreground text-[0.82rem] font-medium hover:bg-muted transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" strokeWidth={1.8} /> Refresh
        </button>
      </motion.div>

      {msg && (
        <div className={`surface p-3 flex items-center gap-2 text-[0.85rem] ${msg.ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
          {msg.ok ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
          <span className={msg.ok ? "text-success" : "text-destructive"}>{msg.text}</span>
        </div>
      )}

      <div className="surface p-2.5 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground/60 ml-1 shrink-0" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or tag…"
          className="flex-1 bg-transparent text-[0.85rem] outline-none placeholder:text-muted-foreground/40 focus:bg-muted/40 transition-colors rounded px-1"
        />
        <span className="text-[0.72rem] text-muted-foreground tabular mr-1">{filtered.length} cattle</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterGroup label="Milk" options={[{ key: "all", label: "All" }, { key: "milking", label: "Milking" }, { key: "not_milking", label: "Not milking" }]} selected={filterMilking} onSelect={v => setFilterMilking(v as any)} />
        <div className="w-px h-4 bg-border" />
        <FilterGroup label="Gender" options={[{ key: "all", label: "All" }, { key: "Female", label: "Female" }, { key: "Male", label: "Male" }]} selected={filterGender} onSelect={v => setFilterGender(v as any)} />
        <div className="w-px h-4 bg-border" />
        <FilterGroup label="Vaccine" options={[{ key: "all", label: "All" }, { key: "fmd_due", label: "FMD due" }, { key: "hs_due", label: "H.S. due" }, { key: "bruc_due", label: "Brucellosis due" }]} selected={filterVaccine} onSelect={v => setFilterVaccine(v as any)} />
        <span className="ml-auto text-[0.78rem] text-muted-foreground tabular">{filtered.length} of {cattle.length} cattle</span>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider">Cattle</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider w-28">Milk Today</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider w-28">Milking?</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider">FMD</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider">H.S.</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider">Brucellosis</th>
                <th className="text-center px-3 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider w-20">Milk</th>
                <th className="text-center px-4 py-2.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider w-16">Donate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.tag_number} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-[0.72rem] text-muted-foreground tabular">{row.tag_number} · {row.gender}</p>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    {row.is_milking ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number" step="0.1" value={row.milk_input}
                          onChange={e => setCattle(p => p.map(x => x.tag_number === row.tag_number ? { ...x, milk_input: e.target.value } : x))}
                          placeholder={String(row.milk_today)}
                          className="w-16 h-7 px-2 rounded-md border border-border bg-background text-[0.78rem] text-center outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20"
                        />
                        <span className="text-[0.72rem] text-muted-foreground">L</span>
                      </div>
                    ) : <span className="text-[0.72rem] text-muted-foreground italic">N/A</span>}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => toggleMilking(row.tag_number)}
                      className={`h-6 px-2.5 rounded-md text-[0.72rem] font-medium border transition-colors ${
                        row.is_milking
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {row.is_milking ? "Yes" : "No"}
                    </button>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => saveVaccine(row, 1)}
                        className={`h-6 px-2.5 rounded-md text-[0.72rem] font-medium border ${
                          row.v1_vaccinated
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20"
                        }`}
                      >
                        {row.v1_vaccinated ? "Done" : "Due"}
                      </button>
                      {expandAllVaccine && (
                        <div className="text-[0.6rem] text-muted-foreground">
                          <span>Last: {fmtd(row.v1_last)}</span><br />
                          <span className={row.v1_next && new Date(row.v1_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v1_next)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => saveVaccine(row, 2)}
                        className={`h-6 px-2.5 rounded-md text-[0.72rem] font-medium border ${
                          row.v2_vaccinated
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20"
                        }`}
                      >
                        {row.v2_vaccinated ? "Done" : "Due"}
                      </button>
                      {expandAllVaccine && (
                        <div className="text-[0.6rem] text-muted-foreground">
                          <span>Last: {fmtd(row.v2_last)}</span><br />
                          <span className={row.v2_next && new Date(row.v2_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v2_next)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => saveVaccine(row, 3)}
                        className={`h-6 px-2.5 rounded-md text-[0.72rem] font-medium border ${
                          row.v3_vaccinated
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20"
                        }`}
                      >
                        {row.v3_vaccinated ? "Done" : "Due"}
                      </button>
                      {expandAllVaccine && (
                        <div className="text-[0.6rem] text-muted-foreground">
                          <span>Last: {fmtd(row.v3_last)}</span><br />
                          <span className={row.v3_next && new Date(row.v3_next) < new Date() ? "text-red-500" : ""}>Next: {fmtd(row.v3_next)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => saveMilk(row)} disabled={saving || (!row.milk_input && row.is_milking)}
                      className="h-7 px-3 rounded-md bg-foreground text-background text-[0.72rem] font-medium hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1 mx-auto"
                    >
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setDonateModal(row)}
                      className="h-7 w-7 rounded-md border border-border text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors inline-flex items-center justify-center mx-auto"
                      title="Donate out"
                    >
                      <HandHeart className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {donateModal && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDonateModal(null)}>
          <div className="surface-elevated max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-[1.05rem] font-semibold text-foreground">Donate out: {donateModal.name}</h3>
            <p className="text-[0.78rem] text-muted-foreground mb-4 mt-0.5">{donateModal.tag_number} · {donateModal.gender}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">Donated to *</label>
                <input
                  value={donateTo} onChange={e => setDonateTo(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-[0.85rem] outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/15 transition-colors"
                  placeholder="Organization / Person name"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] font-medium text-foreground mb-1.5">Mobile number</label>
                <input
                  value={donateMobile} onChange={e => setDonateMobile(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-[0.85rem] outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/15 transition-colors"
                  placeholder="+91…"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setDonateModal(null)} className="h-9 px-4 rounded-md border border-border text-[0.85rem] text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button
                  onClick={handleDonate} disabled={!donateTo}
                  className="h-9 px-4 rounded-md bg-red-500 text-white text-[0.85rem] font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Confirm donation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onSelect }: { label: string; options: { key: string; label: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="eyebrow">{label}</span>
      <div className="inline-flex p-0.5 rounded-md bg-muted border border-border">
        {options.map(o => (
          <button
            key={o.key} onClick={() => onSelect(o.key)}
            className={`h-6 px-2.5 rounded text-[0.72rem] font-medium transition-colors ${
              selected === o.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}
