import pool from "../config/db.js";
import { transporter } from "../utils/email.js";

// Claim → send → mark pattern so SMTP slowness never blocks the booking HTTP response
export async function processEmailOutbox({ limit = 20 } = {}) {
  const client = await pool.connect();
  let rows = [];

  try {
    await client.query("BEGIN");

    // Reclaim rows stuck in "processing" after a crash/deploy mid-send.
    // Use updated_at (set when claimed), not created_at, to avoid double-send races.
    await client.query(
      `UPDATE email_outbox
       SET status = 'pending', updated_at = NOW()
       WHERE status = 'processing'
         AND updated_at < NOW() - INTERVAL '5 minutes'`
    );

    // SKIP LOCKED lets concurrent workers (cron + interval) claim different rows safely
    const claimed = await client.query(
      `WITH due AS (
         SELECT id
         FROM email_outbox
         WHERE status = 'pending' AND attempts < 5
         ORDER BY created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT $1
       )
       UPDATE email_outbox e
       SET status = 'processing',
           attempts = e.attempts + 1,
           updated_at = NOW()
       FROM due
       WHERE e.id = due.id
       RETURNING e.id, e.kind, e.payload, e.attempts`,
      [limit]
    );

    // Commit the claim before SMTP so a send hang doesn't hold row locks
    rows = claimed.rows;
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      // payload is a full nodemailer options object stored as JSONB
      await transporter.sendMail(row.payload);
      await pool.query(
        `UPDATE email_outbox
         SET status = 'sent', sent_at = NOW(), last_error = NULL, updated_at = NOW()
         WHERE id = $1`,
        [row.id]
      );
      sent++;
    } catch (err) {
      const message = err?.message || "Send failed";
      // After 5 attempts the row stays failed for manual inspection
      await pool.query(
        `UPDATE email_outbox
         SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
             last_error = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [row.id, message]
      );
      failed++;
      console.error(`Outbox send failed (id=${row.id}):`, message);
    }
  }

  return { sent, failed, claimed: rows.length };
}
