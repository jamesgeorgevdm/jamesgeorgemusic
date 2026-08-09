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

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://jamesgeorgemusic.com",
      "https://www.jamesgeorgemusic.com",
    ];
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
    await ensureSchema();
    console.log("Database schema ensured.");
  } catch (err) {
    console.error("Failed to ensure schema:", err);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // Local/dev drain so booking emails still leave without an external cron.
  const intervalMs = Number(process.env.OUTBOX_POLL_MS || 60000);
  setInterval(() => {
    processEmailOutbox().catch((err) => {
      console.error("Outbox interval error:", err);
    });
  }, intervalMs);
}

start();
