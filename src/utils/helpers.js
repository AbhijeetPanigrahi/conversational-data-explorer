// Helper functions for the application

// Format date strings consistently
export const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

// Detect if a string might be a date
export const isDateString = (str) => {
  if (!str || typeof str !== "string") return false;

  // Check for common date formats
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{1,2} [a-zA-Z]{3} \d{4}$/, // D MMM YYYY
  ];

  return datePatterns.some((pattern) => pattern.test(str));
};

// Detect column types from data
export const detectColumnTypes = (data) => {
  if (!data || data.length === 0) return {};

  const sampleRow = data[0];
  const columnTypes = {};

  Object.keys(sampleRow).forEach((column) => {
    const value = sampleRow[column];

    if (typeof value === "number") {
      columnTypes[column] = "number";
    } else if (isDateString(value)) {
      columnTypes[column] = "date";
    } else if (typeof value === "boolean") {
      columnTypes[column] = "boolean";
    } else {
      columnTypes[column] = "string";
    }
  });

  return columnTypes;
};

// Truncate long strings for display
export const truncateString = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

// Generate a simple hash for caching
export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char; // Shifts the current hash value 5 bits to the left
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16); // converting to hexadecimal
};
