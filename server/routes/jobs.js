import { Router } from "express";
import crypto from "crypto";
import { requireCronSecret } from "../middleware/cronAuth.js";
import { processEmailOutbox } from "../services/emailOutbox.js";
import { syncGigs } from "../utils/gigHelpers.js";
import { getCalendarClient } from "../config/google.js";
import pool from "../config/db.js";

const router = Router();

router.post("/jobs/process-outbox", requireCronSecret, async (req, res) => {
  try {
    const result = await processEmailOutbox();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Outbox job error:", err);
    res.status(500).json({ error: "Failed to process email outbox." });
  }
});

router.post("/jobs/sync-gigs", requireCronSecret, async (req, res) => {
  try {
    const added = await syncGigs();
    res.json({ success: true, newGigsProcessed: added });
  } catch (err) {
    console.error("Sync job error:", err);
    res.status(500).json({ error: "Sync failed." });
  }
});

/** Renew Google Calendar push watch (channels expire ~7 days). */
router.post("/jobs/watch-calendar", requireCronSecret, async (req, res) => {
  const webhookUrl = process.env.GOOGLE_CALENDAR_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(503).json({ error: "GOOGLE_CALENDAR_WEBHOOK_URL is not configured." });
  }

  try {
    const calendar = await getCalendarClient();
    const channelId = crypto.randomUUID();

    const watch = await calendar.events.watch({
      calendarId: process.env.CALENDAR_ID,
      requestBody: {
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
      },
    });

    const resourceId = watch.data.resourceId || null;
    const expiration = watch.data.expiration
      ? new Date(Number(watch.data.expiration))
      : null;

    await pool.query(
      `INSERT INTO calendar_watch_channels (channel_id, resource_id, expiration)
       VALUES ($1, $2, $3)`,
      [channelId, resourceId, expiration]
    );

    res.json({
      success: true,
      channelId,
      resourceId,
      expiration,
    });
  } catch (err) {
    console.error("Watch calendar job error:", err);
    res.status(500).json({ error: "Failed to create calendar watch channel." });
  }
});

export default router;
