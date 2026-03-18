import { TelltaleStatus } from "@/types/telltale";

export function StatusFilter({
  value,
  onChange,
}: {
  value: TelltaleStatus | "all";
  onChange: (v: TelltaleStatus | "all") => void;
}) {
  const filters: { key: TelltaleStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "not_started", label: "Not Started" },
    { key: "ongoing", label: "Ongoing" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === f.key
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
