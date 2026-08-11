import { Router } from "express";
import { transporter } from "../utils/email.js";
import { bookingLimiter, contactLimiter } from "../middleware/rateLimiters.js";
import { createBookingRequest } from "../services/bookingService.js";

const router = Router();

// Persists the booking + queues emails; HTTP success does not wait on SMTP
router.post("/send-booking", bookingLimiter, async (req, res) => {
  try {
    const result = await createBookingRequest(req.body);
    if (!result.ok) {
      return res.status(result.status).json({ success: false, errors: result.errors });
    }

    // Booking is durable even if the worker has not drained yet.
    res.status(200).json({
      success: true,
      bookingId: result.bookingId,
      queued: true,
    });
  } catch (error) {
    console.error("Booking request failed:", error);
    res.status(500).json({ success: false, error: "Booking failed to save. Please try again." });
  }
});

// Lightweight contact form — sends immediately (no outbox) for one-off enquiries
router.post("/contact", contactLimiter, async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "A valid email is required." });
  }
  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({ success: false, error: "A subject is required." });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "Please provide a message of at least 10 characters.",
    });
  }

  try {
    await transporter.sendMail({
      // Gmail may rewrite From; body still carries the visitor address
      from: email,
      to: process.env.EMAIL_USER || "jamesv234@gmail.com",
      subject: `Direct Contact: ${subject}`,
      text: `From: ${email}\n\nMessage:\n${message}`,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
