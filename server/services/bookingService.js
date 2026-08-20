import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import pool from "../config/db.js";
import { transporter, validateBookingFields } from "../utils/email.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// Persist the booking, then send owner + client emails over SMTP in the same request.
export async function createBookingRequest(body) {
  const { name, email, phone, product, message, date, startTime, endTime } = body;

  const errors = validateBookingFields({
    name,
    email,
    phone,
    product,
    message,
    startTime,
    endTime,
  });
  if (errors.length > 0) {
    return { ok: false, status: 400, errors };
  }

  // Human-readable date for email bodies; DB still stores the raw event_date
  const dateFormatted = dayjs(date).tz("Africa/Johannesburg").format("DD MMM YYYY");
  const ownerEmail = process.env.EMAIL_USER || "jamesv234@gmail.com";

  const client = await pool.connect();
  let bookingId;
  let clientId;
  try {
    await client.query("BEGIN");

    // Returning clients reuse the same row keyed by email
    const clientResult = await client.query(
      `INSERT INTO clients (name, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             phone = COALESCE(EXCLUDED.phone, clients.phone)
       RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), phone.trim()]
    );
    clientId = clientResult.rows[0].id;

    const bookingResult = await client.query(
      `INSERT INTO booking_requests
         (client_id, product, message, event_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [clientId, product, message, date || null, startTime, endTime]
    );
    bookingId = bookingResult.rows[0].id;

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // From must be the authenticated Gmail account; use replyTo for the client.
  const ownerPayload = {
    from: { name: "James George Music Bookings", address: ownerEmail },
    replyTo: email,
    to: ownerEmail,
    subject: `New Booking Request: ${product}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${product}\nDate: ${dateFormatted}\nTimeslot: ${startTime} - ${endTime}\nMessage: ${message}`,
  };

  const clientPayload = {
    from: { name: "James George Music", address: ownerEmail },
    to: email,
    subject: "Booking Request Received",
    text: `Hi ${name}!\n\nThanks so much for your booking request for a performance on ${dateFormatted} from (${startTime} - ${endTime}).\nI so appreciate your interest, and will confirm it on my end as soon as possible. Speak soon!\n\n Sincerely, \n James George.`,
  };

  // Owner mail is required; client confirmation is best-effort and must not
  // block or fail the request once you have been notified.
  await transporter.sendMail(ownerPayload);

  try {
    await transporter.sendMail(clientPayload);
  } catch (err) {
    console.error("Client confirmation email failed:", err);
  }

  return { ok: true, bookingId, clientId };
}
