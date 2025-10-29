import React, { useMemo } from "react";
import { detectColumnTypes } from "../utils/helpers";
import { exportToCSV, exportToJSON } from "../utils/exportUtils";
/**
 * DataTable - fixed-height preview with horizontal scroll for wide tables.
 * - Constrains preview width so the page doesn't scroll horizontally.
 * - Horizontal scroll is confined to the inner table container.
 */
function DataTable({
  data = [],
  height = 400,
  columnMinWidth = 120,
  containerMaxWidth = 900,
  exportData = null,
}) {
  const safeData = Array.isArray(data)
    ? data.filter((r) => r && typeof r === "object")
    : [];

  const firstRow = useMemo(
    () => safeData.find((r) => r && typeof r === "object") || null,
    [safeData]
  );
  const columns = useMemo(
    () => (firstRow ? Object.keys(firstRow) : []),
    [firstRow]
  );
  useMemo(() => detectColumnTypes(safeData), [safeData]);

  if (!safeData.length || !columns.length) return null;

  // total minimum table width based on columns (cap it to avoid extreme sizes)
  const calculatedMin = columns.length * columnMinWidth;
  const tableMinWidth = Math.max(calculatedMin, 600);

  const exportTarget =
    Array.isArray(exportData) && exportData.length ? exportData : safeData;

  return (
    // Constrain the preview area so the page won't scroll left-right
    <div
      className="bg-white rounded-lg shadow-md p-4"
      style={{
        overflowX: "hidden",
        width: "100%",
        maxWidth: containerMaxWidth, // <- limit preview width
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 600 }}>Dataset Preview</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => exportToCSV(exportTarget, "filtered-data.csv")}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            title="Export filtered dataset as CSV"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportToJSON(exportTarget, "filtered-data.json")}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
            title="Export filtered dataset as JSON"
          >
            Export JSON
          </button>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Showing {safeData.length} rows · {columns.length} columns
          </div>
        </div>
      </div>

      {/* horizontal scroll container (constrained to containerMaxWidth) */}
      <div
        style={{
          width: "100%",
          overflowX: "auto", // horizontal scroll confined here
          border: "1px solid #e6e6e6",
          borderRadius: 6,
        }}
      >
        {/* vertical scroll area for rows */}
        <div style={{ maxHeight: height, overflowY: "auto", width: "100%" }}>
          <table
            style={{
              minWidth: tableMinWidth, // can exceed container and cause inner scrollbar
              borderCollapse: "separate",
              width: "auto", // allow overflow
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#ffffff",
                      borderBottom: "1px solid #eef2f7",
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: 13,
                      color: "#374151",
                      textTransform: "capitalize",
                      minWidth: columnMinWidth,
                      maxWidth: columnMinWidth,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    background: rowIndex % 2 === 0 ? "#ffffff" : "#fbfbfb",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  {columns.map((col) => {
                    const cell = row[col];
                    const text =
                      cell === null || cell === undefined
                        ? ""
                        : typeof cell === "object"
                        ? JSON.stringify(cell)
                        : String(cell);
                    return (
                      <td
                        key={`${rowIndex}-${col}`}
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#4b5563",
                          maxWidth: columnMinWidth,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={text}
                      >
                        {text}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default React.memo(DataTable);
