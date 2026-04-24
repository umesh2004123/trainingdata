import { useMemo, useState } from "react";
import { useTelltales } from "@/hooks/use-telltales";
import { TelltaleCard } from "@/components/TelltaleCard";
import { StatusFilter } from "@/components/StatusFilter";
import { StandardsFilter } from "@/components/StandardsFilter";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { TelltaleStatus } from "@/types/telltale";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { exportTelltalesToExcel } from "@/lib/export-telltales";
import { toast } from "sonner";
import { RolePermissionsBanner } from "@/components/RolePermissionsBanner";

export default function TelltaleList() {
  const { data: telltales, isLoading } = useTelltales();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TelltaleStatus | "all">("all");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<"any" | "all">("any");

  const filtered = useMemo(() => {
    return (telltales || []).filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const tStdIds = (t.telltale_standards || []).map((s) => s.standard_id);
      let matchesStandards = true;
      if (selectedStandards.length > 0) {
        matchesStandards =
          matchMode === "all"
            ? selectedStandards.every((id) => tStdIds.includes(id))
            : selectedStandards.some((id) => tStdIds.includes(id));
      }
      return matchesSearch && matchesStatus && matchesStandards;
    });
  }, [telltales, search, statusFilter, selectedStandards, matchMode]);

  const handleExport = async () => {
    if (filtered.length === 0) {
      toast.error("No telltales to export with current filters.");
      return;
    }
    const loadingId = toast.loading(`Preparing Excel with ${filtered.length} telltale${filtered.length === 1 ? "" : "s"} (embedding images)...`);
    try {
      await exportTelltalesToExcel(filtered, `telltales-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${filtered.length} telltale${filtered.length === 1 ? "" : "s"} to Excel.`, { id: loadingId });
    } catch (e) {
      toast.error("Export failed. Please try again.", { id: loadingId });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Telltales</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {filtered.length} of {telltales?.length || 0}
          </p>
        </div>

        <RolePermissionsBanner />

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search telltales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <StandardsFilter
          selected={selectedStandards}
          onChange={setSelectedStandards}
          mode={matchMode}
          onModeChange={setMatchMode}
          onExport={handleExport}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No telltales found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <TelltaleCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
