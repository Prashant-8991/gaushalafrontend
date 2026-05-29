import { useQuery } from "@tanstack/react-query";
import { fetchCattleMilk } from "../services/milkApi";
import type { MilkMap } from "../types/milk";

export function useMilkCalendar(tagNumber: string | null, yearMonth: string | null) {
  return useQuery<MilkMap>({
    queryKey: ["cattle-milk", tagNumber, yearMonth],
    queryFn: async () => {
      if (!tagNumber || !yearMonth) return {};
      const records = await fetchCattleMilk(tagNumber, yearMonth);
      const map: MilkMap = {};
      for (const r of records) {
        map[r.date] = r.milk;
      }
      return map;
    },
    enabled: !!tagNumber && !!yearMonth,
    staleTime: 1000 * 60 * 5,
  });
}
