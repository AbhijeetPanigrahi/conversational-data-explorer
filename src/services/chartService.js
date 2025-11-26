// ...new file...
import { detectColumnTypes } from "../utils/helpers";

/**
 * profileData(data)
 * returns metadata per column: { name, type, nonNullCount, uniqueCount, sample }
 */
export function profileData(data = [], sampleSize = 500) {
  const arr = Array.isArray(data)
    ? data.filter((r) => r && typeof r === "object")
    : [];
  const sample = arr.slice(0, sampleSize);
  const types = detectColumnTypes(arr);
  const result = {};

  const keys = Array.from(
    new Set(sample.flatMap((r) => (r ? Object.keys(r) : [])))
  );

  keys.forEach((k) => {
    const values = sample
      .map((r) => r[k])
      .filter((v) => v !== null && v !== undefined);
    const unique = Array.from(
      new Set(
        values.map((v) =>
          typeof v === "object" ? JSON.stringify(v) : String(v)
        )
      )
    );
    const nonNullCount = values.length;
    const typeHint = types[k] || inferTypeFromValues(values);
    const numericValues = values
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
    const min = numericValues.length ? Math.min(...numericValues) : undefined;
    const max = numericValues.length ? Math.max(...numericValues) : undefined;

    result[k] = {
      name: k,
      type: typeHint,
      nonNullCount,
      uniqueCount: unique.length,
      example: values.slice(0, 5),
      min,
      max,
    };
  });

  return result;
}

function inferTypeFromValues(values = []) {
  if (!values || values.length === 0) return "string";
  const numericCount = values.filter((v) => !Number.isNaN(Number(v))).length;
  const dateCount = values.filter(
    (v) => !Number.isNaN(new Date(v).getTime())
  ).length;
  if (dateCount / values.length > 0.6) return "date";
  if (numericCount / values.length > 0.6) return "number";
  return "string";
}

/**
 * selectChartType(intent, profile)
 * intent: { metric?, groupBy?, hints? }  -- optional
 * profile: output of profileData
 *
 * Returns suggested chartType and a proposed config: { chartType, x, y, aggregation, topN }
 */
export function selectChartType(intent = {}, profile = {}) {
  const columns = Object.keys(profile);
  // try to respect intent
  const metric = intent.metric || null;
  const groupBy = intent.groupBy || null;
  const hints = (intent.hints || []).map((h) => h.toLowerCase());

  // heuristic helpers
  const isDate = (col) => profile[col] && profile[col].type === "date";
  const isNumeric = (col) => profile[col] && profile[col].type === "number";
  const cardinality = (col) =>
    profile[col] ? profile[col].uniqueCount || 0 : 0;

  // if explicit two numeric columns -> scatter
  if (intent.x && intent.y && isNumeric(intent.x) && isNumeric(intent.y)) {
    return {
      chartType: "scatter",
      x: intent.x,
      y: intent.y,
      aggregation: null,
      topN: null,
    };
  }

  // time series: group-by date OR hint contains time
  if (groupBy && isDate(groupBy)) {
    // metric fallback: choose first numeric column or count
    const y = metric || columns.find((c) => isNumeric(c));
    return {
      chartType: "line",
      x: groupBy,
      y: y || null,
      aggregation: y ? "sum" : "count",
      topN: null,
    };
  }
  if (
    hints.some((h) =>
      ["month", "day", "year", "week", "time", "trend"].includes(h)
    )
  ) {
    const dateCol = columns.find((c) => isDate(c));
    if (dateCol) {
      const y = metric || columns.find((c) => isNumeric(c));
      return {
        chartType: "line",
        x: dateCol,
        y: y || null,
        aggregation: y ? "sum" : "count",
        topN: null,
      };
    }
  }

  // categorical aggregation -> bar
  if (groupBy && !isNumeric(groupBy) && cardinality(groupBy) <= 50) {
    const y = metric || null;
    return {
      chartType: "bar",
      x: groupBy,
      y: y,
      aggregation: y ? "sum" : "count",
      topN: 10,
    };
  }

  // pie: very low-cardinality categorical
  if (groupBy && cardinality(groupBy) > 0 && cardinality(groupBy) <= 6) {
    return {
      chartType: "pie",
      x: groupBy,
      y: metric || null,
      aggregation: metric ? "sum" : "count",
      topN: null,
    };
  }

  // histogram: single numeric intent or hint "distribution"
  if (
    (intent.column && isNumeric(intent.column)) ||
    hints.includes("distribution")
  ) {
    const col = intent.column || columns.find((c) => isNumeric(c));
    return {
      chartType: "histogram",
      x: col,
      y: null,
      aggregation: null,
      topN: null,
    };
  }

  // fallback: choose bar with top categorical column if exists
  const cat = columns.find(
    (c) => profile[c].type === "string" && profile[c].uniqueCount <= 50
  );
  if (cat)
    return {
      chartType: "bar",
      x: cat,
      y: metric || null,
      aggregation: metric ? "sum" : "count",
      topN: 10,
    };

  // last resort: table
  return {
    chartType: "table",
    x: null,
    y: null,
    aggregation: null,
    topN: null,
  };
}

/**
 * aggregateData(data, config)
 * config: { chartType, x, y, aggregation, topN }
 * returns array of { x, y } or specialized for chart type
 */
export function aggregateData(data = [], config = {}) {
  const { chartType, x, y, aggregation = "count", topN } = config;
  const rows = Array.isArray(data)
    ? data.filter((r) => r && typeof r === "object")
    : [];

  if (chartType === "table") return rows;

  if (chartType === "histogram") {
    // return raw numeric values for histogram
    const col = x;
    const values = rows
      .map((r) => r[col])
      .filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)))
      .map(Number);
    return values;
  }

  // group and aggregate
  const map = new Map();
  const keyFn = (r) => {
    const v = r ? r[x] : undefined;
    // normalize date strings to date-only if date type
    return v === undefined || v === null ? "__NULL__" : String(v);
  };

  rows.forEach((r) => {
    const k = keyFn(r);
    const prev = map.get(k) || { key: k, count: 0, sum: 0 };
    prev.count += 1;
    const val = y && r[y] !== undefined && r[y] !== null ? Number(r[y]) : 0;
    prev.sum += Number.isFinite(val) ? val : 0;
    map.set(k, prev);
  });

  let items = Array.from(map.values()).map((it) => {
    const value =
      aggregation === "sum"
        ? it.sum
        : aggregation === "avg"
        ? it.count
          ? it.sum / it.count
          : 0
        : it.count;
    return {
      x: it.key === "__NULL__" ? null : it.key,
      y: value,
      count: it.count,
      sum: it.sum,
    };
  });

  // sort descending for bar/pie
  items.sort((a, b) => b.y - a.y);

  // topN
  if (topN && items.length > topN) {
    const top = items.slice(0, topN);
    const other = items.slice(topN).reduce(
      (acc, cur) => {
        acc.y += cur.y;
        acc.count += cur.count;
        acc.sum += cur.sum;
        return acc;
      },
      { x: "Other", y: 0, count: 0, sum: 0 }
    );
    items = [...top, other];
  }

  return items;
}
