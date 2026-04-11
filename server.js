const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Home page - MolCal is the default
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "molcal", "index.html"));
});

// Structure to Molecular Weight
app.get("/mw-calc", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mw-calc", "index.html"));
});

// TLC Simulator
app.get("/tlc-sim", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tlc-sim", "index.html"));
});

// API - ping
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "MolCal server is alive" });
});

app.listen(PORT, () => {
  console.log(`MolCal Suite running at http://localhost:${PORT}`);
  console.log(`  Home: http://localhost:${PORT}/`);
  console.log(`  MolCal: http://localhost:${PORT}/molcal`);
  console.log(`  MW Calculator: http://localhost:${PORT}/mw-calc`);
  console.log(`  TLC Simulator: http://localhost:${PORT}/tlc-sim`);
});
