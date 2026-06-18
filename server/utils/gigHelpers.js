import dayjs from "dayjs";
import pool from "../config/db.js";
import calendar from "../config/google.js";

export const categorizeGig = (summary, description, categories) => {
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

export const syncGigs = async () => {
  const catResult = await pool.query("SELECT * FROM gig_categories");
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
        "SELECT google_event_id FROM processed_events WHERE google_event_id = $1",
        [event.id]
      );

      if (existsResult.rowCount === 0) {
        const catId = categorizeGig(event.summary, event.description, categories);

        if (catId) {
          await pool.query(
            "UPDATE gig_categories SET live_count = live_count + 1 WHERE id = $1",
            [catId]
          );
          await pool.query(
            "INSERT INTO processed_events (google_event_id) VALUES ($1)",
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
