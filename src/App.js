import React, { useMemo, useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ChatInterface from "./components/ChatInterface";
import Filters from "./components/Filters";
import { applyFilters } from "./utils/filterUtils";
import { detectColumnTypes } from "./utils/helpers";
import { saveDataToLocalStorage } from "./services/dataService";

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("explorerData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("cdfilters");
      return saved ? JSON.parse(saved) : { globalSearch: "", columns: {} };
    } catch {
      return { globalSearch: "", columns: {} };
    }
  });

  // preview controls
  const DEFAULT_PREVIEW = 50;
  const [previewLimit, setPreviewLimit] = useState(DEFAULT_PREVIEW);
  const [showAll, setShowAll] = useState(false);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const colNames = Object.keys(data[0]);
    const types = detectColumnTypes(data);
    return colNames.map((name) => ({ name, type: types[name] || "string" }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    return applyFilters(data, filters);
  }, [data, filters]);

  // determine which slice to send to DataTable:
  const tableData = useMemo(() => {
    if (!filteredData) return [];
    return showAll ? filteredData : filteredData.slice(0, previewLimit);
  }, [filteredData, previewLimit, showAll]);

  const handleDataLoaded = (newData) => {
    setData(newData);
    saveDataToLocalStorage(newData);
    // reset preview
    setPreviewLimit(DEFAULT_PREVIEW);
    setShowAll(false);
  };

  const handleDeleteData = () => {
    setData(null);
    saveDataToLocalStorage([]);
  };

  const canLoadMore = filteredData && previewLimit < filteredData.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar assumed present */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <FileUpload onDataLoaded={handleDataLoaded} />
            {/* Filters */}
            {data && (
              <Filters
                columns={columns}
                initialFilters={filters}
                onChange={(f) => setFilters(f)}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              {data ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <h2 className="text-xl font-semibold">Dataset Preview</h2>
                    <div>
                      <span className="mr-4 text-sm text-gray-600">
                        Showing {tableData.length} /{" "}
                        {filteredData ? filteredData.length : 0} rows
                      </span>
                      <button
                        onClick={handleDeleteData}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Delete Data
                      </button>
                    </div>
                  </div>

                  <DataTable
                    data={tableData}
                    height={360}
                    columnMinWidth={120}
                    exportData={filteredData}
                  />

                  <div className="mt-3 flex items-center gap-3">
                    {!showAll && canLoadMore && (
                      <button
                        onClick={() =>
                          setPreviewLimit((p) =>
                            Math.min(
                              (p || DEFAULT_PREVIEW) + DEFAULT_PREVIEW,
                              filteredData.length
                            )
                          )
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Load more
                      </button>
                    )}

                    <button
                      onClick={() => setShowAll((s) => !s)}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      {showAll ? "Show preview" : "Show all"}
                    </button>
                  </div>

                  {/* Chat moved below the data preview */}
                  <div className="mt-6">
                    <ChatInterface data={filteredData || []} />
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="text-lg font-medium">Upload data to begin</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
