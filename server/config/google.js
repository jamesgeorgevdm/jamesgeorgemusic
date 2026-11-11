import "./env.js";
import { google } from "googleapis";

// Service account only — its key never expires or needs re-consent.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

function getServiceAccountAuth() {
  if (!process.env.GOOGLE_CREDS) {
    throw new Error("GOOGLE_CREDS is not configured");
  }

  // GOOGLE_CREDS is the full service-account JSON stringified into one env var
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDS),
    scopes: SCOPES,
  });
}

/** Calendar reads (availability, chat tool, gig sync). */
export async function getCalendarClient() {
  // Requires CALENDAR_ID shared with the service account's client_email.
  return google.calendar({ version: "v3", auth: getServiceAccountAuth() });
}
