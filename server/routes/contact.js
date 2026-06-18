import { Router } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { transporter, validateBookingFields } from "../utils/email.js";
import { bookingLimiter, contactLimiter } from "../middleware/rateLimiters.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();

router.post("/send-booking", bookingLimiter, async (req, res) => {
  const { name, email, phone, product, message, date, startTime, endTime } = req.body;

  const errors = validateBookingFields({ name, email, phone, product, message, startTime, endTime });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const dateFormatted = dayjs(date).tz("Africa/Johannesburg").format("DD MMM YYYY");

  try {
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `New Booking Request: ${product}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${product}\nDate: ${dateFormatted}\nTimeslot: ${startTime} - ${endTime}\nMessage: ${message}`,
    });
  } catch (error) {
    console.error("Owner notification email failed:", error);
    return res.status(500).json({ success: false, error: "Booking failed to send. Please try again." });
  }

  try {
    await transporter.sendMail({
      from: { name: "James George Music", address: "jamesv234@gmail.com" },
      to: email,
      subject: "Booking Request Received",
      text: `Hi ${name}!\n\nThanks so much for your booking request for a performance on ${dateFormatted} from (${startTime} - ${endTime}).\nI so appreciate your interest, and will confirm it on my end as soon as possible. Speak soon!\n\n Sincerely, \n James George.`,
    });
  } catch (error) {
    console.error("User confirmation email failed:", error);
  }

  res.status(200).json({ success: true });
});

router.post("/contact", contactLimiter, async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "A valid email is required." });
  }
  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({ success: false, error: "A subject is required." });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ success: false, error: "Please provide a message of at least 10 characters." });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
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
