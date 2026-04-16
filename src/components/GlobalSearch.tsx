import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  type: "telltale" | "standard" | "user";
  id: string;
  title: string;
  subtitle?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();
      const [telltalesRes, standardsRes, profilesRes] = await Promise.all([
        supabase.from("telltales").select("id, name, status").ilike("name", `%${q}%`).limit(5),
        supabase.from("standards").select("id, name").ilike("name", `%${q}%`).limit(5),
        supabase.from("profiles").select("user_id, display_name, email, status").or(`display_name.ilike.%${q}%,email.ilike.%${q}%`).limit(5),
      ]);

      const items: SearchResult[] = [
        ...(telltalesRes.data || []).map((t) => ({ type: "telltale" as const, id: t.id, title: t.name, subtitle: t.status })),
        ...(standardsRes.data || []).map((s) => ({ type: "standard" as const, id: s.id, title: s.name, subtitle: "Standard" })),
        ...(profilesRes.data || []).map((p) => ({ type: "user" as const, id: p.user_id, title: p.display_name || p.email || "User", subtitle: p.status })),
      ];
      setResults(items);
      setLoading(false);
    }, 300);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "telltale") navigate(`/telltales/${result.id}`);
    else if (result.type === "standard") navigate("/admin/standards");
    else navigate("/admin/users");
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 cursor-pointer hover:bg-secondary transition-colors"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">Search…</span>
        <kbd className="hidden md:inline text-[10px] font-mono bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border">⌘K</kbd>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed inset-x-4 top-20 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-50 bg-card border border-border rounded-xl overflow-hidden"
              style={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search telltales, standards, users…"
                  className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm"
                />
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-secondary">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {loading && <p className="text-sm text-muted-foreground text-center py-4">Searching…</p>}
                {!loading && query && results.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                )}
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-0"
                  >
                    <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground w-16 flex-shrink-0">{r.type}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
