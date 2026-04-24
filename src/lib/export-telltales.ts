import ExcelJS from "exceljs";
import { TelltaleWithImages } from "@/types/telltale";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  ongoing: "Ongoing",
  completed: "Completed",
};

async function fetchImageBuffer(url: string): Promise<{ buffer: ArrayBuffer; ext: "png" | "jpeg" | "gif" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    const type = blob.type.toLowerCase();
    let ext: "png" | "jpeg" | "gif" = "png";
    if (type.includes("jpeg") || type.includes("jpg")) ext = "jpeg";
    else if (type.includes("gif")) ext = "gif";
    return { buffer, ext };
  } catch {
    return null;
  }
}

export async function exportTelltalesToExcel(items: TelltaleWithImages[], filename = "telltales.xlsx") {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Telltale Tracker";
  wb.created = new Date();

  const ws = wb.addWorksheet("Telltales", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  // Columns
  ws.columns = [
    { key: "idx", width: 6 },
    { key: "name", width: 28 },
    { key: "category", width: 20 },
    { key: "status", width: 14 },
    { key: "standards", width: 30 },
    { key: "description", width: 40 },
    { key: "image", width: 22 },
    { key: "created", width: 22 },
  ];

  // Title row
  ws.mergeCells("A1:H1");
  const title = ws.getCell("A1");
  title.value = "🚗  TELLTALES REFERENCE DIRECTORY";
  title.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
  ws.getRow(1).height = 32;

  // Subtitle row
  ws.mergeCells("A2:H2");
  const subtitle = ws.getCell("A2");
  const dateStr = new Date().toLocaleDateString();
  subtitle.value = `Generated: ${dateStr}   |   Total Telltales: ${items.length}`;
  subtitle.font = { italic: true, color: { argb: "FF475569" } };
  subtitle.alignment = { horizontal: "center" };
  ws.getRow(2).height = 20;

  // Header row
  const header = ws.getRow(3);
  header.values = ["#", "Telltale Name", "Category", "Status", "Standards", "Description", "Image", "Created At"];
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });
  header.height = 22;

  // Data rows + embed images
  for (let i = 0; i < items.length; i++) {
    const t = items[i];
    const standards = (t.telltale_standards || [])
      .map((ts) => ts.standards?.name)
      .filter(Boolean)
      .join(", ");

    const rowIdx = i + 4;
    const row = ws.getRow(rowIdx);
    row.values = [
      i + 1,
      t.name,
      t.category || "—",
      STATUS_LABEL[t.status] || t.status,
      standards || "—",
      t.description || "—",
      "", // image cell
      t.created_at ? new Date(t.created_at).toLocaleString() : "",
    ];
    row.height = 80;
    row.alignment = { vertical: "middle", wrapText: true };
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
    if (i % 2 === 1) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
    }

    // Status color tag
    const statusCell = ws.getCell(rowIdx, 4);
    const statusColors: Record<string, string> = {
      Completed: "FF16A34A",
      Ongoing: "FFF59E0B",
      "Not Started": "FF94A3B8",
    };
    const sc = statusColors[STATUS_LABEL[t.status] || t.status];
    if (sc) {
      statusCell.font = { bold: true, color: { argb: sc } };
      statusCell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Embed first image
    const firstImg = (t.telltale_images || [])[0];
    if (firstImg?.url) {
      const img = await fetchImageBuffer(firstImg.url);
      if (img) {
        const imageId = wb.addImage({ buffer: img.buffer, extension: img.ext });
        ws.addImage(imageId, {
          tl: { col: 6.1, row: rowIdx - 1 + 0.1 },
          ext: { width: 130, height: 95 },
          editAs: "oneCell",
        });
      }
    }
  }

  // Trigger download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
