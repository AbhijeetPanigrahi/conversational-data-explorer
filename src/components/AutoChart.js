// ...new file...
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#6366f1",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

function AutoChart({ chartType, data, xLabel, yLabel }) {
  if (!data) return null;

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="y" fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="y"
            stroke={COLORS[0]}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="y"
            stroke={COLORS[0]}
            fill={COLORS[0]}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Tooltip />
          <Pie data={data} dataKey="y" nameKey="x" outerRadius={120} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey="x" name={xLabel || "x"} />
          <YAxis dataKey="y" name={yLabel || "y"} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill={COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "histogram") {
    // data is raw number array; convert to simple bins
    const values = Array.isArray(data) ? data : [];
    if (values.length === 0)
      return <div className="p-4">No numeric data for histogram</div>;
    const buckets = 12;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = (max - min) / buckets || 1;
    const bins = new Array(buckets).fill(0).map((_, i) => {
      const lo = min + i * width;
      const hi = lo + width;
      const count = values.filter((v) => v >= lo && v < hi).length;
      return {
        x: `${Number(lo).toFixed(2)}-${Number(hi).toFixed(2)}`,
        y: count,
      };
    });
    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="y" fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // fallback: simple table-like list
  return (
    <div className="p-3">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-2 py-1">x</th>
            <th className="text-left px-2 py-1">y</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) &&
            data.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1">{String(row.x)}</td>
                <td className="px-2 py-1">{String(row.y)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default AutoChart;
