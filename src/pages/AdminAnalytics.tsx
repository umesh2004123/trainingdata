import { AppLayout } from "@/components/AppLayout";
import { useAnalyticsOverview, useUserGrowth, useStandardUsage, useRecentEvents, useRecentTelltales } from "@/hooks/use-analytics";
import { StandardsBreakdown } from "@/components/StandardsBreakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { Users, UserCheck, Clock, BookOpen, BarChart3, FileText, TrendingUp, Download } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const CHART_COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(262, 83%, 58%)", "hsl(180, 70%, 45%)"];

function OverviewCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
      style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{String(value).padStart(2, "0")}</p>
      <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map((row) => keys.map((k) => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAnalytics() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: growth } = useUserGrowth();
  const { data: standardUsage } = useStandardUsage();
  const { data: recentEvents } = useRecentEvents();
  const { data: recentTelltales } = useRecentTelltales();

  const approvalData = overview
    ? [
        { name: "Approved", value: overview.approvedUsers },
        { name: "Pending", value: overview.pendingUsers },
        { name: "Rejected", value: overview.rejectedUsers },
      ].filter((d) => d.value > 0)
    : [];

  const eventTypeLabels: Record<string, string> = {
    login: "Login",
    view_telltale: "Viewed Telltale",
    approve_user: "Approved User",
    reject_user: "Rejected User",
    role_change: "Changed Role",
    create_telltale: "Created Telltale",
    delete_telltale: "Deleted Telltale",
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform insights and usage metrics</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (recentEvents) exportCSV(recentEvents as Record<string, unknown>[], "analytics-events.csv");
            }}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </motion.button>
        </div>

        {/* Overview Cards */}
        {overviewLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : overview ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <OverviewCard label="Total Users" value={overview.totalUsers} icon={Users} color="bg-primary/10 text-primary" />
            <OverviewCard label="Approved" value={overview.approvedUsers} icon={UserCheck} color="bg-status-completed/10 text-status-completed" />
            <OverviewCard label="Pending" value={overview.pendingUsers} icon={Clock} color="bg-status-ongoing/10 text-status-ongoing" />
            <OverviewCard label="Telltales" value={overview.totalTelltales} icon={FileText} color="bg-accent text-accent-foreground" />
            <OverviewCard label="Standards" value={overview.totalStandards} icon={BookOpen} color="bg-secondary text-secondary-foreground" />
          </div>
        ) : null}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">User Growth</h3>
            </div>
            {growth && growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => format(new Date(v), "MMM d")} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
            )}
          </div>

          {/* Approval Metrics Pie */}
          <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Approval Metrics</h3>
            </div>
            {approvalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={approvalData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {approvalData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No users yet</p>
            )}
          </div>
        </div>

        {/* Standards breakdown (per-standard counts + intersection counter) */}
        <StandardsBreakdown />

        {/* Standard Usage chart */}
        <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Standards Usage</h3>
          </div>
          {standardUsage && standardUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={standardUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No standard usage data yet</p>
          )}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Added Telltales */}
          <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Recently Added Telltales</h3>
            {recentTelltales && recentTelltales.length > 0 ? (
              <div className="space-y-2">
                {recentTelltales.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No telltales yet</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
            {recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-2">
                {recentEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{eventTypeLabels[e.event_type] || e.event_type}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No events tracked yet</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
