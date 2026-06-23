import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Table2, Loader2, AlertTriangle, GripVertical, X, ChevronDown, ChevronRight,
  Download, Search, FileSpreadsheet, ListFilter,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ColumnInfo {
  name: string;
  type: string;
}

interface ReportData {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
}

function formatDisplayLabel(name: string): string {
  return name
    .replace(/^new_is_/, "is_")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ Id$/i, " ID")
    .replace(/ Tag$/i, " Tag");
}

function ColFilter({
  columnName,
  values,
  selected,
  onChange,
  onClose,
}: {
  columnName: string;
  values: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const allSelected = selected.size === values.length;

  const filtered = useMemo(
    () => values.filter((v) => v.toLowerCase().includes(search.toLowerCase())),
    [values, search]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };

  const toggleAll = () => {
    if (allSelected) onChange(new Set());
    else onChange(new Set(values));
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 w-56 bg-white rounded-xl border border-saffron/10 shadow-xl p-2 space-y-1"
    >
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <input
          autoFocus
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-saffron/10 text-xs outline-none focus:ring-1 focus:ring-saffron/30"
        />
      </div>
      <label className="flex items-center gap-2 px-1 py-1 text-xs font-medium cursor-pointer hover:bg-muted/30 rounded border-b border-saffron/5 pb-1.5">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="rounded border-saffron/30 text-saffron"
        />
        <span>Select All ({values.length})</span>
      </label>
      <div className="max-h-44 overflow-y-auto space-y-0.5">
        {filtered.map((v) => (
          <label
            key={v}
            className="flex items-center gap-2 px-1 py-1 rounded text-xs cursor-pointer hover:bg-saffron/5"
          >
            <input
              type="checkbox"
              checked={selected.has(v)}
              onChange={() => toggle(v)}
              className="rounded border-saffron/30 text-saffron"
            />
            <span className="truncate">{v === "" ? <span className="italic text-muted-foreground">(empty)</span> : v}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No values</p>
        )}
      </div>
    </div>
  );
} 

export function Report() {
  const navigate = useNavigate();

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCols, setAvailableCols] = useState<ColumnInfo[]>([]);
  const [selectedCols, setSelectedCols] = useState<ColumnInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const [dragCol, setDragCol] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/report`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch report data");
        return r.json();
      })
      .then((d: ReportData) => {
        setData(d);
        const defaults = d.columns.filter((c) =>
          ["tag_number", "name", "gender", "animal_type", "gen", "age"].includes(c.name)
        );
        setSelectedCols(defaults);
        setAvailableCols(d.columns.filter((c) => !defaults.includes(c)));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const addColumn = useCallback((col: ColumnInfo) => {
    setAvailableCols((p) => p.filter((c) => c.name !== col.name));
    setSelectedCols((p) => [...p, col]);
  }, []);

  const removeColumn = useCallback((col: ColumnInfo) => {
    setSelectedCols((p) => p.filter((c) => c.name !== col.name));
    setAvailableCols((p) => [...p, col]);
    setColumnFilters((p) => {
      const next = { ...p };
      delete next[col.name];
      return next;
    });
  }, []);

  const handleDragStart = (colName: string, source: "available" | "selected") => {
    setDragCol(`${source}::${colName}`);
  };

  const handleDropOnSelected = (e: React.DragEvent) => {
    e.preventDefault();
    const val = dragCol;
    setDragCol(null);
    if (!val) return;
    const [source, colName] = val.split("::");
    if (source === "available") {
      const col = availableCols.find((c) => c.name === colName);
      if (col) addColumn(col);
    }
  };

  const handleDropOnAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    const val = dragCol;
    setDragCol(null);
    if (!val) return;
    const [source, colName] = val.split("::");
    if (source === "selected") {
      const col = selectedCols.find((c) => c.name === colName);
      if (col) removeColumn(col);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Compute unique values per selected column
  const uniqueValues = useMemo(() => {
    if (!data) return {};
    const map: Record<string, string[]> = {};
    for (const col of selectedCols) {
      const vals = new Set<string>();
      for (const row of data.rows) {
        const v = row[col.name];
        vals.add(v === null || v === undefined ? "" : String(v));
      }
      map[col.name] = [...vals].sort();
    }
    return map;
  }, [data, selectedCols]);

  // Initialize column filter sets when columns change or unique values change
  useEffect(() => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      for (const col of selectedCols) {
        if (!next[col.name]) {
          next[col.name] = new Set(uniqueValues[col.name] ?? []);
        }
      }
      return next;
    });
  }, [selectedCols, uniqueValues]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.rows.filter((row) => {
      for (const col of selectedCols) {
        const filterSet = columnFilters[col.name];
        if (!filterSet || filterSet.size === (uniqueValues[col.name]?.length ?? 0)) continue;
        const cellVal = row[col.name] === null || row[col.name] === undefined ? "" : String(row[col.name]);
        if (!filterSet.has(cellVal)) return false;
      }
      return true;
    });
  }, [data, selectedCols, columnFilters, uniqueValues]);

  const table = useReactTable({
    data: filteredRows,
    columns: useMemo(
      () =>
        selectedCols.map((col) => ({
          id: col.name,
          header: formatDisplayLabel(col.name),
          accessorFn: (row: any) => {
            const v = row[col.name];
            if (v === null || v === undefined) return "—";
            if (typeof v === "boolean") return v ? "Yes" : "No";
            return String(v);
          },
        })),
      [selectedCols]
    ),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredAvailable = useMemo(
    () =>
      availableCols.filter((c) =>
        formatDisplayLabel(c.name).toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [availableCols, searchTerm]
  );

  const activeFilterCount = selectedCols.filter((col) => {
    const vals = uniqueValues[col.name];
    const selected = columnFilters[col.name];
    return selected && vals && selected.size < vals.length;
  }).length;

  const exportXLSX = () => {
    if (!data) return;
    const cols = selectedCols.map((c) => c.name);
    const labels = selectedCols.map((c) => formatDisplayLabel(c.name));
    const rows = filteredRows.map((r) => {
      const obj: Record<string, any> = {};
      cols.forEach((c, i) => {
        obj[labels[i]] = r[c] ?? "";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cattle Report");
    XLSX.writeFile(wb, "cattle_report.xlsx");
  };

  const exportCSV = () => {
    if (!data) return;
    const cols = selectedCols.map((c) => c.name);
    const header = cols.map((c) => `"${formatDisplayLabel(c)}"`).join(",");
    const csvRows = filteredRows.map((r) =>
      cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return "";
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cattle_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-saffron animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Failed to load</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-saffron text-white rounded-lg text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Table2 className="w-5 h-5 text-saffron" /> Report Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredRows.length} of {data?.rows.length ?? 0} records &bull; {data?.columns.length ?? 0} columns
              {activeFilterCount > 0 && ` &bull; ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-saffron/20 text-sm hover:bg-muted/30"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={exportXLSX}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-white text-sm hover:opacity-90"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Available Columns */}
        <div
          className="lg:col-span-1 bg-white rounded-xl border border-saffron/10 overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDropOnAvailable}
        >
          <div className="p-3 border-b border-saffron/10">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-saffron" /> Available Columns
            </h3>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-saffron/10 text-xs focus:outline-none focus:ring-1 focus:ring-saffron/30"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[60vh] p-2 space-y-1">
            {filteredAvailable.map((col) => (
              <div
                key={col.name}
                draggable
                onDragStart={() => handleDragStart(col.name, "available")}
                onClick={() => addColumn(col)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-saffron/5 border border-transparent hover:border-saffron/20 text-sm group transition-colors"
              >
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <span className="flex-1 truncate">{formatDisplayLabel(col.name)}</span>
                <span className="text-[0.5rem] text-muted-foreground/30 uppercase">{col.type}</span>
                <ChevronRight className="w-3 h-3 text-saffron/0 group-hover:text-saffron/40 transition-colors" />
              </div>
            ))}
            {filteredAvailable.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                {searchTerm ? "No matching columns" : "All columns selected"}
              </p>
            )}
          </div>
        </div>

        {/* Selected Columns + Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selected columns chips */}
          <div
            className="bg-white rounded-xl border border-saffron/10 p-3 min-h-[60px]"
            onDragOver={handleDragOver}
            onDrop={handleDropOnSelected}
          >
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-saffron" /> Selected Columns ({selectedCols.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCols.map((col) => (
                <span
                  key={col.name}
                  draggable
                  onDragStart={() => handleDragStart(col.name, "selected")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-saffron/10 border border-saffron/20 text-xs font-medium cursor-grab active:cursor-grabbing group"
                >
                  <GripVertical className="w-3 h-3 text-saffron/40" />
                  {formatDisplayLabel(col.name)}
                  <button
                    onClick={() => removeColumn(col)}
                    className="p-0.5 rounded hover:bg-red-100 hover:text-red-500 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCols.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Drag columns here or click from the left panel
                </p>
              )}
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const all: Record<string, Set<string>> = {};
                  for (const col of selectedCols) {
                    all[col.name] = new Set(uniqueValues[col.name] ?? []);
                  }
                  setColumnFilters(all);
                }}
                className="text-xs text-saffron hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-saffron/10 overflow-x-auto relative">
            {selectedCols.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Table2 className="w-12 h-12 text-saffron/20 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select columns to build your report table
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-saffron/10 bg-muted/20">
                      {hg.headers.map((header) => {
                        const colInfo = selectedCols.find((c) => c.name === header.column.id);
                        const filterSet = columnFilters[header.column.id];
                        const totalVals = uniqueValues[header.column.id]?.length ?? 0;
                        const isFiltered = filterSet && filterSet.size < totalVals;
                        return (
                          <th
                            key={header.id}
                            className="px-3 pt-3 pb-1 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none whitespace-nowrap relative"
                          >
                            <div className="flex items-center gap-1">
                              <span
                                onClick={header.column.getToggleSortingHandler()}
                                className="cursor-pointer hover:text-foreground flex items-center gap-1"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: " ▲",
                                  desc: " ▼",
                                }[header.column.getIsSorted() as string] ?? ""}
                              </span>
                              <button
                                onClick={() =>
                                  setOpenFilter(openFilter === header.column.id ? null : header.column.id)
                                }
                                className={`p-1 rounded hover:bg-muted transition-colors ${
                                  isFiltered ? "text-saffron" : "text-muted-foreground/40"
                                }`}
                              >
                                <ListFilter className="w-3 h-3" />
                              </button>
                            </div>
                            {openFilter === header.column.id && colInfo && (
                              <ColFilter
                                columnName={colInfo.name}
                                values={uniqueValues[colInfo.name] ?? []}
                                selected={columnFilters[colInfo.name] ?? new Set()}
                                onChange={(next) =>
                                  setColumnFilters((prev) => ({ ...prev, [colInfo.name]: next }))
                                }
                                onClose={() => setOpenFilter(null)}
                              />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-saffron/5 hover:bg-saffron/5 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5 text-xs text-foreground/80 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={selectedCols.length}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No records match the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Row count */}
          {data && (
            <p className="text-xs text-muted-foreground text-right">
              Showing {filteredRows.length} of {data.rows.length} rows
            </p>
          )}
        </div>
      </div>
    </div>
  );
}