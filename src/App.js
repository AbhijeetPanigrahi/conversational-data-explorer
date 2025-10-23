import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ChatInterface from "./components/ChatInterface";
import { mockQueryGemini } from "./services/aiService"; // Updated import
import {
  saveDataToLocalStorage,
  loadDataFromLocalStorage,
  cacheQueryResult,
  getCachedQueryResult,
} from "./services/dataService";

function App() {
  const [data, setData] = useState(null);

  // Load data from local storage on initial render
  useEffect(() => {
    const savedData = loadDataFromLocalStorage();
    if (savedData) {
      setData(savedData);
    }
  }, []);

  const handleDataLoaded = (newData) => {
    setData(newData);
    saveDataToLocalStorage(newData);
  };

  const handleQueryData = async (query, currentData) => {
    // Check cache first
    const cachedResult = getCachedQueryResult(query);
    if (cachedResult) {
      return cachedResult;
    }

    // If not in cache, query the AI
    // Using the mock implementation for now
    const result = await mockQueryGemini(query, currentData);

    // Cache the result
    cacheQueryResult(query, result);

    return result;
  };

  const handleDeleteData = () => {
    setData([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
          <div className="lg:col-span-2">
            {data ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    Dataset Preview
                  </h2>
                  <button
                    onClick={handleDeleteData}
                    style={{
                      background: "#e53e3e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete Data
                  </button>
                </div>
                <DataTable data={data} />
                <ChatInterface data={data} onQueryData={handleQueryData} />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome to Conversational Data Explorer
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload a dataset (CSV or JSON) to start exploring your data
                  through natural language questions.
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 text-blue-500 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
