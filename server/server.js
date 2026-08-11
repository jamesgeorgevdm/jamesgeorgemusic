// Load .env before any module reads process.env
import "./config/env.js";
import express from "express";
import cors from "cors";
import statsRoutes from "./routes/stats.js";
import availabilityRoutes from "./routes/availability.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chat.js";
import reviewsRoutes from "./routes/reviews.js";
import oauthRoutes from "./routes/oauth.js";
import webhookRoutes from "./routes/webhooks.js";
import jobsRoutes from "./routes/jobs.js";
import { ensureSchema } from "./utils/ensureSchema.js";
import { processEmailOutbox } from "./services/emailOutbox.js";
import { syncGigs } from "./utils/gigHelpers.js";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://jamesgeorgemusic.com",
      "https://www.jamesgeorgemusic.com",
    ];
    // !origin allows same-origin / server-to-server / curl (no Origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

// All public + admin/cron routes mount under /api
app.use("/api", statsRoutes);
app.use("/api", availabilityRoutes);
app.use("/api", contactRoutes);
app.use("/api", chatRoutes);
app.use("/api", reviewsRoutes);
app.use("/api", oauthRoutes);
app.use("/api", webhookRoutes);
app.use("/api", jobsRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Idempotent DDL so fresh deploys don't require a separate migrate step
    await ensureSchema();
    console.log("Database schema ensured.");
  } catch (err) {
    // Still listen — Render health checks need the process up; schema may recover on retry
    console.error("Failed to ensure schema:", err);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // In-process schedules (run while the Render instance is awake).
  // GitHub Actions also hits the HTTP job routes to wake cold starts.
  const outboxMs = Number(process.env.OUTBOX_POLL_MS || 60000);
  const syncMs = Number(process.env.SYNC_POLL_MS || 60 * 60 * 1000);

  setInterval(() => {
    processEmailOutbox().catch((err) => {
      console.error("Outbox interval error:", err);
    });
  }, outboxMs);

  setInterval(() => {
    syncGigs().catch((err) => {
      console.error("Gig sync interval error:", err);
    });
  }, syncMs);
}

start();
