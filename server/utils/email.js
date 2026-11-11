import "../config/env.js";

// Resend HTTPS API — an API key never expires, and HTTPS works on Render free
// (which blocks outbound SMTP). Sends from the verified jamesgeorgemusic.com domain.
const MAIL_FROM_ADDRESS = process.env.MAIL_FROM || "bookings@jamesgeorgemusic.com";

function formatAddress(value) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value.name) return `${value.name} <${value.address}>`;
  return value.address;
}

export async function sendMail({ from, to, replyTo, subject, text }) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Keep the caller's display name, but always send from the verified domain
      from: `${from?.name || "James George Music"} <${MAIL_FROM_ADDRESS}>`,
      to: [formatAddress(to)],
      reply_to: formatAddress(replyTo),
      subject,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

// Shared by bookingService — returns a list so the client can show every issue at once
export const validateBookingFields = ({ name, email, phone, product, message, startTime, endTime }) => {
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("A valid name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required.");
  if (!phone || !/^\+?[\d\s\-().]{7,20}$/.test(phone)) errors.push("A valid phone number is required.");
  if (!product || product.trim().length === 0) errors.push("A product must be selected.");
  if (!message || message.trim().length < 10) errors.push("Please provide a message of at least 10 characters.");
  if (!startTime || !endTime) errors.push("A timeslot must be selected.");

  return errors;
};
