import "../config/env.js";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
