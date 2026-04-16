import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*, telltales(id, name, status, category, created_at)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useIsFavorite(telltaleId: string) {
  const { data: favorites } = useFavorites();
  return favorites?.some((f) => f.telltale_id === telltaleId) || false;
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ telltaleId, isFavorite }: { telltaleId: string; isFavorite: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isFavorite) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("telltale_id", telltaleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: user.id, telltale_id: telltaleId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRecentlyViewed() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recently-viewed", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_recent")
        .select("*, telltales(id, name, status, category)")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTrackView() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (telltaleId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("user_recent")
        .upsert({ user_id: user.id, telltale_id: telltaleId, viewed_at: new Date().toISOString() }, { onConflict: "user_id,telltale_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recently-viewed"] }),
  });
}
