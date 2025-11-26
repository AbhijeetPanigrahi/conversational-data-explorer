# Conversational Data Explorer

A modern, interactive web app for exploring, filtering, visualizing, and chatting with tabular datasets.  
Built with React, Tailwind CSS, and Recharts, it enables users to upload data, apply filters, preview results, generate intelligent charts, and ask questions, all in a sleek, user-friendly interface.

---

## Features

- **File Upload:** Import CSV or JSON datasets for instant exploration.
- **Data Preview:** Scrollable, responsive table view with horizontal and vertical scroll for wide/large datasets.
- **Filtering & Search:** Apply column filters and global search; see active filters as removable chips.
- **Export:** Download filtered data as CSV or JSON; export chat transcript as TXT or JSON.
- **Conversational Chat:** Ask questions about your data and get AI-powered answers using Gemini API.
- **Intelligent Visualization:** Zero-config charting automatically suggests the best chart type (bar, line, pie, scatter, histogram, table) based on your data and question.
- **Interactive Chart Controls:** Change chart type, group-by, metric, aggregation, and top-N directly from the UI.
- **Modern UI/UX:** Responsive layout, sticky headers, tooltips, and sleek card design.

---

## User Flow

1. **Upload Data**

   - Click "Upload" and select a CSV or JSON file.
   - The app parses and previews your data in a scrollable table.

2. **Filter & Search**

   - Use the filter panel to set column filters (number ranges, text search, date ranges).
   - Enter keywords in the global search box to filter across all columns.
   - Active filters appear as chips; remove or clear all with one click.

3. **Preview & Export**

   - View the filtered data in the preview table.
   - Export the current filtered dataset as CSV or JSON using the export buttons.

4. **Visualize**

   - The app automatically suggests a chart based on your data (e.g., bar chart for counts by category).
   - Use the chart controls to change chart type, group-by column, metric, aggregation, or top-N.
   - Export the chart data or image if needed.

5. **Chat with Your Data**

   - Ask questions in natural language (e.g., "Show customer count by region").
   - The AI answers using the filtered dataset context.
   - Export the chat transcript for sharing or record-keeping.

6. **Iterate**
   - Refine filters, change chart settings, or ask follow-up questions.
   - All actions update instantly; no page reloads required.

---

## Setup & Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/conversational-data-explorer.git
   cd conversational-data-explorer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   - Create a `.env` file (not committed to GitHub).
   - Add your Gemini API key if using AI chat:
     ```
     REACT_APP_GEMINI_API_KEY=your-key-here
     ```

4. **Start the development server**
   ```bash
   npm start
   ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

[MIT](LICENSE) (add a LICENSE file if you wish to open source)

---

## Contributing

Pull requests and issues are welcome!  
Please open an issue for feature requests or bug reports.

---

## Acknowledgements

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Gemini API](https://ai.google.dev/gemini)
