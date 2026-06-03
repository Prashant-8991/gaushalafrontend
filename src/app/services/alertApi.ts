import type {
  Alert,
  AlertDashboardSummary,
  WeightRecord,
  WeightRecordCreate,
  VaccinationRecord,
  VaccinationRecordCreate,
  VaccineMaster,
} from "../types/alert";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getAlertDashboardSummary(): Promise<AlertDashboardSummary> {
  return fetchJson<AlertDashboardSummary>(`${API_BASE}/alerts/dashboard-summary`);
}

export async function getAlerts(params: {
  status?: string;
  alert_type_id?: number;
  tag_number?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Alert[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.alert_type_id !== undefined) query.set("alert_type_id", String(params.alert_type_id));
  if (params.tag_number) query.set("tag_number", params.tag_number);
  if (params.search) query.set("search", params.search);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));
  const qs = query.toString();
  return fetchJson<Alert[]>(`${API_BASE}/alerts${qs ? `?${qs}` : ""}`);
}

export async function completeAlert(alertId: number, completedBy?: string): Promise<{ success: boolean; message: string }> {
  const query = completedBy ? `?completed_by=${encodeURIComponent(completedBy)}` : "";
  return fetchJson<{ success: boolean; message: string }>(
    `${API_BASE}/alerts/${alertId}/complete${query}`,
    { method: "PUT" }
  );
}

export async function getVaccineMaster(): Promise<VaccineMaster[]> {
  return fetchJson<VaccineMaster[]>(`${API_BASE}/vaccine-master`);
}

export async function getVaccinationHistory(tagNumber: string): Promise<VaccinationRecord[]> {
  return fetchJson<VaccinationRecord[]>(`${API_BASE}/vaccination-records/${encodeURIComponent(tagNumber)}`);
}

export async function createVaccinationRecord(payload: VaccinationRecordCreate): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/vaccination-records/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getWeightHistory(tagNumber: string): Promise<WeightRecord[]> {
  return fetchJson<WeightRecord[]>(`${API_BASE}/weight-records/${encodeURIComponent(tagNumber)}`);
}

export async function createWeightRecord(payload: WeightRecordCreate): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/weight-records/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function triggerAlertGeneration(): Promise<{ success: boolean; vaccine_alerts_generated: number; weight_alerts_generated: number }> {
  return fetchJson<{ success: boolean; vaccine_alerts_generated: number; weight_alerts_generated: number }>(
    `${API_BASE}/alerts/generate`,
    { method: "POST" }
  );
}
