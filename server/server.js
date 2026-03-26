const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const PORT = process.env.PORT || 6767;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

process.on("exit", (code) => {
  console.log("Process exiting with code:", code);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
