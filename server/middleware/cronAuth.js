// Protects GitHub Actions / in-process job HTTP endpoints from public abuse
export function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET;
  // Fail closed if misconfigured — better than an open sync/outbox endpoint
  if (!secret) {
    return res.status(503).json({ error: "CRON_SECRET is not configured." });
  }

  const provided = req.headers["x-cron-secret"];
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  next();
}
