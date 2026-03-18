import { useState } from "react";
import { useTelltales } from "@/hooks/use-telltales";
import { TelltaleCard } from "@/components/TelltaleCard";
import { StatusFilter } from "@/components/StatusFilter";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { TelltaleStatus } from "@/types/telltale";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

export default function TelltaleList() {
  const { data: telltales, isLoading } = useTelltales();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TelltaleStatus | "all">("all");

  const filtered = telltales?.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Telltales</h1>

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
