import { useMemo } from "react";
import { useTelltales } from "@/hooks/use-telltales";
import { useRecentlyViewed } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { TelltaleCard } from "@/components/TelltaleCard";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle, Users, BarChart3, Clock, FolderKanban, Film, Layers, Sparkles, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function StatCard({
  label, value, icon: Icon, gradient,
}: { label: string; value: number | string; icon: typeof Film; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
      style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
    >
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${gradient}`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: { label: string; icon: typeof PlusCircle; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
      style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </motion.button>
  );
}

const CATEGORY_ICONS: Record<string, typeof Film> = {
  default: Layers,
};
const CATEGORY_GRADIENTS = [
  "bg-gradient-to-br from-primary to-primary/60",
  "bg-gradient-to-br from-status-completed to-status-ongoing",
  "bg-gradient-to-br from-status-ongoing to-status-not-started",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-blue-500 to-cyan-500",
  "bg-gradient-to-br from-emerald-500 to-teal-500",
];

export default function Dashboard() {
  const { data: telltales, isLoading } = useTelltales();
  const { data: recentlyViewed } = useRecentlyViewed();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const total = telltales?.length || 0;

  const categoryGroups = useMemo(() => {
    const map = new Map<string, { count: number; lastUpdated: string }>();
    (telltales || []).forEach((t) => {
      const cat = t.category || "Uncategorized";
      const existing = map.get(cat);
      if (!existing) {
        map.set(cat, { count: 1, lastUpdated: t.updated_at });
      } else {
        existing.count += 1;
        if (t.updated_at > existing.lastUpdated) existing.lastUpdated = t.updated_at;
      }
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [telltales]);

  const recentUploads = useMemo(
    () => [...(telltales || [])]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 6),
    [telltales]
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total > 0 ? `${total} telltales across ${categoryGroups.length} categories` : "Welcome — add your first telltale"}
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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <QuickAction label="Add Telltale" icon={PlusCircle} onClick={() => navigate("/telltales/new")} />
          {isAdmin && <QuickAction label="Manage Users" icon={Users} onClick={() => navigate("/admin/users")} />}
          {isAdmin && <QuickAction label="View Analytics" icon={BarChart3} onClick={() => navigate("/admin/analytics")} />}
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Categories" value={String(categoryGroups.length).padStart(2, "0")} icon={FolderKanban} gradient="bg-gradient-to-br from-primary to-purple-500" />
            <StatCard label="Total Telltales" value={String(total).padStart(2, "0")} icon={Film} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
            <StatCard label="Recent Uploads" value={String(recentUploads.length).padStart(2, "0")} icon={Clock} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
          </div>
        )}

        {/* Categories grid */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" /> Categories
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : categoryGroups.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No categories yet. Add a telltale to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryGroups.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.name.toLowerCase()] || CATEGORY_ICONS.default;
                const gradient = CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3 }}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 cursor-pointer"
                    style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                    onClick={() => navigate(`/telltales?category=${encodeURIComponent(cat.name)}`)}
                  >
                    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 ${gradient}`} />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${gradient}`}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                        {new Date(cat.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{cat.count} {cat.count === 1 ? "Telltale" : "Telltales"}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      View Telltales <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bar chart: videos per category */}
        {!isLoading && categoryGroups.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" /> Telltales per Category
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryGroups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Recently Viewed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyViewed.slice(0, 3).map((rv) => rv.telltales && (
                <TelltaleCard key={rv.id} item={rv.telltales as any} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Uploads */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 flex items-center gap-2">
            <Film className="h-4 w-4 text-muted-foreground" /> Recent Uploads
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No videos yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentUploads.map((item) => (
                <TelltaleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
