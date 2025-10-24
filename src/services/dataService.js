// This service handles data operations and caching

// Cache for storing previous query results
const queryCache = new Map();

// Save data to local storage
export const saveDataToLocalStorage = (data) => {
  try {
    // Only store a limited amount to avoid storage limits
    const dataToStore = data.slice(0, 1000);
    localStorage.setItem("explorerData", JSON.stringify(dataToStore));
    return true;
  } catch (error) {
    console.error("Error saving data to local storage:", error);
    return false;
  }
};

// Load data from local storage
export const loadDataFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("explorerData");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading data from local storage:", error);
    return null;
  }
};

// Cache a query result
/*
The function cacheQueryResult takes two arguments:
query: The search term or string used to generate the result (e.g., "search term").
result: The actual data or object retrieved from the query (e.g., a list of search results).

purpose: cache (store temporarily) the outcome of a query to prevent 
re-running the same expensive operation if the query is made again soon.
*/
export const cacheQueryResult = (query, result) => {
  queryCache.set(query.toLowerCase(), {
    result,
    timestamp: Date.now(),
  });

  // Limit cache size
  if (queryCache.size > 50) {
    // Remove oldest entry
    const oldestKey = [...queryCache.keys()][0];
    queryCache.delete(oldestKey);
  }
};

// Get a cached query result if available and not expired
export const getCachedQueryResult = (query) => {
  const cacheEntry = queryCache.get(query.toLowerCase());

  if (!cacheEntry) return null;

  // Check if cache is expired (30 minutes)
  const isExpired = Date.now() - cacheEntry.timestamp > 30 * 60 * 1000;

  return isExpired ? null : cacheEntry.result;
};

// Generate query suggestions based on data structure
export const generateQuerySuggestions = (data) => {
  if (!data || data.length === 0) return [];

  const columns = Object.keys(data[0]);
  const suggestions = [];

  // Add general suggestions
  suggestions.push("What is the average of all numeric values?");
  suggestions.push("Show me the highest and lowest values");

  // Add column-specific suggestions
  columns.forEach((column) => {
    suggestions.push(`What is the average ${column}?`);
    suggestions.push(`What is the highest ${column}?`);
  });

  // Add time-based suggestions if date columns exist
  const dateColumns = columns.filter(
    (col) =>
      col.toLowerCase().includes("date") || col.toLowerCase().includes("time")
  );

  if (dateColumns.length > 0) {
    suggestions.push("How has the data changed over time?");
    suggestions.push(`What's the trend for the most recent period?`);
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
};
