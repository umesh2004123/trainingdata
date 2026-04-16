import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useTrackEvent() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ eventType, metadata }: { eventType: string; metadata?: Record<string, unknown> }) => {
      if (!user) return;
      const row = {
        event_type: eventType,
        user_id: user.id,
        metadata: JSON.parse(JSON.stringify(metadata || {})),
      };
      const { error } = await supabase.from("analytics_events").insert([row]);
      if (error) throw error;
    },
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const [profilesRes, telltalesRes, standardsRes] = await Promise.all([
        supabase.from("profiles").select("status"),
        supabase.from("telltales").select("id"),
        supabase.from("standards").select("id"),
      ]);

      const profiles = profilesRes.data || [];
      return {
        totalUsers: profiles.length,
        approvedUsers: profiles.filter((p) => p.status === "approved").length,
        pendingUsers: profiles.filter((p) => p.status === "pending").length,
        rejectedUsers: profiles.filter((p) => p.status === "rejected").length,
        totalTelltales: telltalesRes.data?.length || 0,
        totalStandards: standardsRes.data?.length || 0,
      };
    },
  });
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ["analytics-user-growth"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (!data) return [];
      const grouped = new Map<string, number>();
      for (const p of data) {
        const day = p.created_at.slice(0, 10);
        grouped.set(day, (grouped.get(day) || 0) + 1);
      }
      return Array.from(grouped.entries()).map(([date, count]) => ({ date, count }));
    },
  });
}

export function useStandardUsage() {
  return useQuery({
    queryKey: ["analytics-standard-usage"],
    queryFn: async () => {
      const { data: standards } = await supabase.from("standards").select("id, name");
      const { data: ts } = await supabase.from("telltale_standards").select("standard_id");

      if (!standards) return [];
      const countMap = new Map<string, number>();
      for (const row of ts || []) {
        countMap.set(row.standard_id, (countMap.get(row.standard_id) || 0) + 1);
      }
      return standards.map((s) => ({ name: s.name, count: countMap.get(s.id) || 0 })).sort((a, b) => b.count - a.count);
    },
  });
}

export function useRecentEvents() {
  return useQuery({
    queryKey: ["analytics-recent-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });
}

export function useRecentTelltales() {
  return useQuery({
    queryKey: ["analytics-recent-telltales"],
    queryFn: async () => {
      const { data } = await supabase
        .from("telltales")
        .select("id, name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });
}
