import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import kitsRouter from "./routes/kits";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/* ── CORS ──────────────────────────────────────────────────── */
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

/* ── Body parsing ──────────────────────────────────────────── */
app.use(express.json({ limit: "2mb" }));

/* ── Health check ──────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── Routes ────────────────────────────────────────────────── */
app.use("/api/kits", kitsRouter);

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
