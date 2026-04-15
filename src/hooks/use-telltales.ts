import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TelltaleWithImages, TelltaleStatus } from "@/types/telltale";
import { useEffect } from "react";

export function useTelltales() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["telltales"],
    queryFn: async (): Promise<TelltaleWithImages[]> => {
      const { data, error } = await supabase
        .from("telltales")
        .select("*, telltale_images(*)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as TelltaleWithImages[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("telltales-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "telltales" }, () => {
        queryClient.invalidateQueries({ queryKey: ["telltales"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "telltale_images" }, () => {
        queryClient.invalidateQueries({ queryKey: ["telltales"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useTelltale(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["telltale", id],
    queryFn: async (): Promise<TelltaleWithImages> => {
      const { data, error } = await supabase
        .from("telltales")
        .select("*, telltale_images(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as TelltaleWithImages;
    },
    enabled: !!id,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`telltale-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "telltales", filter: `id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["telltale", id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "telltale_images", filter: `telltale_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["telltale", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  return query;
}

export function useCreateTelltale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, status, category, created_by }: {
      name: string; description?: string; status?: TelltaleStatus; category?: string; created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from("telltales")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          status: status || "not_started",
          category: category || null,
          created_by: created_by || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["telltales"] }); },
  });
}

export function useUpdateTelltale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string; name?: string; description?: string | null; status?: TelltaleStatus; category?: string | null;
    }) => {
      const { data, error } = await supabase.from("telltales").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["telltales"] });
      queryClient.invalidateQueries({ queryKey: ["telltale", variables.id] });
    },
  });
}

export function useDeleteTelltale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("telltales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["telltales"] }); },
  });
}

export function useUploadImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ telltaleId, files }: { telltaleId: string; files: File[] }) => {
      const uploads = files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const path = `${telltaleId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("telltale-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("telltale-images").getPublicUrl(path);
        const { error: insertError } = await supabase.from("telltale_images").insert({ telltale_id: telltaleId, url: urlData.publicUrl, storage_path: path });
        if (insertError) throw insertError;
      });
      await Promise.all(uploads);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["telltales"] }); },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("telltale-images").remove([storagePath]);
      const { error } = await supabase.from("telltale_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["telltales"] }); },
  });
}
