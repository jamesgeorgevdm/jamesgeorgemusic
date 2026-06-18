import "./config/env.js";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import statsRoutes from "./routes/stats.js";
import availabilityRoutes from "./routes/availability.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chat.js";
import { syncGigs } from "./utils/gigHelpers.js";

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

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled gig sync...");
  try {
    const added = await syncGigs();
    console.log(`Scheduled sync complete. New gigs processed: ${added}`);
  } catch (err) {
    console.error("Scheduled sync failed:", err);
  }
}, { timezone: "Africa/Johannesburg" });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
