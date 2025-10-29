/**
 * Small set of client-side export helpers: CSV, JSON, TXT
 */

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data, filename = "data.json") {
  try {
    const content = JSON.stringify(data, null, 2);
    downloadBlob(content, filename, "application/json;charset=utf-8");
  } catch (e) {
    console.error("exportToJSON error", e);
  }
}

export function exportToTXT(text, filename = "transcript.txt") {
  try {
    const content = typeof text === "string" ? text : String(text);
    downloadBlob(content, filename, "text/plain;charset=utf-8");
  } catch (e) {
    console.error("exportToTXT error", e);
  }
}

function escapeCsvValue(val) {
  if (val === null || val === undefined) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  // escape double quotes by doubling them
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportToCSV(arrayOfObjects = [], filename = "data.csv") {
  if (!Array.isArray(arrayOfObjects)) {
    console.error("exportToCSV: input is not an array");
    return;
  }
  const rows = arrayOfObjects.filter((r) => r && typeof r === "object");
  if (rows.length === 0) {
    downloadBlob("", filename, "text/csv;charset=utf-8");
    return;
  }
  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const header = columns.map(escapeCsvValue).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const v = row[col];
          return escapeCsvValue(v);
        })
        .join(",")
    )
    .join("\r\n");
  const csv = header + "\r\n" + body;
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}
// ...existing code...
