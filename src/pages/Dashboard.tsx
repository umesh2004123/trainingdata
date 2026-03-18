import { useTelltales } from "@/hooks/use-telltales";
import { motion } from "framer-motion";
import { TelltaleCard } from "@/components/TelltaleCard";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
      <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">{label}</p>
      <p className={`text-3xl font-semibold tracking-tight tabular-nums ${color || "text-foreground"}`}>{String(value).padStart(2, "0")}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: telltales, isLoading } = useTelltales();
  const navigate = useNavigate();

  const total = telltales?.length || 0;
  const completed = telltales?.filter((t) => t.status === "completed").length || 0;
  const ongoing = telltales?.filter((t) => t.status === "ongoing").length || 0;
  const notStarted = telltales?.filter((t) => t.status === "not_started").length || 0;
  const recent = telltales?.slice(0, 6) || [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total > 0 ? `${notStarted + ongoing} Telltales require attention.` : "No telltales yet."}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/telltales/new")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="h-4 w-4" />
            Add Telltale
          </motion.button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={total} />
            <StatCard label="Completed" value={completed} color="text-status-completed" />
            <StatCard label="Ongoing" value={ongoing} color="text-status-ongoing" />
            <StatCard label="Not Started" value={notStarted} color="text-status-not-started" />
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">Recent Activity</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No telltales yet. Create your first one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((item) => (
                <TelltaleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
