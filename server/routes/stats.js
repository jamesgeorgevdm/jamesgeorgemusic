import { Router } from "express";
import pool from "../config/db.js";
import { requireCronSecret } from "../middleware/cronAuth.js";
import { syncGigs } from "../utils/gigHelpers.js";

const router = Router();

// Prefetched by App.jsx for the About page count-up (legacy_count + live_count)
router.get("/stats", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gig_categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/** @deprecated Prefer POST /api/jobs/sync-gigs — kept as alias with the same cron auth. */
router.post("/sync-gigs", requireCronSecret, async (req, res) => {
  try {
    const added = await syncGigs();
    res.json({ success: true, newGigsProcessed: added });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
