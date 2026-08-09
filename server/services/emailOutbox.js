import pool from "../config/db.js";
import { transporter } from "../utils/email.js";

export async function processEmailOutbox({ limit = 20 } = {}) {
  const client = await pool.connect();
  let rows = [];

  try {
    await client.query("BEGIN");

    // Reclaim rows left in "processing" after a crash/deploy mid-send.
    await client.query(
      `UPDATE email_outbox
       SET status = 'pending'
       WHERE status = 'processing'
         AND created_at < NOW() - INTERVAL '5 minutes'`
    );

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
       SET status = 'processing', attempts = e.attempts + 1
       FROM due
       WHERE e.id = due.id
       RETURNING e.id, e.kind, e.payload, e.attempts`,
      [limit]
    );

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
      await transporter.sendMail(row.payload);
      await pool.query(
        `UPDATE email_outbox
         SET status = 'sent', sent_at = NOW(), last_error = NULL
         WHERE id = $1`,
        [row.id]
      );
      sent++;
    } catch (err) {
      const message = err?.message || "Send failed";
      await pool.query(
        `UPDATE email_outbox
         SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
             last_error = $2
         WHERE id = $1`,
        [row.id, message]
      );
      failed++;
      console.error(`Outbox send failed (id=${row.id}):`, message);
    }
  }

  return { sent, failed, claimed: rows.length };
}
