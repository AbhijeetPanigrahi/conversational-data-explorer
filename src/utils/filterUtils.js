// applyFilters(data, filters) => filtered array
export function applyFilters(
  data = [],
  filters = { globalSearch: "", columns: {} }
) {
  const { globalSearch = "", columns = {} } = filters || {};
  const g = String(globalSearch || "")
    .trim()
    .toLowerCase();

  if (!Array.isArray(data) || data.length === 0) return [];

  // remove null/undefined / non-object rows to avoid Object.values errors
  const cleanData = data.filter((row) => row && typeof row === "object");

  return cleanData.filter((row) => {
    // global search across all columns
    if (g) {
      // guard Object.values usage
      const vals = Object.values(row || {});
      const matchGlobal = vals.some((val) => {
        if (val === null || val === undefined) return false;
        const s = typeof val === "object" ? JSON.stringify(val) : String(val);
        return s.toLowerCase().includes(g);
      });
      if (!matchGlobal) return false;
    }

    // per-column filters
    const colEntries = Object.entries(columns || {});
    for (const [col, f] of colEntries) {
      if (!f) continue;
      const val = row ? row[col] : undefined;

      // numeric range
      if (f.min !== undefined || f.max !== undefined) {
        const num = Number(val);
        if (Number.isNaN(num)) return false;
        if (f.min !== undefined && num < f.min) return false;
        if (f.max !== undefined && num > f.max) return false;
      }
      // date range
      if (f.start || f.end) {
        const d = new Date(val);
        if (isNaN(d)) return false;
        if (f.start && d < new Date(f.start)) return false;
        if (f.end && d > new Date(f.end)) return false;
      }
      // multi-select (values array)
      if (f.values && Array.isArray(f.values)) {
        if (!f.values.includes(String(val))) return false;
      }
      // text contains / equals
      if (f.value) {
        const s = String(val ?? "").toLowerCase();
        const v = String(f.value).toLowerCase();
        if (f.op === "equals" && s !== v) return false;
        if (f.op === "contains" && !s.includes(v)) return false;
      }
    }

    return true;
  });
}
