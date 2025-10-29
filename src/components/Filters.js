import React, { useEffect, useMemo, useState, useRef } from "react";

/**
 * Filters component
 * Props:
 *  - columns: [{ name, type }]
 *  - initialFilters: { globalSearch, columns }
 *  - onChange: (filters) => void
 */
function Filters({ columns = [], initialFilters = {}, onChange }) {
  // Local state for the controlled UI
  const [globalSearch, setGlobalSearch] = useState(
    initialFilters.globalSearch || ""
  );
  const [columnFilters, setColumnFilters] = useState(
    initialFilters.columns || {}
  );

  // Track mount so we only sync initialFilters once
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      // initialize only on first mount
      setGlobalSearch(initialFilters.globalSearch || "");
      setColumnFilters(initialFilters.columns || {});
      didMountRef.current = true;
    }
    // intentionally do NOT re-run when initialFilters changes to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce onChange + localStorage writes to avoid rapid parent updates and flicker
  useEffect(() => {
    const payload = { globalSearch, columns: columnFilters };
    const id = setTimeout(() => {
      try {
        localStorage.setItem("cdfilters", JSON.stringify(payload));
      } catch (e) {
        // ignore storage errors
      }
      onChange?.(payload);
    }, 300); // debounce 300ms

    return () => clearTimeout(id);
  }, [globalSearch, columnFilters, onChange]);

  const handleClear = () => {
    setGlobalSearch("");
    setColumnFilters({});
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-sm mb-4">
      <div className="flex gap-2 items-center">
        <input
          aria-label="Global search"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search across all columns..."
          className="flex-1 border px-2 py-1 rounded"
        />
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-red-500 text-white rounded"
          title="Clear all filters"
        >
          Clear
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {columns.map((col) => (
          <ColumnFilter
            key={col.name}
            column={col}
            value={columnFilters[col.name]}
            onChange={(val) =>
              setColumnFilters((prev) => {
                if (!val) {
                  const next = { ...prev };
                  delete next[col.name];
                  return next;
                }
                return { ...prev, [col.name]: val };
              })
            }
          />
        ))}
      </div>

      <ActiveFiltersBar
        filters={{ globalSearch, columns: columnFilters }}
        onRemove={(colName) => {
          if (colName === "__global") setGlobalSearch("");
          else {
            setColumnFilters((prev) => {
              const next = { ...prev };
              delete next[colName];
              return next;
            });
          }
        }}
        onClearAll={handleClear}
      />
    </div>
  );
}

function ColumnFilter({ column, value, onChange }) {
  const type = column.type || "string";

  if (type === "number") {
    return (
      <div className="p-2 border rounded">
        <div className="text-sm font-medium">{column.name}</div>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            placeholder="min"
            value={(value && value.min) ?? ""}
            onChange={(e) =>
              onChange({
                ...(value || {}),
                min: e.target.value !== "" ? Number(e.target.value) : undefined,
              })
            }
            className="w-1/2 border px-2 py-1 rounded"
          />
          <input
            type="number"
            placeholder="max"
            value={(value && value.max) ?? ""}
            onChange={(e) =>
              onChange({
                ...(value || {}),
                max: e.target.value !== "" ? Number(e.target.value) : undefined,
              })
            }
            className="w-1/2 border px-2 py-1 rounded"
          />
        </div>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="p-2 border rounded">
        <div className="text-sm font-medium">{column.name}</div>
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            value={(value && value.start) || ""}
            onChange={(e) =>
              onChange({ ...(value || {}), start: e.target.value })
            }
            className="w-1/2 border px-2 py-1 rounded"
          />
          <input
            type="date"
            value={(value && value.end) || ""}
            onChange={(e) =>
              onChange({ ...(value || {}), end: e.target.value })
            }
            className="w-1/2 border px-2 py-1 rounded"
          />
        </div>
      </div>
    );
  }

  // default text filter
  return (
    <div className="p-2 border rounded">
      <div className="text-sm font-medium">{column.name}</div>
      <input
        type="text"
        placeholder={`Filter ${column.name}`}
        value={(value && value.value) || ""}
        onChange={(e) =>
          onChange(
            e.target.value
              ? { op: "contains", value: e.target.value }
              : undefined
          )
        }
        className="w-full border px-2 py-1 rounded mt-2"
      />
    </div>
  );
}

function ActiveFiltersBar({ filters = {}, onRemove, onClearAll }) {
  const chips = [];
  const globalSearch = filters.globalSearch || "";
  const colsObj = filters && filters.columns ? filters.columns : {};

  if (globalSearch)
    chips.push({ key: "__global", label: `Search: ${globalSearch}` });

  Object.entries(colsObj).forEach(([k, v]) => {
    let label = `${k}: `;
    if (v && (v.min !== undefined || v.max !== undefined))
      label += `${v.min ?? "-"} - ${v.max ?? "-"}`;
    else if (v && (v.start || v.end))
      label += `${v.start ?? "-"} ↦ ${v.end ?? "-"}`;
    else if (v && v.values) label += v.values.join(", ");
    else label += (v && v.value) ?? JSON.stringify(v);
    chips.push({ key: k, label });
  });

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      {chips.map((c) => (
        <div
          key={c.key}
          className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2"
        >
          <span className="text-sm">{c.label}</span>
          <button
            className="text-xs text-red-500"
            onClick={() => onRemove(c.key === "__global" ? "__global" : c.key)}
          >
            ×
          </button>
        </div>
      ))}
      <button className="ml-auto text-sm text-blue-600" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
}

export default Filters;
