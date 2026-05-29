export interface CattleMilkRecord {
  tag_number: string;
  date: string;
  milk: number;
}

export interface SaveMilkPayload {
  tag_number: string;
  date: string;
  milk: number;
}

export type MilkMap = Record<string, number>;
