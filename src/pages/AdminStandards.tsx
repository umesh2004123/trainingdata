import { useState } from "react";
import { useStandards, useCreateStandard, useUpdateStandard, useDeleteStandard } from "@/hooks/use-standards";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminStandards() {
  const { data: standards, isLoading } = useStandards();
  const createStandard = useCreateStandard();
  const updateStandard = useUpdateStandard();
  const deleteStandard = useDeleteStandard();

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    try {
      await createStandard.mutateAsync({ name: newName, description: newDesc });
      toast.success("Standard created");
      setNewName(""); setNewDesc(""); setDialogOpen(false);
    } catch {
      toast.error("Failed to create standard");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    try {
      await updateStandard.mutateAsync({ id, name: editName, description: editDesc });
      toast.success("Standard updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this standard? It will be unlinked from all telltales.")) return;
    try {
      await deleteStandard.mutateAsync(id);
      toast.success("Standard deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (s: { id: string; name: string; description: string | null }) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditDesc(s.description || "");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Standards</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage telltale standards (FMVSS, ISO, SAE, etc.)</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Standard</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Standard</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Name *</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. FMVSS" maxLength={100} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Description</label>
                  <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" maxLength={500} />
                </div>
                <Button onClick={handleCreate} disabled={createStandard.isPending} className="w-full">
                  {createStandard.isPending ? "Creating..." : "Create Standard"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !standards?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No standards yet. Add your first one!</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div className="divide-y divide-border">
              {standards.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 gap-3">
                  {editingId === s.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-[200px]" />
                      <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" className="flex-1" />
                      <Button size="icon" variant="ghost" onClick={() => handleUpdate(s.id)}><Save className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(s)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
