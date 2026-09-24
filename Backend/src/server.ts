import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import kitsRouter from "./routes/kits";
import profileRouter from "./routes/profile";

const app = express();
const PORT = process.env.PORT || 4000;

/* ── CORS ──────────────────────────────────────────────────── */
/**
 * `FRONTEND_URL` may hold a comma-separated list. The production domains are
 * kept in the defaults so a missing or stale env var can't take the whole API
 * offline: a rejected origin leaves the browser with no
 * `Access-Control-Allow-Origin`, and `fetch` reports it as "Failed to fetch".
 */
const ALLOWED_ORIGINS = [
  ...(process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://localhost:3000",
  "http://localhost:3001",
  "https://app.usepilot.cfd",
  "https://usepilot.cfd",
];

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser callers (curl, health checks) send no Origin header.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`[cors] Blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  })
);

/* ── Body parsing ──────────────────────────────────────────── */
app.use(express.json({ limit: "10mb" }));

/* ── Health check ──────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── Routes ────────────────────────────────────────────────── */
app.use("/api/kits", kitsRouter);
app.use("/api/profile", profileRouter);

/* ── MongoDB connection + server start ─────────────────────── */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pilot";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[db] Connected to MongoDB: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`[server] Pilot Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[db] MongoDB connection failed:", err);
    process.exit(1);
  });

export default app;
