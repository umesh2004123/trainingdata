import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTelltale, useUpdateTelltale, useDeleteTelltale, useUploadImages, useDeleteImage } from "@/hooks/use-telltales";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUploader } from "@/components/ImageUploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TelltaleStatus } from "@/types/telltale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function TelltaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: telltale, isLoading } = useTelltale(id!);
  const updateTelltale = useUpdateTelltale();
  const deleteTelltale = useDeleteTelltale();
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TelltaleStatus>("not_started");
  const [deleting, setDeleting] = useState(false);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const startEdit = () => {
    if (!telltale) return;
    setName(telltale.name);
    setDescription(telltale.description || "");
    setStatus(telltale.status as TelltaleStatus);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    try {
      await updateTelltale.mutateAsync({ id: id!, name: name.trim(), description: description.trim() || null, status });
      toast.success("Updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleStatusChange = async (newStatus: TelltaleStatus) => {
    try {
      await updateTelltale.mutateAsync({ id: id!, status: newStatus });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = () => {
    setDeleting(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTelltale.mutateAsync(id!);
      toast.success("Deleted");
      navigate("/telltales");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleHoldStart = () => {
    const timer = setTimeout(() => { confirmDelete(); }, 2000);
    setHoldTimer(timer);
  };

  const handleHoldEnd = () => {
    if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null); }
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      await uploadImages.mutateAsync({ telltaleId: id!, files });
      toast.success("Images uploaded");
    } catch {
      toast.error("Failed to upload images");
    }
  };

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      await deleteImage.mutateAsync({ id: imageId, storagePath });
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!telltale) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <p className="text-muted-foreground">Telltale not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate("/telltales")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-card border border-border rounded-xl p-6 space-y-4" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as TelltaleStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.98 }} onClick={saveEdit} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</motion.button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{telltale.name}</h1>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div><StatusBadge status={telltale.status} onClick={() => {}} /></div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      {(["not_started", "ongoing", "completed"] as TelltaleStatus[]).map((s) => (
                        <button key={s} onClick={() => handleStatusChange(s)} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                          <StatusBadge status={s} />
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <button onClick={startEdit} className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
              {telltale.description && <p className="text-sm text-muted-foreground mb-4">{telltale.description}</p>}
              <div className="flex gap-4 text-[10px] uppercase tracking-widest font-mono text-muted-foreground tabular-nums">
                <span>Created {format(new Date(telltale.created_at), "MMM d, yyyy")}</span>
                <span>Updated {formatDistanceToNow(new Date(telltale.updated_at), { addSuffix: true })}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {deleting && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-center space-y-3">
            <p className="text-sm font-medium text-destructive">Hold the button for 2 seconds to confirm deletion</p>
            <div className="flex justify-center gap-3">
              <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
              >
                Hold to Delete
              </button>
              <button onClick={() => setDeleting(false)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <h2 className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-4">Images ({telltale.telltale_images.length})</h2>
          <ImageUploader
            onFilesSelected={handleImageUpload}
            existingImages={telltale.telltale_images.map((img) => ({ id: img.id, url: img.url, storagePath: img.storage_path }))}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      </div>
    </AppLayout>
  );
}
