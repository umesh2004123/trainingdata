import { TelltaleWithImages } from "@/types/telltale";
import { StatusBadge } from "./StatusBadge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

function GeometricPattern({ id }: { id: string }) {
  // Generate a deterministic pattern from the ID
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `hsl(${hue}, 30%, 92%)` }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="4" y="4" width="10" height="10" fill={`hsl(${hue}, 40%, 75%)`} rx="2" />
        <rect x="18" y="4" width="10" height="10" fill={`hsl(${(hue + 60) % 360}, 40%, 75%)`} rx="2" />
        <rect x="4" y="18" width="10" height="10" fill={`hsl(${(hue + 120) % 360}, 40%, 75%)`} rx="2" />
        <rect x="18" y="18" width="10" height="10" fill={`hsl(${(hue + 180) % 360}, 40%, 75%)`} rx="2" />
      </svg>
    </div>
  );
}

export function TelltaleCard({ item }: { item: TelltaleWithImages }) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/telltales/${item.id}`)}
      className="group relative bg-card border border-border p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
      style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.name}</h3>
        <StatusBadge status={item.status} />
      </div>

      {item.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
      )}

      <div className="grid grid-cols-4 gap-2 mb-4">
        {(item.telltale_images?.length ?? 0) > 0
          ? item.telltale_images!.slice(0, 4).map((img) => (
              <div key={img.id} className="aspect-square bg-secondary rounded-md overflow-hidden border border-border">
                <img src={img.url} className="w-full h-full object-cover" alt="" loading="lazy" />
              </div>
            ))
          : (
            <div className="aspect-square rounded-md overflow-hidden border border-border">
              <GeometricPattern id={item.id} />
            </div>
          )}
        {(item.telltale_images?.length ?? 0) > 4 && (
          <div className="aspect-square bg-secondary rounded-md flex items-center justify-center border border-border">
            <span className="text-xs font-medium text-muted-foreground">+{item.telltale_images!.length - 4}</span>
          </div>
        )}
      </div>

      {item.updated_at && !isNaN(new Date(item.updated_at).getTime()) && (
        <div className="flex items-center text-[10px] uppercase tracking-widest text-muted-foreground font-mono tabular-nums">
          <span>Updated {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}</span>
        </div>
      )}
    </motion.div>
  );
}
