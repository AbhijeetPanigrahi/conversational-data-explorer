import React, { useState } from "react";
import Papa from "papaparse"; // a library for parsing CSV files in the browser.

function FileUpload({ onDataLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //  Processes file input events and File type validation adn parsing
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const fileExtension = file.name.split(".").pop().toLowerCase(); // The pop() method removes and returns the last element of an array.

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true, // tells Papa Parse to treat the first row of the CSV file as column headers
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            onDataLoaded(results.data);
          } else {
            setError("No data found in the CSV file");
          }
          setLoading(false);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setLoading(false);
        },
      });
    } else if (fileExtension === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data) && data.length > 0) {
            onDataLoaded(data); // Calls the data processing function with the parsed data.
          } else {
            setError("JSON file must contain an array of objects");
          }
        } catch (error) {
          setError(`Error parsing JSON: ${error.message}`);
        }
        setLoading(false);
      };
      // the follow executes if the browser's FileReader encounters a low-level error
      // (e.g., permission denied or file corruption).
      reader.onerror = () => {
        setError("Error reading file");
        setLoading(false);
      };
      reader.readAsText(file); // Starts the asynchronous reading process. This triggers the onload or onerror events upon completion.
    } else if (["xls", "xlsx"].includes(fileExtension)) {
      setError(
        "Excel files are not supported in this demo. Please convert to CSV or JSON."
      );
      setLoading(false);
    } else {
      setError("Unsupported file format. Please upload CSV or JSON files.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload Your Dataset</h2>
      <div className="flex flex-col space-y-4">
        <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm font-medium">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-500 mt-1">
            CSV, JSON files supported
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv,.json"
            onChange={handleFileUpload}
          />
        </label>

        {loading && <p className="text-gray-600">Loading data...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default FileUpload;
