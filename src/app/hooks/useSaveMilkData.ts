import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { saveMilkData } from "../services/milkApi";
import type { SaveMilkPayload } from "../types/milk";

export function useSaveMilkData(tagNumber: string, yearMonth: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveMilkPayload) => saveMilkData(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cattle-milk", tagNumber, yearMonth] });
      const previous = queryClient.getQueryData<Record<string, number>>(["cattle-milk", tagNumber, yearMonth]);
      if (previous) {
        queryClient.setQueryData(["cattle-milk", tagNumber, yearMonth], {
          ...previous,
          [payload.date]: payload.milk,
        });
      }
      return { previous };
    },

    onError: (_err, payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cattle-milk", tagNumber, yearMonth], context.previous);
      }
      toast.error("Failed to update milk data");
    },

    onSuccess: () => {
      toast.success("Data updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cattle-milk", tagNumber, yearMonth] });
    },
  });
}
