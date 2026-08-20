import { Router } from "express";
import { exchangeOAuthCode, getOAuthConsentUrl } from "../config/google.js";

const router = Router();

// Accept secret via header (preferred) or query (handy for browser bookmarks)
function requireAdmin(req, res) {
  const adminSecret = req.headers["x-admin-secret"] || req.query.admin_secret;
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

/** Owner-only: start Google Calendar OAuth (offline refresh token). */
router.get("/oauth/google/start", (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const url = getOAuthConsentUrl("owner");
    // Client (or curl) opens this URL; Google redirects to /oauth/google/callback
    res.json({ url });
  } catch (err) {
    console.error("OAuth start error:", err);
    res.status(503).json({ error: err.message || "OAuth is not configured." });
  }
});

// Public callback URL registered in Google Cloud Console — no admin header here
router.get("/oauth/google/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.status(400).send(`Google OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send("Missing OAuth code.");
  }

  try {
    await exchangeOAuthCode(code);
    res.send(
      "Google connected. You can close this tab. Calendar availability and booking/contact emails will use this account."
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("Failed to store Google tokens.");
  }
});

export default router;
