import type { CattleMilkRecord, SaveMilkPayload } from "../types/milk";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchCattleMilk(tagNumber: string, yearMonth: string): Promise<CattleMilkRecord[]> {
  const res = await fetch(`${API_BASE}/cattle-milk/?tag_number=${tagNumber}&year_month=${yearMonth}`);
  if (!res.ok) throw new Error(res.status === 404 ? "No milk data found" : `API error ${res.status}`);
  return res.json();
}

export async function saveMilkData(payload: SaveMilkPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/insert-milk-data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
}
