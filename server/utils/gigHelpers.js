import dayjs from "dayjs";
import pool from "../config/db.js";
import { getCalendarClient } from "../config/google.js";

// Match calendar titles first (exact word), then fall back to description substring
export const categorizeGig = (summary, description, categories) => {
  const titleWords = (summary || "").toLowerCase().split(/\s+/);

  for (const word of titleWords) {
    for (const cat of categories) {
      if (Array.isArray(cat.keywords) && cat.keywords.some((kw) => word === kw.toLowerCase())) {
        return cat.id;
      }
    }
  }

  const descText = (description || "").toLowerCase();
  const match = categories.find(
    (cat) =>
      Array.isArray(cat.keywords) &&
      cat.keywords.some((kw) => descText.includes(kw.toLowerCase()))
  );
  return match ? match.id : null;
};

// Idempotent: each Google event id is counted at most once into live_count
export const syncGigs = async () => {
  const catResult = await pool.query("SELECT * FROM gig_categories");
  const categories = catResult.rows;
  const calendar = await getCalendarClient();

  const response = await calendar.events.list({
    calendarId: process.env.CALENDAR_ID,
    // Floor date avoids re-counting history already baked into legacy_count
    timeMin: dayjs("2026-02-23").toISOString(),
    timeMax: dayjs().toISOString(),
    singleEvents: true,
  });

  const events = response.data.items || [];
  let added = 0;

  for (const event of events) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Lock the processed row (or absence) so two workers can't double-increment
      const existsResult = await client.query(
        "SELECT google_event_id FROM processed_events WHERE google_event_id = $1 FOR UPDATE",
        [event.id]
      );

      if (existsResult.rowCount > 0) {
        await client.query("COMMIT");
        continue;
      }

      const catId = categorizeGig(event.summary, event.description, categories);
      if (!catId) {
        // Commit without inserting — personal/non-gig events stay uncounted
        await client.query("COMMIT");
        console.log("Uncategorized event skipped:", event.summary);
        continue;
      }

      await client.query(
        "UPDATE gig_categories SET live_count = live_count + 1 WHERE id = $1",
        [catId]
      );
      await client.query(
        "INSERT INTO processed_events (google_event_id) VALUES ($1)",
        [event.id]
      );
      await client.query("COMMIT");
      added++;
    } catch (err) {
      await client.query("ROLLBACK");
      if (err?.code === "23505") {
        // Unique violation — another worker already processed this event
        continue;
      }
      console.error("Error processing event:", event.summary, err);
    } finally {
      client.release();
    }
  }

  return added;
};
