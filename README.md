# [jamesgeorgemusic.com](https://jamesgeorgemusic.com)

This is the live site for my performance business — booking, availability, reviews, media, and an AI concierge that actually knows my packages and gear. I built it because the admin side of freelancing (chasing availability, logging gigs, fielding the same questions over and over) was eating time I wanted for music. So instead of bolting Calendly onto a Squarespace page, I made something that sits on top of tools I already use.

> **For reviewers:** the production site is live at [jamesgeorgemusic.com](https://jamesgeorgemusic.com). You don't need to run it locally to evaluate the product. Local setup is below if you want to dig into the code.

---

## Live Environment

| Piece | Choice |
| :--- | :--- |
| **Domain** | [jamesgeorgemusic.com](https://jamesgeorgemusic.com) |
| **Frontend** | React 19 + Vite on **Vercel** |
| **Backend** | Node/Express on **Render** |
| **Database** | PostgreSQL via **Neon** |
| **API routing** | `vercel.json` rewrites `/api/*` to the Render service so production is one domain |

---

## Why this architecture

### Split frontend / backend (Vercel + Render), not a monolith

I considered putting everything on one platform. In the end I kept the SPA on Vercel (where it belongs) and the API on Render.

**Trade-off:** Render can cold-start on the free/hobby tier, so the first API hit after idle is slower. I accepted that over paying for always-on infra while the business is still growing. The Vercel rewrite means clients never talk to a different origin in production, which killed a whole class of CORS headaches.

Locally, CORS is still locked to `localhost:5173` plus the real domains — belt and braces if someone hits the API directly.

### Vite SPA instead of Next.js

I looked at migrating to Next for SEO / prerendering. I stayed on Vite + React 19.

**Trade-off:** a SPA is weaker out of the box for crawlability than a server-rendered app. I mitigated with proper meta tags, sitemap, robots, and structured data rather than rewriting the whole stack mid-flight. For a site this size, the DX of Vite won. If organic search ever becomes the main growth channel, Next (or similar) is the obvious next move — I just didn't want to rewrite a working business tool for a maybe.

### Google Calendar as the source of truth for availability

I already run my life in Google Calendar. Building a second booking database that I'd have to keep in sync felt like inventing work.

The `/api/availability` route reads the day's events and returns blocked hourly slots. The booking UI crosses those out. All-day events block the whole working window (08:00–22:00). Past hours today are blocked too.

**Trade-offs I accepted:**
- Granularity is hourly, not minute-level. Fine for gigs; wrong for a dentist's office.
- A booking request does **not** write back to the calendar. It emails me (and the client) so I still confirm manually. Instant self-serve booking would be nicer UX, but I'd lose the ability to say no to a bad fit or a logistics nightmare. For now, human-in-the-loop is a feature, and I personally prefer the control.
- If Google's API is down, availability fails closed with a retry path in the UI rather than pretending everything is free.

### Email confirmations over a full booking platform

Nodemailer sends me the request and the client a "got it, I'll confirm" message. No PayStack checkout, no auto-hold on the calendar.

**Why:** There are many logistics to confirm with a client personally regarding actual times, needs, sound equipment, travel etc. - adding payment before it can be confirmed on my side is dangerous. Additionally the forms are rate-limited (10/hour per IP) so I'm not drowning in spam while I still sleep.

### Direct `pg` against Neon, no ORM

The schema is small — gig categories, processed calendar events, reviews, review tokens. An ORM would mostly be ceremony.

**Trade-off:** no fancy migrations story. For a project I own end-to-end, raw SQL I can read in five seconds beat another abstraction layer. Neon keeps Postgres managed so I'm not babysitting a VPS.

### Gig stats from calendar keywords, not manual entry

`gigHelpers.js` syncs past calendar events, matches keywords in the title (then description) against category rows, bumps a counter, and records the Google event ID so we never double-count.

**Trade-off:** this only works if I title gigs consistently ("Wedding", "Corporate", etc.). Uncategorised events are skipped on purpose — better to undercount than invent history. It's deliberately dumb and reliable rather than an NLP classifier for a few dozen events a month.

Stats are prefetched in `App.jsx` on first load so the About page counters are usually ready before anyone navigates there. If they're not, About falls back to its own fetch. No React Query — the site has one cache-worthy endpoint and a `useState` was enough.

### Reviews are invite-only (token-gated)

Public reviews sit in a scroll-snap carousel on the home page. Submission lives at `/leave-review` and requires a one-time DB token that I generate via an admin endpoint (`x-admin-secret`). Token is marked used after submit.

**Why not an open form or Google Reviews embed?** Spam and quality. I only want reviews from people who actually hired me. Linking out to Google is still useful for SEO elsewhere; this system is for *controlled* social proof on my own site.

Half-star ratings are custom CSS `clip-path` components — overkill maybe, but star libraries fought the design and I wanted 4.5 to look right.

### AI concierge (Gemini 2.5 Flash + Vercel AI SDK)

Streaming chat with a long, strict system prompt: packages, gear, booking policy, location timeline. It is deliberately **not** allowed to confirm bookings or invent links. Off-topic stuff gets a polite no. Rate-limited harder than the forms (30/hour) because LLMs are easy to abuse and potentially cost real money.

**Trade-offs:**
- Flash over a heavier model: latency and cost matter more than poetry for FAQ answers.
- Prompt-scoped knowledge goes stale if I change prices and forget to update the prompt. That's on me; the alternative was wiring the model into the DB for a chatbot that still shouldn't negotiate rates.
- When quota or the provider fails, the UI falls back to "use the contact form" instead of a stack trace.

### Server layout

Nothing fancy — four folders so future-me (or a reviewer) can find things:

| Layer | Path | Role |
| :--- | :--- | :--- |
| Config | `server/config/` | env, DB pool, Google auth |
| Middleware | `server/middleware/` | shared rate limiters |
| Routes | `server/routes/` | availability, chat, contact, reviews, stats |
| Utils | `server/utils/` | email helpers, gig sync / keyword logic |

---

## Tech Stack (short version)

**Frontend:** React 19, Vite, Tailwind 4, React Router, React Calendar, Vercel AI SDK (`@ai-sdk/react`), React Markdown, custom `FadeInWrapper` page transitions.

**Backend:** Express, `pg`, Google Calendar API (`googleapis`), Nodemailer, Vercel AI SDK + `@ai-sdk/google`, `express-rate-limit`.

**Tooling:** Concurrently for local dual-process dev, Dayjs (with timezone) for SA time (`Africa/Johannesburg`).

---

## Core features (what to click around)

1. **Booking** — live calendar sync, blocked slots, AbortController so flipping dates mid-fetch doesn't race.
2. **Gig tracker / stats** — keyword sync from Calendar → Neon → animated counters on About.
3. **AI chat** — streaming Gemini answers scoped to the business.
4. **Reviews** — public carousel + token-gated `/leave-review`.
5. **Contact / booking emails** — rate-limited Nodemailer paths.

---

## Environment Variables

Put these in `server/.env`:

| Variable | Description |
| :--- | :--- |
| `CALENDAR_ID` | Google Calendar ID used for availability + gig sync |
| `DATABASE_URL` | Neon Postgres connection string |
| `GOOGLE_CREDS` | Stringified JSON for the Google service account (fallback auth) |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP account + app password for Nodemailer |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini key ([Google AI Studio](https://aistudio.google.com/app/apikey)) |
| `ADMIN_SECRET` | Header secret for review tokens + OAuth start |
| `CLIENT_URL` | Base URL for generated review links (defaults to production) |
| `CRON_SECRET` | Header `x-cron-secret` for `/api/jobs/*` and `/api/sync-gigs` |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | Owner Calendar OAuth client |
| `GOOGLE_OAUTH_REDIRECT_URI` | e.g. `https://<render-host>/api/oauth/google/callback` |
| `GOOGLE_CALENDAR_WEBHOOK_URL` | e.g. `https://<render-host>/api/webhooks/google-calendar` |

See [SETUP_FOR_THURSDAY.md](./SETUP_FOR_THURSDAY.md) for deploy, cron, and OAuth steps.

Client uses `VITE_API` (see `client/.env.local`) — empty/same-origin in production thanks to the Vercel rewrite; point it at `http://localhost:5000` locally.

---

## Installation & Local Development

```bash
git clone https://github.com/jamesgeorgevdm/jamesgeorgemusic.git
cd jamesgeorgemusic
npm install && cd client && npm install && cd ../server && npm install && cd ..
```

Create `server/.env` with the variables above, then:

```bash
npm run dev
```

That runs Vite and the Express server together via Concurrently.

---

## What this project is actually about

It's not a tutorial CRUD app. It's a working tool for a real gigging business, which forced choices around trust (manual booking confirmation), cost (Flash, cold starts, no ORM), and honesty with the calendar I already live in. Happy to talk through any of the trade-offs above.

---

© 2026 James George Music. All rights reserved.
