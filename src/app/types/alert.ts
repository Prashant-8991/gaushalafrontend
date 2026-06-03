export interface AlertType {
  alert_type_id: number;
  type_code: string;
  display_name: string;
}

export interface Alert {
  alert_id: number;
  cattle_id: number | null;
  tag_number: string;
  cattle_name: string | null;
  alert_type_id: number;
  type_code: string | null;
  alert_type_name: string | null;
  reference_entity_type: string | null;
  reference_entity_id: number | null;
  due_date: string;
  status: "PENDING" | "COMPLETED" | "DISMISSED" | "OVERDUE" | "ESCALATED";
  priority: number;
  title: string;
  description: string | null;
  generated_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  completed_notes: string | null;
  urgency: "CRITICAL" | "OVERDUE" | "DUE_TODAY" | "DUE_SOON" | "UPCOMING" | null;
}

export interface AlertDashboardSummary {
  total_pending: number;
  total_overdue: number;
  total_escalated: number;
  due_today: number;
  due_this_week: number;
  due_this_month: number;
  vaccine_alerts: number;
  weight_alerts: number;
  recent_completed: {
    alert_id: number;
    title: string;
    tag_number: string;
    cattle_name: string | null;
    completed_at: string;
    completed_by: string | null;
    alert_type: string;
  }[];
  by_priority: { priority: number; count: number }[];
  by_type: { type_code: string; display_name: string; count: number }[];
}

export interface WeightRecord {
  id: number;
  tag_number: string;
  weight_kg: number;
  measured_date: string;
  measured_by: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface WeightRecordCreate {
  tag_number: string;
  weight_kg: number;
  measured_date?: string;
  measured_by?: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: number;
  tag_number: string;
  vaccine_id: number;
  vaccine_name: string;
  administered_date: string | null;
  next_due_date: string | null;
  batch_number: string | null;
  administered_by: string | null;
  notes: string | null;
}

export interface VaccinationRecordCreate {
  tag_number: string;
  vaccine_id: number;
  administered_date?: string;
  batch_number?: string;
  administered_by?: string;
  notes?: string;
}

export interface VaccineMaster {
  id: number;
  name: string;
  booster_after_days: number | null;
  is_annual_repeater: number | null;
  notes: string | null;
}
