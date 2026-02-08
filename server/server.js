import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import dotenv from "dotenv";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
app.use(cors());
app.use(express.json());

// Google Calendar setup
const auth = new google.auth.GoogleAuth({
  keyFile: "jamesgeorgemusic-40567ec76f04.json", // your downloaded JSON
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

const calendar = google.calendar({ version: "v3", auth });

// Endpoint: Get blocked times for a date
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

    // Prevent booking past hours today
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


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // set in .env
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Booking form endpoint
app.post("/api/send-booking", async (req, res) => {
  const { name, email, phone, product, message, date, startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ success: false, error: "Timeslot required" });
  }

  try {
    const dateFormatted = dayjs(date).tz("Africa/Johannesburg").format("DD MMM YYYY");

    // Send booking details to yourself
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

    // Auto-reply to sender
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

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
