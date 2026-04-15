import { useStandards } from "@/hooks/use-standards";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MultiSelectStandardsProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function MultiSelectStandards({ selected, onChange, disabled }: MultiSelectStandardsProps) {
  const { data: standards } = useStandards();
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const selectedNames = standards?.filter((s) => selected.includes(s.id)).map((s) => s.name) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" disabled={disabled} className="w-full justify-between h-auto min-h-10 py-2">
          <div className="flex flex-wrap gap-1">
            {selectedNames.length === 0 ? (
              <span className="text-muted-foreground">Select standards...</span>
            ) : (
              selectedNames.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        {standards?.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors gap-2"
          >
            <div className={cn("h-4 w-4 border rounded flex items-center justify-center", selected.includes(s.id) ? "bg-primary border-primary" : "border-input")}>
              {selected.includes(s.id) && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span className="text-foreground">{s.name}</span>
            {s.description && <span className="text-xs text-muted-foreground ml-auto truncate max-w-[120px]">{s.description}</span>}
          </button>
        ))}
        {(!standards || standards.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">No standards available</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
