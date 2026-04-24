import * as XLSX from "xlsx";
import { TelltaleWithImages } from "@/types/telltale";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  ongoing: "Ongoing",
  completed: "Completed",
};

export function exportTelltalesToExcel(items: TelltaleWithImages[], filename = "telltales.xlsx") {
  const rows = items.map((t) => {
    const standards = (t.telltale_standards || [])
      .map((ts) => ts.standards?.name)
      .filter(Boolean)
      .join(", ");
    const images = (t.telltale_images || []).map((i) => i.url).join(" | ");
    return {
      Name: t.name,
      Description: t.description || "",
      Category: t.category || "",
      Status: STATUS_LABEL[t.status] || t.status,
      Standards: standards,
      "Image Count": (t.telltale_images || []).length,
      "Image URLs": images,
      "Created At": t.created_at ? new Date(t.created_at).toLocaleString() : "",
      "Updated At": t.updated_at ? new Date(t.updated_at).toLocaleString() : "",
      "Created By": t.created_by || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths for clean UI
  ws["!cols"] = [
    { wch: 28 }, // Name
    { wch: 40 }, // Description
    { wch: 18 }, // Category
    { wch: 14 }, // Status
    { wch: 30 }, // Standards
    { wch: 12 }, // Image Count
    { wch: 60 }, // Image URLs
    { wch: 20 }, // Created
    { wch: 20 }, // Updated
    { wch: 36 }, // Created By
  ];

  // Header styling (xlsx community build supports basic style attrs)
  const headerKeys = Object.keys(rows[0] || { Name: "" });
  headerKeys.forEach((_, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (ws[cellRef]) {
      (ws[cellRef] as Record<string, unknown>).s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "left", vertical: "center" },
      };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Telltales");
  XLSX.writeFile(wb, filename);
}
