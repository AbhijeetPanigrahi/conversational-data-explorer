import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  profileData,
  selectChartType,
  aggregateData,
} from "../services/chartService";
import AutoChart from "./AutoChart";

/**
 * ChartBuilder props:
 *  - data: filteredData (array)
 *  - onUseInChat: optional callback to send chart summary to chat
 */
function ChartBuilder({ data = [], onUseInChat }) {
  const [profile, setProfile] = useState({});
  const [suggestion, setSuggestion] = useState(null);
  const [config, setConfig] = useState(null);
  const [aggregated, setAggregated] = useState(null);
  const [topN, setTopN] = useState(10);

  // prevents automatic suggestion from overwriting user edits
  const [userEdited, setUserEdited] = useState(false);

  // track last dataset signature so we only auto-reset when the dataset actually changes
  const prevSignatureRef = useRef(null);

  // build profile and initial suggestion when data changes (but only if dataset actually changed)
  useEffect(() => {
    const p = profileData(data);
    setProfile(p);
    const s = selectChartType({}, p);
    setSuggestion(s);

    // Signature: row count + column keys — cheap heuristic to detect a real dataset change
    const signature = `${Array.isArray(data) ? data.length : 0}|${Object.keys(p)
      .sort()
      .join(",")}`;

    if (prevSignatureRef.current !== signature) {
      // real dataset change -> reset auto suggestion (user edits shouldn't persist across distinct datasets)
      prevSignatureRef.current = signature;
      setUserEdited(false);
      setConfig(s);
      setTopN(s.topN || 10);
    } else {
      // same dataset (only parent re-rendered) -> do not overwrite user edits / current config
      // keep existing config and userEdited state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // re-aggregate whenever config/topN/data changes
  useEffect(() => {
    if (!config) return;
    const agg = aggregateData(data, { ...config, topN });
    setAggregated(agg);
  }, [config, data, topN]);

  const columns = useMemo(() => Object.keys(profile || {}), [profile]);

  const applyAuto = () => {
    const s = selectChartType({}, profile);
    setSuggestion(s);
    setConfig(s);
    setTopN(s.topN || 10);
    setUserEdited(false);
  };

  if (!data || data.length === 0) return null;

  // helpers to update config and mark user-edited so autosuggestions don't override
  const updateConfig = (updater) => {
    setConfig((prev) => {
      const next =
        typeof updater === "function"
          ? updater(prev || {})
          : { ...(prev || {}), ...updater };
      return next;
    });
    setUserEdited(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Smart Visualization</h3>
          <p className="text-sm text-gray-500 mt-1">
            Auto-selected chart based on the data profile. Tweak settings if
            needed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={applyAuto}
            className="px-3 py-1 bg-gray-100 rounded text-sm"
          >
            Auto
          </button>
          <button
            onClick={() => onUseInChat && onUseInChat(config, aggregated)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Use in chat
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Chart type</label>
          <select
            value={config?.chartType || ""}
            onChange={(e) => updateConfig({ chartType: e.target.value })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="scatter">Scatter</option>
            <option value="histogram">Histogram</option>
            <option value="table">Table</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            X / group-by
          </label>
          <select
            value={config?.x || ""}
            onChange={(e) => updateConfig({ x: e.target.value || null })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">(none)</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Y / metric</label>
          <select
            value={config?.y || ""}
            onChange={(e) => updateConfig({ y: e.target.value || null })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">(count)</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div>
          <label className="text-sm text-gray-600">Aggregation</label>
          <select
            value={config?.aggregation || "count"}
            onChange={(e) => updateConfig({ aggregation: e.target.value })}
            className="ml-2 border rounded px-2 py-1 text-sm"
          >
            <option value="count">count</option>
            <option value="sum">sum</option>
            <option value="avg">avg</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Top N</label>
          <input
            type="number"
            value={topN}
            onChange={(e) => setTopN(Math.max(1, Number(e.target.value || 1)))}
            className="ml-2 border rounded px-2 py-1 w-20 text-sm"
          />
        </div>

        <div className="ml-auto text-sm text-gray-500">
          Suggested: <strong>{suggestion?.chartType || "table"}</strong>
        </div>
      </div>

      <div className="mt-4">
        <AutoChart
          chartType={config?.chartType}
          data={aggregated}
          xLabel={config?.x}
          yLabel={config?.y}
        />
      </div>
    </div>
  );
}

export default ChartBuilder;
