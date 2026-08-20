import "../config/env.js";
import nodemailer from "nodemailer";
import { getGmailClient } from "../config/google.js";

// Local/dev only. Render free instances block outbound SMTP on 25/465/587, so
// production sends via the Gmail HTTPS API instead (see sendMail).
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    // App password, not the account login password
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
  },
});

function formatAddress(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.name) return `${value.name} <${value.address}>`;
  return value.address || "";
}

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildRfc822({ from, to, replyTo, subject, text }) {
  const headers = [
    `From: ${formatAddress(from)}`,
    `To: ${formatAddress(to)}`,
    replyTo ? `Reply-To: ${formatAddress(replyTo)}` : null,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
  ].filter(Boolean);

  return `${headers.join("\r\n")}\r\n\r\n${text || ""}`;
}

async function sendViaGmailApi(options) {
  const gmail = await getGmailClient();
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: toBase64Url(buildRfc822(options)) },
  });
}

export async function sendMail(options) {
  // RENDER is set on Render. SMTP cannot leave a free web service, so use HTTPS.
  if (process.env.RENDER) {
    return sendViaGmailApi(options);
  }
  return transporter.sendMail(options);
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
