import { Router } from "express";
import { exchangeOAuthCode, getOAuthConsentUrl } from "../config/google.js";

const router = Router();

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
    res.json({ url });
  } catch (err) {
    console.error("OAuth start error:", err);
    res.status(503).json({ error: err.message || "OAuth is not configured." });
  }
});

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
      "Google Calendar connected. You can close this tab. Availability will prefer this OAuth token."
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("Failed to store Google tokens.");
  }
});

export default router;
