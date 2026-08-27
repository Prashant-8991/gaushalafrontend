import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, ChevronUp, Download, Heart, Milk, Eye, Users, Baby, SearchX, Search, Loader2, AlertTriangle, FileSpreadsheet, Crown, GitBranch } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const ALLOWED_TAGS = ["SOM-006","SOM-015","SOM-020","SOM-023","SOM-025","SOM-038","SOM-040","SOM-041","SOM-055","SOM-061","SOM-068","SOM-085","SOM-087","SOM-089","SOM-091","SOM-103","SOM-115","SOM-119","SOM-125","SOM-136","SOM-220","SOM-060","SOM-112","SOM-150","SOM-159","SOM-161","SOM-162","SOM-169","SOM-179","SOM-203"]

type PhysicalMark = {
  hip_width: string | null
  head: number | null; ear: number | null; eye: number | null; muzzle: number | null; horn: number | null
  skin: number | null; tail: number | null; hump: number | null; udder: number | null
  teat: number | null; dewlap: number | null; milk_vein: number | null
}
type DetailRecord = {
  name: string | null; tag_number: string; date_of_birth: string | null
  average_milk: number | null; physical_mark: PhysicalMark | null; physical_total: number | null
}
type DetailResponse = {
  cattle: DetailRecord | null; mother: DetailRecord | null
  sisters: DetailRecord[]; maternal_grandmother: DetailRecord | null; maternal_aunts: DetailRecord[]
}

const PHYS_COLS: { key: keyof PhysicalMark; label: string }[] = [
  { key: "hip_width", label: "Hip Width" }, { key: "head", label: "Head" }, { key: "ear", label: "Ear" },
  { key: "eye", label: "Eye" }, { key: "muzzle", label: "Muzzle" }, { key: "horn", label: "Horn" },
  { key: "skin", label: "Skin" }, { key: "tail", label: "Tail" }, { key: "hump", label: "Hump" },
  { key: "udder", label: "Udder" }, { key: "teat", label: "Teat" }, { key: "dewlap", label: "Dewlap" },
  { key: "milk_vein", label: "Milk Vein" },
]
const EXCEL_HEADER = ["Name","Tag Number","Date of Birth","Average Milk","Hip Width","Head","Ear","Eye","Muzzle","Horn","Skin","Tail","Hump","Udder","Teat","Dewlap","Milk Vein","Total Physical Mark"]

function SingleTable({ records, expandedTag, setExpandedTag }: { records: DetailRecord[]; expandedTag: string|null; setExpandedTag:(t:string|null)=>void }) {
  if (records.length===0) return <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-saffron/20 rounded-xl bg-muted/10"><SearchX className="w-7 h-7 text-muted-foreground/40 mb-2"/><p className="text-sm font-medium text-muted-foreground">No records found</p></div>
  return (
    <div className="overflow-hidden rounded-xl border border-saffron/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-saffron/5 to-navy/5 border-b border-saffron/10">
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Tag Number</th>
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Date of Birth</th>
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Physical Mark</th>
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap">Average Milk</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => {
              const isExpanded = expandedTag===r.tag_number
              const total = r.physical_total
              return (
                <>
                  <tr key={r.tag_number} className={`${idx%2===0?"bg-white":"bg-muted/20"} hover:bg-saffron/[0.04] transition-colors border-b border-saffron/[0.06]`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron/15 to-saffron/5 border border-saffron/20 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-saffron">{(r.name||"?").charAt(0).toUpperCase()}</span></div>
                        <span className="font-medium text-foreground whitespace-nowrap">{r.name||"—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-navy/5 text-navy border border-navy/10">{r.tag_number}</span></td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">{r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={()=>setExpandedTag(isExpanded?null:r.tag_number)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isExpanded?"bg-saffron text-white border-saffron shadow-sm":"bg-white text-saffron border-saffron/20 hover:bg-saffron hover:text-white"}`}>
                        <Eye className="w-3.5 h-3.5"/>View Logs{isExpanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">{total!=null?<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-navy text-white text-xs font-bold shadow-sm">{total.toFixed(1)}</span>:<span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="px-4 py-3.5">{r.average_milk!=null?<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"><Milk className="w-3 h-3"/>{r.average_milk} L</span>:<span className="text-muted-foreground text-xs">—</span>}</td>
                  </tr>
                  <tr className="bg-white"><td colSpan={6} className="p-0">
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                          <div className="mx-4 mb-4 mt-1 rounded-xl border border-saffron/10 bg-gradient-to-br from-saffron/[0.03] to-navy/[0.03] p-4">
                            <div className="flex items-center gap-2 mb-3"><div className="w-1 h-5 rounded-full bg-saffron"/><h4 className="text-xs font-semibold tracking-wider uppercase text-foreground">Physical Characteristics — {r.name} ({r.tag_number})</h4>{total!=null&&<span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-navy text-white">Total: {total.toFixed(1)}</span>}</div>
                            {!r.physical_mark ? <div className="text-center py-6 rounded-lg bg-white border border-dashed border-saffron/20"><p className="text-sm text-muted-foreground">No physical records available</p></div> : (
                              <div className="overflow-x-auto rounded-lg border border-saffron/10 bg-white">
                                <table className="w-full text-xs">
                                  <thead><tr className="bg-muted/40 border-b border-saffron/10">{PHYS_COLS.map(c=><th key={c.key} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{c.label}</th>)}<th className="px-3 py-2.5 text-left font-semibold uppercase text-navy bg-navy/5 whitespace-nowrap">Total</th></tr></thead>
                                  <tbody><tr className="hover:bg-muted/20">{PHYS_COLS.map(c=>{const v=(r.physical_mark as any)?.[c.key]; return <td key={c.key} className="px-3 py-3 whitespace-nowrap font-medium">{v==null||v===""?<span className="text-muted-foreground/60">—</span>:String(v)}</td>})}<td className="px-3 py-3 font-bold text-navy bg-navy/5">{total!=null?total.toFixed(1):"—"}</td></tr></tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td></tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, records, subtitle }: { title:string; icon:React.ReactNode; records:DetailRecord[]; subtitle?:string }) {
  const [expanded, setExpanded] = useState<string|null>(null)
  return (
    <div className="bg-white rounded-2xl border border-saffron/10 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-saffron/5 via-white to-navy/5 px-6 py-5 border-b border-saffron/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white shadow-md">{icon}</div>
          <div><h2 className="text-base font-bold text-foreground">{title}</h2><p className="text-xs text-muted-foreground">{subtitle || `${records.length} record${records.length!==1?"s":""}`}</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-saffron/10 text-xs font-medium text-muted-foreground shadow-sm"><Users className="w-3.5 h-3.5"/>{records.length}</span>
      </div>
      <div className="p-4 sm:p-6"><SingleTable records={records} expandedTag={expanded} setExpandedTag={setExpanded} /></div>
    </div>
  )
}

export function CattleDrillDown() {
  const [selected, setSelected] = useState<string>("SOM-006")
  const [options, setOptions] = useState<{tag_number:string; name:string|null}[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<DetailResponse|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    fetch(`${API_BASE}/cattle/drill-tags`).then(r=>r.json()).then((rows:{tag_number:string;name:string|null}[])=>{
      if(rows && rows.length) setOptions(rows)
      else setOptions(ALLOWED_TAGS.map(t=>({tag_number:t, name:null})))
    }).catch(()=> setOptions(ALLOWED_TAGS.map(t=>({tag_number:t, name:null}))))
  },[])

  const filtered = options.filter(o=> {
    const q=search.trim().toLowerCase()
    if(!q) return true
    return o.tag_number.toLowerCase().includes(q) || (o.name||"").toLowerCase().includes(q)
  })

  const selectedLabel = (()=> {
    const o=options.find(x=>x.tag_number===selected)
    return o ? `${o.name ? o.name + " — " : ""}${o.tag_number}` : selected
  })()

  useEffect(()=>{
    let cancelled=false
    setLoading(true); setError(null)
    fetch(`${API_BASE}/cattle/${encodeURIComponent(selected)}/maternal-drill`)
      .then(r=>{ if(!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d:DetailResponse)=>{ if(!cancelled){ setData(d); setLoading(false) }})
      .catch(e=>{ if(!cancelled){ setError(e.message); setLoading(false) }})
    return ()=>{ cancelled=true }
  },[selected])

  const handleExport = () => {
    if(!data) return
    const wb = XLSX.utils.book_new()
    const toRow = (r:DetailRecord) => [r.name||"", r.tag_number, r.date_of_birth||"", r.average_milk??"", r.physical_mark?.hip_width??"", r.physical_mark?.head??"", r.physical_mark?.ear??"", r.physical_mark?.eye??"", r.physical_mark?.muzzle??"", r.physical_mark?.horn??"", r.physical_mark?.skin??"", r.physical_mark?.tail??"", r.physical_mark?.hump??"", r.physical_mark?.udder??"", r.physical_mark?.teat??"", r.physical_mark?.dewlap??"", r.physical_mark?.milk_vein??"", r.physical_total??""]
    const hdr = ["Name","Tag Number","Date of Birth","Average Milk","Hip Width","Head","Ear","Eye","Muzzle","Horn","Skin","Tail","Hump","Udder","Teat","Dewlap","Milk Vein","Total Physical Mark"]
    const sheets: [string, DetailRecord[]][] = [
      ["Cattle", data.cattle ? [data.cattle] : []],
      ["Mother", data.mother ? [data.mother] : []],
      ["Sisters", data.sisters],
      ["Maternal Aunts", data.maternal_aunts],
    ]
    sheets.forEach(([name, recs])=>{
      const sh = XLSX.utils.aoa_to_sheet([hdr, ...recs.map(toRow as any)])
      sh["!cols"] = hdr.map(()=>({wch:14}))
      XLSX.utils.book_append_sheet(wb, sh, name)
    })
    XLSX.writeFile(wb, `cattle_${selected}_maternal_${new Date().toISOString().slice(0,10)}.xlsx`)
    toast.success("Excel file exported successfully.",{description:`${1 + (data.mother?1:0) + data.sisters.length + data.maternal_aunts.length} records exported`})
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white shadow-md"><Heart className="w-5 h-5"/></span>Cattle Maternal & Physical Records</h1><p className="text-sm text-muted-foreground mt-1">Select a cattle to view its maternal lineage — mother, sisters and maternal aunts (female & present only)</p></div>
        <button onClick={handleExport} disabled={loading||!data} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold shadow-md hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 shrink-0"><FileSpreadsheet className="w-4 h-4"/>Export Excel<Download className="w-4 h-4 opacity-80"/></button>
      </div>

      <div className="bg-white rounded-2xl border border-saffron/10 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground shrink-0">Select Cattle</label>
        <div className="relative w-full sm:w-80">
          <div className="relative">
            <input
              value={open ? search : selectedLabel}
              onChange={e=>{ setSearch(e.target.value); setOpen(true) }}
              onFocus={()=>{ setSearch(""); setOpen(true) }}
              onBlur={()=> setTimeout(()=> setOpen(false), 180)}
              placeholder="Search by name or tag..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-saffron/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20"
            />
            <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <button type="button" onClick={()=> setOpen(o=>!o)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted"><ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open?'rotate-180':''}`} /></button>
          </div>
          {open && (
            <div className="absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-xl border border-saffron/10 bg-white shadow-xl">
              {filtered.length===0 ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">No cattle found</div> :
                filtered.map(o=> (
                  <button
                    key={o.tag_number}
                    onMouseDown={e=>{ e.preventDefault(); setSelected(o.tag_number); setSearch(""); setOpen(false)}}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-saffron/5 border-b border-saffron/5 last:border-0 ${selected===o.tag_number?'bg-saffron/10':''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron/15 to-saffron/5 border border-saffron/20 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-saffron">{(o.name||"?").charAt(0).toUpperCase()}</span></div>
                      <div><p className="text-sm font-medium leading-none">{o.name || "—"}</p><p className="text-xs font-mono text-muted-foreground">{o.tag_number}</p></div>
                    </div>
                    {selected===o.tag_number && <span className="text-xs font-semibold text-saffron">Selected</span>}
                  </button>
                ))
              }
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">Search by name or tag • {options.length} available</span>
      </div>

      {loading ? <div className="space-y-4"><div className="h-64 bg-muted/20 rounded-2xl animate-pulse border"/><div className="h-64 bg-muted/20 rounded-2xl animate-pulse border"/></div>
      : error ? <div className="flex flex-col items-center py-16 text-center"><AlertTriangle className="w-8 h-8 text-red-400 mb-3"/><p className="font-medium">Failed to load</p><p className="text-sm text-muted-foreground">{error}</p></div>
      : data && (
        <>
          <SectionCard title={`Selected Cattle — ${data.cattle?.name || selected}`} icon={<Crown className="w-5 h-5"/>} records={data.cattle ? [data.cattle] : []} subtitle={`${data.cattle?.tag_number || selected} • ${data.cattle?.date_of_birth || "—"}`} />
          <SectionCard title="Mother Information" icon={<Heart className="w-5 h-5"/>} records={data.mother ? [data.mother] : []} subtitle={data.mother ? `${data.mother.name} (${data.mother.tag_number})` : "No mother recorded"} />
          <SectionCard title={`Sisters — Female & Present (same mother) — ${data.sisters.length} found`} icon={<Users className="w-5 h-5"/>} records={data.sisters} subtitle={data.mother ? `Daughters of ${data.mother.name} (${data.mother.tag_number}) excluding ${selected}` : "—"} />
          <SectionCard title={`Maternal Aunts — Female & Present — ${data.maternal_aunts.length} found`} icon={<Baby className="w-5 h-5"/>} records={data.maternal_aunts} subtitle={data.maternal_grandmother ? `Daughters of grandmother ${data.maternal_grandmother.name} (${data.maternal_grandmother.tag_number}) excluding mother` : "No grandmother found"} />
        </>
      )}
    </div>
  )
}
