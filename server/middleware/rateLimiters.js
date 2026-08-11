import rateLimit from "express-rate-limit";

// Per-IP caps for public write endpoints — keyed off default X-Forwarded-For behind Render

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many booking requests. Please try again later." },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many messages sent. Please try again later." },
});

// Chat is chatty by nature — higher ceiling, and rateLimited flag for the widget UI
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, rateLimited: true, error: "Too many chat messages. Please try again later." },
});
