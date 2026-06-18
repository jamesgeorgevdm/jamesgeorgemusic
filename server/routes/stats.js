import { Router } from "express";
import pool from "../config/db.js";
import { syncGigs } from "../utils/gigHelpers.js";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gig_categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.post("/sync-gigs", async (req, res) => {
  try {
    const added = await syncGigs();
    res.json({ success: true, newGigsProcessed: added });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
