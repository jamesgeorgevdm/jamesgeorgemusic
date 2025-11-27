import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // path to your JSON file
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

const calendar = google.calendar({ version: "v3", auth });

// Endpoint: get blocked times for a date
app.get("/api/availability", async (req, res) => {
  const { date } = req.query; // e.g. "2025-11-18"
  if (!date) return res.status(400).json({ error: "Date required" });

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: "jamesv234@gmail.com", // or your calendar ID
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const blocked = [];

    events.forEach((event) => {
      if (!event.start.dateTime || !event.end.dateTime) return;
      const startHour = new Date(event.start.dateTime).getHours();
      const endHour = new Date(event.end.dateTime).getHours();
      for (let i = startHour; i < endHour; i++) {
        blocked.push(`${String(i).padStart(2, "0")}:00`);
      }
    });

    res.json({ blocked });
  } catch (err) {
    console.error("Google Calendar error:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "jamesv234@gmail.com",
    pass: "roqexibkvppsdopq", // App password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Contact form endpoint
app.post("/contact", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // Send message to yourself
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `New message from ${email}: ${subject}`,
      text: message,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: {
        name: "James George Music",
        address: "jamesv234@gmail.com",
      },
      to: email,
      subject: "Thanks for reaching out!",
      text: `Hi there!\n\nThanks for getting in touch. I’ve received your message and will get back to you soon.`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Email failed to send." });
  }
});

// Booking form endpoint
app.post("/api/send-booking", async (req, res) => {
  const { name, email, phone, product, message, date } = req.body;

  try {
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
        Date: ${new Date(date).toDateString()}
        Message: ${message}
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: {
        name: "James George Music",
        address: "jamesv234@gmail.com",
      },
      to: email,
      subject: "Booking Request Received",
      text: `Hi ${name},\n\nThanks for your booking request for a ${product} performance on ${new Date(date).toDateString()}.\nI'll get back to you shortly.`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking email error:", error);
    res.status(500).json({ success: false, error: "Booking email failed to send." });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
