import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://jamesgeorgemusic.com",
      "https://www.jamesgeorgemusic.com",
    ];
    // Allow if in list, or if it's a Vercel preview URL, or no origin (Postman/Mobile)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Google Calendar Setup: Use Environment Variable instead of local file
const auth = new google.auth.GoogleAuth({
  // Search for string in Render Env Vars
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});
const calendar = google.calendar({ version: "v3", auth });

/**Categorize gig based on keywords
 */
const categorizeGig = (summary, description, categories) => {
  const textToSearch = `${summary} ${description || ""}`.toLowerCase();
  const match = categories.find(cat => 
    cat.keywords.some(kw => textToSearch.includes(kw.toLowerCase()))
  );
  return match ? match.id : null;
};

// ENDPOINTS

app.get("/api/stats", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gig_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sync-gigs", async (req, res) => {
  try {
    const { data: categories } = await supabase.from("gig_categories").select("*");
    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: dayjs("2026-02-23").toISOString(), 
      timeMax: dayjs().toISOString(),
      singleEvents: true,
    });

    const events = response.data.items || [];
    let added = 0;

    for (const event of events) {
      const { data: exists } = await supabase
        .from("processed_events")
        .select("google_event_id")
        .eq("google_event_id", event.id)
        .single();

      if (!exists) {
        const catId = categorizeGig(event.summary, event.description, categories);
        if (catId) {
          await supabase.rpc("increment_live_count", { row_id: catId });
          await supabase.from("processed_events").insert([{ google_event_id: event.id }]);
          added++;
        }
      }
    }
    res.json({ success: true, newGigsProcessed: added });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});

app.get("/api/availability", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date required" });

  try {
    const tz = "Africa/Johannesburg";
    const startOfDay = dayjs.tz(date, tz).startOf("day");
    const endOfDay = dayjs.tz(date, tz).endOf("day");

    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      timeZone: tz,
    });

    const events = response.data.items || [];
    const blockedSet = new Set();

    events.forEach((event) => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      const start = dayjs(event.start.dateTime).tz(tz);
      const end = dayjs(event.end.dateTime).tz(tz);
      for (let h = start.hour(); h < end.hour(); h++) {
        blockedSet.add(`${String(h).padStart(2, "0")}:00`);
      }
    });

    const today = dayjs().tz(tz);
    if (today.format("YYYY-MM-DD") === date) {
      for (let h = 0; h <= today.hour(); h++) {
        blockedSet.add(`${String(h).padStart(2, "0")}:00`);
      }
    }

    res.json({ blocked: Array.from(blockedSet) });
  } catch (err) {
    console.error("Google Calendar error:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.post("/api/send-booking", async (req, res) => {
  const { name, email, phone, product, message, date, startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ success: false, error: "Timeslot required" });
  }

  try {
    const dateFormatted = dayjs(date).tz("Africa/Johannesburg").format("DD MMM YYYY");

    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `New Booking Request: ${product}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Product: ${product}
Date: ${dateFormatted}
Timeslot: ${startTime} - ${endTime}
Message: ${message}
      `,
    });

    await transporter.sendMail({
      from: { name: "James George Music", address: "jamesv234@gmail.com" },
      to: email,
      subject: "Booking Request Received",
      text: `Hi ${name},\n\nThanks for your booking request for a ${product} performance on ${dateFormatted} (${startTime} - ${endTime}).\nI'll get back to you shortly.`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking email error:", error);
    res.status(500).json({ success: false, error: "Booking email failed to send." });
  }
});

app.post("/api/contact", async (req, res) => {
  const { email, subject, message } = req.body;
  try {
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `Direct Contact: ${subject}`,
      text: `From: ${email}\n\nMessage:\n${message}`,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// PORT for Render deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));