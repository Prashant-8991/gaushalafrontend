import { useQuery } from "@tanstack/react-query";

export interface CattleMilkRecord {
  tag_number: string;
  date: string;
  milk: number;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useCattleMilk(tagNumber: string | null) {
  return useQuery<CattleMilkRecord[]>({
    queryKey: ["cattle-milk", tagNumber],
    queryFn: async () => {
      if (!tagNumber) throw new Error("No tag number provided");
      const res = await fetch(`${API_BASE}/cattle-milk/?tag_number=${tagNumber}`);
      if (!res.ok) throw new Error(res.status === 404 ? "No milk data found" : `API error ${res.status}`);
      return res.json();
    },
    enabled: !!tagNumber,
    staleTime: 1000 * 60 * 5,
  });
}
