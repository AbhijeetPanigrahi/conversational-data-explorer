import React from "react";

function DataTable({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Get column headers from the first data item
  const columns = Object.keys(data[0]);

  /*
  Two levels of .map():
  - One for columns in header
  - One for rows and cells in body
  */
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">Dataset Preview</h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 100).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[column]?.toString() || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 100 && (
        <p className="text-sm text-gray-500 mt-2">
          Showing first 100 rows of {data.length} total rows
        </p>
      )}
    </div>
  );
}

export default DataTable;
