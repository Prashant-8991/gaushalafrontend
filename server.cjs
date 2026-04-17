const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;
const DIST = path.join(__dirname, "dist"); // or build

// Serve static files
app.use(express.static(DIST));

// ✅ Express 5 SPA fallback (THIS WORKS)
app.use((req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`React app running on http://localhost:${PORT}`);
});