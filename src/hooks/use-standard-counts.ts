import { useMemo } from "react";
import { useTelltales } from "@/hooks/use-telltales";
import { useStandards } from "@/hooks/use-standards";

export interface StandardCount {
  id: string;
  name: string;
  count: number;
}

/** Per-standard total telltale counts. */
export function useStandardCounts(): { data: StandardCount[]; isLoading: boolean } {
  const { data: telltales, isLoading: l1 } = useTelltales();
  const { data: standards, isLoading: l2 } = useStandards();

  const data = useMemo<StandardCount[]>(() => {
    if (!standards) return [];
    const counts = new Map<string, number>();
    (telltales || []).forEach((t) => {
      (t.telltale_standards || []).forEach((ts) => {
        counts.set(ts.standard_id, (counts.get(ts.standard_id) || 0) + 1);
      });
    });
    return standards
      .map((s) => ({ id: s.id, name: s.name, count: counts.get(s.id) || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [telltales, standards]);

  return { data, isLoading: l1 || l2 };
}

/** Count telltales that share ALL of the given standard ids (intersection). */
export function useSharedTelltalesCount(standardIds: string[]) {
  const { data: telltales } = useTelltales();
  return useMemo(() => {
    if (!standardIds.length || !telltales) return 0;
    return telltales.filter((t) => {
      const ids = (t.telltale_standards || []).map((s) => s.standard_id);
      return standardIds.every((id) => ids.includes(id));
    }).length;
  }, [telltales, standardIds]);
}
