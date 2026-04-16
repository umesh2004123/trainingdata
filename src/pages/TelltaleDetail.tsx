import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTelltale, useUpdateTelltale, useDeleteTelltale, useUploadImages, useDeleteImage } from "@/hooks/use-telltales";
import { useTelltaleStandards, useSetTelltaleStandards } from "@/hooks/use-standards";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUploader } from "@/components/ImageUploader";
import { MultiSelectStandards } from "@/components/MultiSelectStandards";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TelltaleStatus } from "@/types/telltale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsFavorite, useToggleFavorite, useTrackView } from "@/hooks/use-favorites";
import { useTrackEvent } from "@/hooks/use-analytics";

export default function TelltaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: telltale, isLoading } = useTelltale(id!);
  const { data: telltaleStandards } = useTelltaleStandards(id!);
  const updateTelltale = useUpdateTelltale();
  const deleteTelltale = useDeleteTelltale();
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const setTelltaleStandards = useSetTelltaleStandards();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<TelltaleStatus>("not_started");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const startEdit = () => {
    if (!telltale) return;
    setName(telltale.name);
    setDescription(telltale.description || "");
    setCategory(telltale.category || "");
    setStatus(telltale.status as TelltaleStatus);
    setSelectedStandards(telltaleStandards?.map((ts: any) => ts.standard_id) || []);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    try {
      await updateTelltale.mutateAsync({ id: id!, name: name.trim(), description: description.trim() || null, status, category: category.trim() || null });
      await setTelltaleStandards.mutateAsync({ telltaleId: id!, standardIds: selectedStandards });
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
    } catch { toast.error("Failed to update status"); }
  };

  const confirmDelete = async () => {
    try {
      await deleteTelltale.mutateAsync(id!);
      toast.success("Deleted");
      navigate("/telltales");
    } catch { toast.error("Failed to delete"); }
  };

  const handleHoldStart = () => { const timer = setTimeout(() => confirmDelete(), 2000); setHoldTimer(timer); };
  const handleHoldEnd = () => { if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null); } };

  const handleImageUpload = async (files: File[]) => {
    try {
      await uploadImages.mutateAsync({ telltaleId: id!, files });
      toast.success("Images uploaded");
    } catch { toast.error("Failed to upload images"); }
  };

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      await deleteImage.mutateAsync({ id: imageId, storagePath });
      toast.success("Image deleted");
    } catch { toast.error("Failed to delete image"); }
  };

  if (isLoading) {
    return <AppLayout><div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div></AppLayout>;
  }

  if (!telltale) {
    return <AppLayout><div className="max-w-4xl mx-auto text-center py-16"><p className="text-muted-foreground">Telltale not found.</p></div></AppLayout>;
  }

  const standardNames = telltaleStandards?.map((ts: any) => ts.standards?.name).filter(Boolean) || [];

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
                <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Category</label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Warning, Indicator" maxLength={100} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Standards</label>
                <MultiSelectStandards selected={selectedStandards} onChange={setSelectedStandards} />
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
                    <PopoverTrigger asChild><div><StatusBadge status={telltale.status} onClick={() => {}} /></div></PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      {(["not_started", "ongoing", "completed"] as TelltaleStatus[]).map((s) => (
                        <button key={s} onClick={() => handleStatusChange(s)} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                          <StatusBadge status={s} />
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <button onClick={startEdit} className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => setDeleting(true)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
              {telltale.description && <p className="text-sm text-muted-foreground mb-4">{telltale.description}</p>}
              {telltale.category && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">{telltale.category}</Badge>
                </div>
              )}
              {standardNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {standardNames.map((name: string) => (
                    <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                  ))}
                </div>
              )}
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
              <button onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd} onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform">Hold to Delete</button>
              <button onClick={() => setDeleting(false)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <h2 className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-4">Images ({telltale.telltale_images.length})</h2>
          <ImageUploader onFilesSelected={handleImageUpload} existingImages={telltale.telltale_images.map((img) => ({ id: img.id, url: img.url, storagePath: img.storage_path }))} onDeleteImage={handleDeleteImage} />
        </div>
      </div>
    </AppLayout>
  );
}
