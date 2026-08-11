import "./env.js";
import pkg from "pg";

const { Pool } = pkg;

// Shared pool — imported by routes/services; do not create per-request clients except for transactions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Managed Postgres (Render/Neon) presents a cert Node doesn't trust by default
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
