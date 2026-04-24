import { useStandards } from "@/hooks/use-standards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StandardsFilterProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  mode: "any" | "all";
  onModeChange: (mode: "any" | "all") => void;
  onExport: () => void;
  exportLabel?: string;
}

export function StandardsFilter({ selected, onChange, mode, onModeChange, onExport, exportLabel = "Export Excel" }: StandardsFilterProps) {
  const { data: standards } = useStandards();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-3">
      {/* Quick chips */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground mr-1">Standards:</span>
        <button
          onClick={() => onChange([])}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selected.length === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          All
        </button>
        {standards?.map((s) => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Advanced toggle row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setAdvancedOpen((o) => !o)} className="h-8">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          Advanced filter
          {advancedOpen ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
        </Button>
        <Button variant="default" size="sm" onClick={onExport} className="h-8">
          {exportLabel}
        </Button>
        {selected.length > 1 && (
          <Badge variant="secondary" className="text-xs">
            Mode: {mode === "all" ? "Shares ALL" : "Shares ANY"} ({selected.length})
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {advancedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">Match mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onModeChange("any")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      mode === "any" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    Shares ANY selected
                  </button>
                  <button
                    onClick={() => onModeChange("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      mode === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    Shares ALL selected (intersection)
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select multiple standards (e.g. ISO, FMVSS, OEM). "Shares ALL" returns only telltales tagged with every selected standard.
                </p>
              </div>

              {selected.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">Selected</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {standards?.filter((s) => selected.includes(s.id)).map((s) => (
                      <Badge key={s.id} variant="secondary" className="gap-1">
                        {s.name}
                        <button onClick={() => toggle(s.id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <button onClick={() => onChange([])} className="text-xs text-muted-foreground hover:text-foreground underline ml-2">
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
