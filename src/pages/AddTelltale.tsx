import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTelltale, useUploadImages } from "@/hooks/use-telltales";
import { useSetTelltaleStandards } from "@/hooks/use-standards";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/AppLayout";
import { ImageUploader } from "@/components/ImageUploader";
import { MultiSelectStandards } from "@/components/MultiSelectStandards";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TelltaleStatus } from "@/types/telltale";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AddTelltale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createTelltale = useCreateTelltale();
  const uploadImages = useUploadImages();
  const setTelltaleStandards = useSetTelltaleStandards();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<TelltaleStatus>("not_started");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Telltale name is required");
      return;
    }
    setSubmitting(true);
    try {
      const telltale = await createTelltale.mutateAsync({
        name, description, status, category: category.trim() || undefined, created_by: user?.id,
      });
      if (files.length > 0) {
        await uploadImages.mutateAsync({ telltaleId: telltale.id, files });
      }
      if (selectedStandards.length > 0) {
        await setTelltaleStandards.mutateAsync({ telltaleId: telltale.id, standardIds: selectedStandards });
      }
      toast.success("Telltale created");
      navigate("/telltales");
    } catch {
      toast.error("Failed to create telltale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add New Telltale</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter telltale name" maxLength={200} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} maxLength={1000} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Warning, Indicator" maxLength={100} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Standards</label>
              <MultiSelectStandards selected={selectedStandards} onChange={setSelectedStandards} disabled={submitting} />
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
          </div>

          <div className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-3 block">Images</label>
            <ImageUploader onFilesSelected={handleFilesSelected} disabled={submitting} />
          </div>

          <div className="flex gap-3">
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Saving..." : "Save Telltale"}
            </motion.button>
            <button type="button" onClick={() => navigate("/telltales")} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
