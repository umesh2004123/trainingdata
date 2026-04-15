import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Standard {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useStandards() {
  return useQuery({
    queryKey: ["standards"],
    queryFn: async (): Promise<Standard[]> => {
      const { data, error } = await supabase
        .from("standards")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Standard[];
    },
  });
}

export function useCreateStandard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase.from("standards").insert({ name: name.trim(), description: description?.trim() || null }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["standards"] }),
  });
}

export function useUpdateStandard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string | null }) => {
      const { error } = await supabase.from("standards").update({ name: name.trim(), description: description?.trim() || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["standards"] }),
  });
}

export function useDeleteStandard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("standards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["standards"] }),
  });
}

export function useTelltaleStandards(telltaleId: string) {
  return useQuery({
    queryKey: ["telltale-standards", telltaleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telltale_standards")
        .select("*, standards(*)")
        .eq("telltale_id", telltaleId);
      if (error) throw error;
      return data;
    },
    enabled: !!telltaleId,
  });
}

export function useSetTelltaleStandards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ telltaleId, standardIds }: { telltaleId: string; standardIds: string[] }) => {
      // Delete existing
      await supabase.from("telltale_standards").delete().eq("telltale_id", telltaleId);
      // Insert new
      if (standardIds.length > 0) {
        const rows = standardIds.map((sid) => ({ telltale_id: telltaleId, standard_id: sid }));
        const { error } = await supabase.from("telltale_standards").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: (_, { telltaleId }) => {
      qc.invalidateQueries({ queryKey: ["telltale-standards", telltaleId] });
      qc.invalidateQueries({ queryKey: ["telltales"] });
    },
  });
}
