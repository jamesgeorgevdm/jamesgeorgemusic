import "./config/env.js";
import express from "express";
import cors from "cors";
import statsRoutes from "./routes/stats.js";
import availabilityRoutes from "./routes/availability.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chat.js";

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
