import "./env.js";
import { google } from "googleapis";
import pool from "./db.js";

// Service account stays calendar-only. Owner OAuth also requests gmail.send so
// Render can deliver mail over HTTPS (free instances block outbound SMTP).
const CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const SCOPES = CALENDAR_SCOPES;

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  // Return null instead of throwing — callers fall back to the service account
  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

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

export async function saveOAuthTokens(tokens) {
  await pool.query(
    // COALESCE keeps an existing refresh_token when Google omits it on refresh
    `INSERT INTO oauth_tokens (provider, refresh_token, access_token, expiry, updated_at)
     VALUES ('google', $1, $2, $3, NOW())
     ON CONFLICT (provider) DO UPDATE SET
       refresh_token = COALESCE(EXCLUDED.refresh_token, oauth_tokens.refresh_token),
       access_token = EXCLUDED.access_token,
       expiry = EXCLUDED.expiry,
       updated_at = NOW()`,
    [
      tokens.refresh_token || null,
      tokens.access_token || null,
      tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    ]
  );
}

async function getStoredOAuthClient() {
  const oauth2 = getOAuth2Client();
  if (!oauth2) return null;

  const result = await pool.query(
    `SELECT refresh_token, access_token, expiry
     FROM oauth_tokens
     WHERE provider = 'google'
     LIMIT 1`
  );
  const row = result.rows[0];
  // Without a refresh token we cannot silently renew — treat as unconfigured
  if (!row?.refresh_token) return null;

  oauth2.setCredentials({
    refresh_token: row.refresh_token,
    access_token: row.access_token || undefined,
    expiry_date: row.expiry ? new Date(row.expiry).getTime() : undefined,
  });

  // Persist auto-refreshed tokens so the next cold start doesn't need a new consent
  oauth2.on("tokens", async (tokens) => {
    try {
      await saveOAuthTokens({
        refresh_token: tokens.refresh_token || row.refresh_token,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date,
      });
    } catch (err) {
      console.error("Failed to persist refreshed Google tokens:", err);
    }
  });

  return oauth2;
}

/** Prefer owner OAuth tokens; fall back to service account so availability never goes dark. */
export async function getCalendarClient() {
  const oauthClient = await getStoredOAuthClient();
  if (oauthClient) {
    return google.calendar({ version: "v3", auth: oauthClient });
  }

  const auth = getServiceAccountAuth();
  return google.calendar({ version: "v3", auth });
}

export function getOAuthConsentUrl(state = "owner") {
  const oauth2 = getOAuth2Client();
  if (!oauth2) {
    throw new Error("Google OAuth env vars are not configured");
  }

  return oauth2.generateAuthUrl({
    access_type: "offline",
    // Force consent so Google returns a refresh_token on re-connects
    prompt: "consent",
    scope: [...CALENDAR_SCOPES, GMAIL_SEND_SCOPE],
    state,
  });
}

/** Owner OAuth only — service accounts cannot send as a personal Gmail. */
export async function getGmailClient() {
  const oauthClient = await getStoredOAuthClient();
  if (!oauthClient) {
    throw new Error(
      "Google OAuth is not connected. Visit /api/oauth/google/start to grant Gmail send access."
    );
  }
  return google.gmail({ version: "v1", auth: oauthClient });
}

export async function exchangeOAuthCode(code) {
  const oauth2 = getOAuth2Client();
  if (!oauth2) {
    throw new Error("Google OAuth env vars are not configured");
  }

  const { tokens } = await oauth2.getToken(code);
  await saveOAuthTokens(tokens);
  return tokens;
}
