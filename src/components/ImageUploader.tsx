import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  existingImages?: { id: string; url: string; storagePath: string }[];
  onDeleteImage?: (id: string, storagePath: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ onFilesSelected, existingImages = [], onDeleteImage, disabled }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArray.length === 0) return;
      const newPreviews = fileArray.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
      setPreviews((prev) => [...prev, ...newPreviews]);
      onFilesSelected(fileArray);
    },
    [onFilesSelected]
  );

  const removePreview = (idx: number) => {
    setPreviews((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-1">Drag & drop images here</p>
        <label className="text-sm text-primary font-medium cursor-pointer hover:underline">
          or browse files
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border group">
              <img src={img.url} className="w-full h-full object-cover" alt="" />
              {onDeleteImage && (
                <button
                  onClick={() => onDeleteImage(img.id, img.storagePath)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border group">
              <img src={p.url} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
