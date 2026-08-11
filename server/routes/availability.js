import { Router } from "express";
import { getBlockedSlots } from "../services/availabilityService.js";

const router = Router();

// Used by Booking.jsx and the chat getAvailability tool — date must be YYYY-MM-DD
router.get("/availability", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date required" });

  try {
    const blocked = await getBlockedSlots(date);
    res.json({ blocked });
  } catch (err) {
    console.error("Google Calendar error:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router;
