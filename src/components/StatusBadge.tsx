import { TelltaleStatus } from "@/types/telltale";
import { motion } from "framer-motion";

const statusConfig: Record<TelltaleStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-status-not-started/10 text-status-not-started border-status-not-started/20" },
  ongoing: { label: "Ongoing", className: "bg-status-ongoing/10 text-status-ongoing border-status-ongoing/20" },
  completed: { label: "Completed", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
};

export function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  const config = statusConfig[status as TelltaleStatus] || statusConfig.not_started;
  return (
    <motion.button
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${config.className} ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {config.label}
    </motion.button>
  );
}
