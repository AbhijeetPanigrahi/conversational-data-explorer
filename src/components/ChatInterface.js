import React, { useState, useRef, useEffect } from "react";
import { queryGemini, mockQueryGemini } from "../services/aiService";
import { detectColumnTypes, formatDate } from "../utils/helpers";

function ChatInterface({ data }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Determine whether to use the mock or real Gemini API
  const useMock = !process.env.REACT_APP_GEMINI_API_KEY;

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !data || data.length === 0) return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]); // Immediately adds the user's new message to the state array. The use of prev => [...] ensures immutability and that the update is based on the latest state.
    setInput("");
    setLoading(true);

    try {
      // Always use Gemini if API key is present, otherwise use mock
      const response = await (useMock ? mockQueryGemini : queryGemini)(
        input,
        data
      );

      const aiMessage = {
        text: response,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        text: `Error: ${error.message || "Failed to process your query"}`,
        sender: "ai",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Show API key status
  console.log("Gemini API Key:", process.env.REACT_APP_GEMINI_API_KEY);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex flex-col h-[500px]">
      <h2 className="text-lg font-semibold mb-4">
        Ask Questions About Your Data
      </h2>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Ask a question about your data!</p>
            <p className="text-sm mt-2">Examples:</p>
            <ul className="text-sm text-gray-600 mt-1">
              <li>"What is the average sales in Q1 2023?"</li>
              <li>"Which region had the highest revenue?"</li>
              <li>"Show me the trend of customer satisfaction over time"</li>
            </ul>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : message.isError
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data..."
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || !data || data.length === 0}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={loading || !input.trim() || !data || data.length === 0}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
