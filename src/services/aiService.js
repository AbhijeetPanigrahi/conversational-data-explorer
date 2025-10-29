// This service handles interactions with the Gemini API
// import { queryGemini, mockQueryGemini } from "../services/aiService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState } from "react";

// Initialize the Gemini API with the key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // We'll set this in .env.local
const genAI = new GoogleGenerativeAI(API_KEY);

export const queryGemini = async (prompt, data) => {
  try {
    // For safety, limit the amount of data sent to the API
    const sourceData = Array.isArray(data) ? data : [];
    const limitedData = sourceData.slice(0, 100);

    // Convert data to a string format that Gemini can process
    const dataString = JSON.stringify(limitedData, null, 2);

    // Create the full prompt with the data context
    const fullPrompt = `${prompt}\n\nData Context:\n${dataString}`;

    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error querying Gemini:", error);
    throw error;
  }
};

// For demo/development without an API key
export const mockQueryGemini = async (prompt, data) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Ensure data is a usable array
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return "I need some rows to analyze. Please upload data first.";
  }

  const lowerPrompt = prompt.toLowerCase();

  // Simple pattern matching for demo purposes
  if (lowerPrompt.includes("average") || lowerPrompt.includes("mean")) {
    // Find numeric columns to calculate average
    const numericColumns = Object.keys(rows[0]).filter((key) => {
      return !isNaN(parseFloat(rows[0][key]));
    });

    if (numericColumns.length === 0) {
      return "I couldn't find any numeric columns to calculate the average.";
    }

    // Use the first numeric column as a fallback
    let targetColumn = numericColumns[0];

    // Try to find a more specific column based on the prompt
    for (const column of Object.keys(rows[0])) {
      if (lowerPrompt.includes(column.toLowerCase())) {
        targetColumn = column;
        break;
      }
    }

    // Calculate average
    const sum = rows.reduce(
      (acc, row) => acc + parseFloat(row[targetColumn] || 0),
      0
    );
    const average = sum / rows.length;

    return `The average ${targetColumn} is ${average.toFixed(2)}.`;
  }

  // Simple pattern matching for "email address of [name]"
  const emailMatch = prompt.match(/email address of (.+)/i);
  if (emailMatch && rows.length > 0) {
    const name = emailMatch[1].trim().toLowerCase();
    const user = rows.find(
      (row) => row.name && row.name.toLowerCase() === name
    );
    if (user && user.email) {
      return `The email address of ${user.name} is ${user.email}.`;
    } else {
      return `I couldn't find an email address for ${emailMatch[1]}.`;
    }
  }

  // Default response
  return "I'm not sure how to answer that question with the current data. Try asking about averages, maximums, or specific patterns in your data.";
};

const ChatInterface = ({ data }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const useMock = !process.env.REACT_APP_GEMINI_API_KEY;

  //  Message Handler
  const handleSend = async () => {
    if (!input.trim()) return; // This prevents empty or all-whitespace messages from being sent, a basic form validation.
    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);

    // Call Gemini or mock based on API key
    let answer;
    try {
      answer = await (useMock ? mockQueryGemini : queryGemini)(input, data);
    } catch (err) {
      answer = "Sorry, there was an error processing your question.";
    }

    setMessages((msgs) => [...msgs, { sender: "ai", text: answer }]);
    setInput("");
  };

  return (
    <div>
      <div style={{ minHeight: 200, border: "1px solid #ccc", padding: 10 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{ textAlign: msg.sender === "user" ? "right" : "left" }}
          >
            <b>{msg.sender === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask anything about your data..."
        style={{ width: "80%", marginRight: 8 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInterface;

// Do not include any top-level await or logic here.
// Use queryGemini or mockQueryGemini in your component or handler as needed
