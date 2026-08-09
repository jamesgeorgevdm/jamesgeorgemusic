import { Router } from "express";
import crypto from "crypto";
import pool from "../config/db.js";
import { syncGigs } from "../utils/gigHelpers.js";

const router = Router();

/**
 * Google Calendar push notification receiver.
 * Responds 200 quickly; sync work is best-effort and idempotent.
 */
router.post("/webhooks/google-calendar", async (req, res) => {
  const channelId = req.headers["x-goog-channel-id"];
  const resourceId = req.headers["x-goog-resource-id"];
  const resourceState = req.headers["x-goog-resource-state"];
  const messageNumber = req.headers["x-goog-message-number"];

  // Always ACK first so Google does not disable the channel on slow handlers.
  res.status(200).end();

  if (!channelId || resourceState === "sync") {
    return;
  }

  const deliveryId =
    messageNumber != null
      ? `${channelId}:${messageNumber}`
      : `${channelId}:${resourceId || "unknown"}:${crypto.randomUUID()}`;

  try {
    const insert = await pool.query(
      `INSERT INTO processed_webhook_events (delivery_id)
       VALUES ($1)
       ON CONFLICT (delivery_id) DO NOTHING
       RETURNING delivery_id`,
      [deliveryId]
    );

    if (insert.rowCount === 0) {
      return; // duplicate delivery
    }

    const known = await pool.query(
      `SELECT id FROM calendar_watch_channels WHERE channel_id = $1 LIMIT 1`,
      [channelId]
    );
    if (known.rowCount === 0) {
      console.warn("Webhook for unknown calendar channel:", channelId);
      return;
    }

    await syncGigs();
  } catch (err) {
    console.error("Calendar webhook processing error:", err);
  }
});

export default router;
