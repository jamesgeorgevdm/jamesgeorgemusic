import { Router } from "express";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { chatLimiter } from "../middleware/rateLimiters.js";

const router = Router();

const SYSTEM_PROMPT = `You are a friendly assistant for James George Music, a professional musician based in South Africa.
Help visitors with questions about booking live performances, music styles (jazz, classical, pop, etc.), pricing packages, and availability.
Be warm, professional, and concise. If asked about specific dates or confirming a booking, direct them to use the Booking page on the website.
Do not invent specific prices beyond general guidance — packages include Restaurant (R500/h), Corporate (R1,200/h), Wedding (R3,500 package), Private (R1,000/h), and Solo Show (negotiable).`;

router.post("/chat", chatLimiter, async (req, res) => {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return res.status(503).json({ error: "Chat service is not configured." });
  }

  try {
    const { messages } = req.body;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat request failed." });
  }
});

export default router;
