import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { getCalendarClient } from "../config/google.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = "Africa/Johannesburg";

export async function getBlockedSlots(date) {
  if (!date) throw new Error("Date required");

  const calendar = await getCalendarClient();
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

  return Array.from(blockedSet).sort();
}
