import { useState } from "react";
import { useStandards } from "@/hooks/use-standards";
import { useStandardCounts, useSharedTelltalesCount } from "@/hooks/use-standard-counts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Sigma, X } from "lucide-react";

export function StandardsBreakdown() {
  const { data: standards } = useStandards();
  const { data: counts } = useStandardCounts();
  const [picked, setPicked] = useState<string[]>([]);
  const sharedCount = useSharedTelltalesCount(picked);

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const totalTagged = counts.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" /> Standards
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span><span className="font-mono tabular-nums text-foreground">{standards?.length || 0}</span> total</span>
          <span className="opacity-50">·</span>
          <span><span className="font-mono tabular-nums text-foreground">{totalTagged}</span> tagged</span>
        </div>
      </div>

      {/* Per-standard count cards */}
      {counts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">No standards yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {counts.map((s, i) => {
            const active = picked.includes(s.id);
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(s.id)}
                className={`text-left rounded-xl border p-4 transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-accent"
                }`}
                style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
              >
                <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1 truncate">
                  {s.name}
                </p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {String(s.count).padStart(2, "0")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {s.count === 1 ? "telltale" : "telltales"}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Intersection counter */}
      <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sigma className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Shared telltales counter</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Click standards above to find how many telltales are tagged with <strong>all</strong> of them
          (e.g. ISO + FMVSS, or ISO + FMVSS + OEM).
        </p>

        {picked.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Select two or more standards to see the shared count.</p>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {standards?.filter((s) => picked.includes(s.id)).map((s) => (
                <Badge key={s.id} variant="secondary" className="gap-1">
                  {s.name}
                  <button onClick={() => toggle(s.id)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setPicked([])}>
                Clear
              </Button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums text-foreground">{sharedCount}</span>
              <span className="text-xs text-muted-foreground">
                {sharedCount === 1 ? "telltale shares" : "telltales share"} all {picked.length} selected
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
