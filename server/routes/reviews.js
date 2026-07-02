import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// GET all reviews (newest first)
router.get("/reviews", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

// GET validate a review token before the form is shown
router.get("/validate-token", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ valid: false, error: "No token provided." });
  }
  try {
    const result = await pool.query(
      "SELECT id FROM review_tokens WHERE token = $1 AND used = false AND expires_at > NOW()",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        valid: false,
        error: "This link is invalid or has already been used.",
      });
    }
    res.json({ valid: true });
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ valid: false, error: "Server error." });
  }
});

// POST submit a review (requires a valid token)
router.post("/reviews", async (req, res) => {
  const { token, name, event_date, rating, review } = req.body;

  if (!token) return res.status(400).json({ error: "Token required." });
  if (!name || !rating || !review) {
    return res.status(400).json({ error: "Name, rating, and review are required." });
  }

  try {
    const tokenResult = await pool.query(
      "SELECT id FROM review_tokens WHERE token = $1 AND used = false AND expires_at > NOW()",
      [token]
    );
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    await pool.query(
      "INSERT INTO reviews (name, event_date, rating, review) VALUES ($1, $2, $3, $4)",
      [name, event_date || null, rating, review]
    );

    await pool.query(
      "UPDATE review_tokens SET used = true WHERE token = $1",
      [token]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Review submission error:", err);
    res.status(500).json({ error: "Failed to submit review." });
  }
});

// POST generate a single-use review token (admin only)
// Usage: POST /api/admin/generate-token
//   Header: x-admin-secret: <your ADMIN_SECRET env var>
//   Body:   { "event_label": "Smith Wedding – June 2026", "days_valid": 30 }
router.post("/admin/generate-token", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { event_label, days_valid = 30 } = req.body;
  const expires_at = new Date(Date.now() + days_valid * 24 * 60 * 60 * 1000);

  try {
    const result = await pool.query(
      "INSERT INTO review_tokens (event_label, expires_at) VALUES ($1, $2) RETURNING token",
      [event_label || null, expires_at]
    );
    const token = result.rows[0].token;
    const clientUrl = process.env.CLIENT_URL || "https://jamesgeorgemusic.com";
    const url = `${clientUrl}/leave-review?token=${token}`;

    res.json({ token, url, expires_at });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: "Failed to generate token." });
  }
});

export default router;
