import rateLimit from "express-rate-limit";

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
