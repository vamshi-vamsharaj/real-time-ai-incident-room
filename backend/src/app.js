import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import errorHandler from "./shared/middleware/errorHandler.js";


const app = express();


app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────
// Used to verify the server is running without hitting DB.
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Incident Room API is running",
    timestamp: new Date().toISOString(),
  });
});


// ── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

export default app;
