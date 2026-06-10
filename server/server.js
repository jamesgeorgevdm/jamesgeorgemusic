import express from "express";
import cors from "cors";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import dotenv from "dotenv";
import pkg from 'pg';
import rateLimit from "express-rate-limit"; 

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
const { Pool } = pkg;

// CORS configuration
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
  credentials: true
}));
app.use(express.json());

// Limits each IP to 10 booking requests per hour
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many booking requests. Please try again later." },
});

// Limits each IP to 10 contact form submissions per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many messages sent. Please try again later." },
});

// Neon Postgres Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Google Calendar Setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});
const calendar = google.calendar({ version: "v3", auth });

// Categorize gig based on first-appearing keyword in title
const categorizeGig = (summary, description, categories) => {
  const titleWords = (summary || "").toLowerCase().split(/\s+/);

  for (const word of titleWords) {
    for (const cat of categories) {
      if (Array.isArray(cat.keywords) && cat.keywords.some(kw => word === kw.toLowerCase())) {
        return cat.id;
      }
    }
  }

  const descText = (description || "").toLowerCase();
  const match = categories.find(cat =>
    Array.isArray(cat.keywords) && cat.keywords.some(kw => descText.includes(kw.toLowerCase()))
  );
  return match ? match.id : null;
};

// Server-side validation helper function
// Second security layer after frontend HTML5 validation
const validateBookingFields = ({ name, email, phone, product, message, startTime, endTime }) => {
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("A valid name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required.");
  if (!phone || !/^\+?[\d\s\-().]{7,20}$/.test(phone)) errors.push("A valid phone number is required.");
  if (!product || product.trim().length === 0) errors.push("A product must be selected.");
  if (!message || message.trim().length < 10) errors.push("Please provide a message of at least 10 characters.");
  if (!startTime || !endTime) errors.push("A timeslot must be selected.");

  return errors;
};

// Shared sync function — used by both the endpoint and the cron job
const syncGigs = async () => {
  const catResult = await pool.query('SELECT * FROM gig_categories');
  const categories = catResult.rows;

  const response = await calendar.events.list({
    calendarId: process.env.CALENDAR_ID,
    timeMin: dayjs("2026-02-23").toISOString(),
    timeMax: dayjs().toISOString(),
    singleEvents: true,
  });

  const events = response.data.items || [];
  let added = 0;

  for (const event of events) {
    try {
      const existsResult = await pool.query(
        'SELECT google_event_id FROM processed_events WHERE google_event_id = $1',
        [event.id]
      );

      if (existsResult.rowCount === 0) {
        const catId = categorizeGig(event.summary, event.description, categories);

        if (catId) {
          await pool.query(
            'UPDATE gig_categories SET live_count = live_count + 1 WHERE id = $1',
            [catId]
          );
          await pool.query(
            'INSERT INTO processed_events (google_event_id) VALUES ($1)',
            [event.id]
          );
          added++;
        } else {
          console.log("Uncategorized event skipped:", event.summary);
        }
      }
    } catch (err) {
      console.error("Error processing event:", event.summary, err);
    }
  }

  return added;
};

// ENDPOINTS

// Fetch performance statistics
app.get("/api/stats", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gig_categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Sync Google Calendar events with the Database
app.post("/api/sync-gigs", async (req, res) => {
  try {
    const added = await syncGigs();
    res.json({ success: true, newGigsProcessed: added });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

// Check availability for a specific date
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
    // Set gives automatic deduplication and O(1) lookup
    // Prevents overlapping events from double-blocking a slot
    const blockedSet = new Set();

    events.forEach((event) => {
      // Google Calendar returns full-day events with just a date, no dateTime
      // If date only — block entire day
      if (event.start?.date) {
        for (let h = 8; h <= 22; h++) {
          blockedSet.add(`${String(h).padStart(2, "0")}:00`);
        }
        return;
      }
      // Malformed entry
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      // Raw GC datetime strings to dayjs objects with Joburg time - hours will be local
      const start = dayjs(event.start.dateTime).tz(tz);
      const end = dayjs(event.end.dateTime).tz(tz);

      for (let h = start.hour(); h < end.hour(); h++) {
        blockedSet.add(`${String(h).padStart(2, "0")}:00`); // Adds left-0 to 8:00 for example
      }
    });
    // Check if the date being queried is today specifically
    const today = dayjs().tz(tz);
    if (today.format("YYYY-MM-DD") === date) {
      // Block all hours up until current hour
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

// Nodemailer Setup
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

// Handle booking requests and send emails
app.post("/api/send-booking", bookingLimiter, async (req, res) => {
  const { name, email, phone, product, message, date, startTime, endTime } = req.body;

  const errors = validateBookingFields({ name, email, phone, product, message, startTime, endTime });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const dateFormatted = dayjs(date).tz("Africa/Johannesburg").format("DD MMM YYYY");
  // TRY 1 — hard dependency: if owner email fails, booking is aborted entirely
  try {
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `New Booking Request: ${product}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${product}\nDate: ${dateFormatted}\nTimeslot: ${startTime} - ${endTime}\nMessage: ${message}`,
    });
  } catch (error) {
    console.error("Owner notification email failed:", error);
    return res.status(500).json({ success: false, error: "Booking failed to send. Please try again." });
  }
  // TRY 2 — soft dependency: user confirmation, failure is logged but doesn't block success
  try {
    await transporter.sendMail({
      from: { name: "James George Music", address: "jamesv234@gmail.com" },
      to: email,
      subject: "Booking Request Received",
      text: `Hi ${name}!\n\nThanks so much for your booking request for a performance on ${dateFormatted} from (${startTime} - ${endTime}).\nI so appreciate your interest, and will confirm it on my end as soon as possible. Speak soon!\n\n Sincerely, \n James George.`,
    });
  } catch (error) {
    console.error("User confirmation email failed:", error);
  }

  res.status(200).json({ success: true });
});

// Handle contact form submissions
app.post("/api/contact", contactLimiter, async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "A valid email is required." });
  }
  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({ success: false, error: "A subject is required." });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ success: false, error: "Please provide a message of at least 10 characters." });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `Direct Contact: ${subject}`,
      text: `From: ${email}\n\nMessage:\n${message}`,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Auto-sync gigs daily at midnight (Africa/Johannesburg)
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
