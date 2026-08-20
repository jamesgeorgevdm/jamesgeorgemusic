import pool from "../config/db.js";

// Lightweight bootstrap DDL run on every boot — IF NOT EXISTS keeps it safe to re-run.
// Heavier migrations (data backfills) belong elsewhere.
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS booking_requests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    product TEXT NOT NULL,
    message TEXT NOT NULL,
    event_date DATE,
    start_time TEXT,
    end_time TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `DROP TABLE IF EXISTS email_outbox`,
  `CREATE TABLE IF NOT EXISTS oauth_tokens (
    provider TEXT PRIMARY KEY,
    refresh_token TEXT,
    access_token TEXT,
    expiry TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS processed_webhook_events (
    delivery_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS calendar_watch_channels (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL UNIQUE,
    resource_id TEXT,
    expiration TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS processed_events (
    google_event_id TEXT PRIMARY KEY
  )`,
  // If processed_events already existed without a unique key, harden it.
  `CREATE UNIQUE INDEX IF NOT EXISTS processed_events_google_event_id_uidx
    ON processed_events (google_event_id)`,
];

export async function ensureSchema() {
  // Sequential so dependent tables (FKs) always exist before later statements
  for (const sql of STATEMENTS) {
    await pool.query(sql);
  }
}
