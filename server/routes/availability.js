import { Router } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import calendar from "../config/google.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();
const tz = "Africa/Johannesburg";

router.get("/availability", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date required" });

  try {
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
      if (event.start?.date) {
        for (let h = 8; h <= 22; h++) {
          blockedSet.add(`${String(h).padStart(2, "0")}:00`);
        }
        return;
      }
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

export default router;
