import "../config/env.js";
import nodemailer from "nodemailer";

// Prefer 587/STARTTLS — Render → Gmail on 465 often hits connection timeouts.
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
  },
});

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
