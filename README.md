# [jamesgeorgemusic.com](https://jamesgeorgemusic.com)

A high-impact, full-stack portfolio and automated business engine designed for my professional performance business. This platform integrates real-time scheduling, automated gig tracking, a dynamic media showcase, and a client reviews system to streamline the booking process, channel the necessary information seamlessly to potential clients and manage my performing career.

## Live Environment
* **Production Domain:** [jamesgeorgemusic.com](https://jamesgeorgemusic.com)
* **Frontend:** React 19 (Deployed on **Vercel**)
* **Backend:** Node.js/Express (Deployed on **Render**)
* **Database:** PostgreSQL (via **Neon**)
* **API Proxy:** `vercel.json` rewrites all `/api/*` requests to the Render backend, enabling a single unified domain with no CORS complexity in production.

---

## Tech Stack

### Frontend
* **React 19 & Vite:** Modern, fast, and component-based UI development.
* **Tailwind CSS 4:** Utility-first styling with high-performance CSS processing.
* **React Calendar:** Integrated date selection for booking workflows.
* **React Router DOM:** Seamless client-side navigation with per-route `document.title` management.
* **React Icons:** Scalable icon library used across UI components.
* **Vercel AI SDK (`@ai-sdk/react`):** Streaming chat UI with real-time token rendering.
* **React Markdown:** Renders formatted AI responses within the chat widget.
* **FadeInWrapper:** Custom transition component that wraps each page for smooth entry animations.

### Backend
* **Node.js & Express:** Scalable server architecture handling API requests and automation logic.
* **Neon & `pg`:** Managed PostgreSQL database with a direct `pg` client for gig tracking, reviews, and metadata.
* **Google APIs (googleapis):** Direct integration with Google Calendar for real-time availability.
* **Nodemailer:** Automated email delivery for booking requests and client communication.
* **Vercel AI SDK (`ai`) & `@ai-sdk/google`:** Server-side streaming integration with Google Gemini.
* **express-rate-limit:** Per-route rate limiting for chat, booking, and contact endpoints, centralised in `middleware/rateLimiters.js`.

### Tooling
* **Concurrently:** Synchronized local development for frontend and backend.
* **Dayjs:** Precision date and time manipulation.

---

## Core Features & Technical Implementation

### 1. Intelligent Booking Engine (Google Calendar API)
The system eliminates manual scheduling friction by syncing directly with a professional calendar.
* **Real-Time Availability:** Fetches live event data from the Google Calendar API.
* **Conflict Resolution:** Automatically identifies and crosses out occupied timeslots in the UI to prevent double-bookings.
* **Lead Generation:** A custom booking form captures client details, product selection, and event descriptions.

### 2. Automated Gig Tracker & Database
A sophisticated background service ensures the "Performance History" is always accurate without manual entry.
* **Keyword Detection:** Scans Google Calendar entries for specific keywords (e.g., "Wedding," "Corporate," "Studio Session").
* **Auto-Categorization:** Upon detecting a keyword, the system updates the database, categorizing the gig and updating total counts.
* **Temporal Tracking:** Gigs move from "Upcoming" to "Past" automatically based on timestamps, maintaining a living history of performances.

### 3. Performance Statistics API
Live gig counts are served from the database and consumed by the About page with an optimised prefetch strategy.
* **Prefetching:** `App.jsx` fires a `/api/stats` fetch on initial load so data is ready before the user navigates to `/about`, eliminating visible loading states in the common flow.
* **Animated Counters:** The About page animates each category count from zero to its current total using a 60fps `setInterval` loop.
* **Graceful Fallback:** If the prefetch hasn't resolved by the time the user lands on `/about`, a local fetch fires as a direct fallback.

### 4. AI Concierge Chatbot (Gemini 2.5 Flash)
A context-aware assistant pre-loaded with detailed knowledge of packages, gear, availability policy, and performance history.
* **Streaming Responses:** Uses the Vercel AI SDK to stream tokens in real-time, giving an instant, conversational feel.
* **Scoped System Prompt:** Locked to James George Music topics—pricing, styles, booking policy, and gear specs. Politely declines off-topic requests.
* **Markdown Rendering:** Responses with lists, bold text, and structure are rendered cleanly inside the chat widget.
* **Rate Limited:** Per-IP request limiting prevents abuse, with a graceful fallback message directing users to the contact form.
* **Graceful Error Handling:** Any failure (quota exceeded, network error, misconfiguration) surfaces a friendly message rather than a raw error.

### 5. Client Reviews System
A two-part feature handling both public display and private, token-gated submission.
* **Public Carousel:** `Reviews.jsx` renders a scroll-snap horizontal carousel pinned to the bottom of the hero section, pulling approved reviews from the database in real-time.
* **Half-Star Ratings:** Custom `StarDisplay` and `StarPicker` components support half-star precision for both display and submission, implemented via CSS `clip-path`.
* **Token-Gated Submission:** The `/leave-review` route is protected by a one-time token system. Clients receive a personalised link; the server validates the token before allowing a submission, preventing spam and unsolicited entries.
* **IntersectionObserver Navigation:** Dot-indicator navigation is driven by an `IntersectionObserver` tracking card visibility at 50% threshold—no scroll event listeners needed.

### 6. Contact & Booking Forms
Structured lead capture with automated email delivery on submission.
* **Rate Limited:** Independent per-route limits on contact and booking endpoints prevent spam.
* **Nodemailer Integration:** Submissions trigger an automated email directly to James with full client details.

---

## Server Architecture

The Express server is organised into four layers for maintainability:

| Layer | Path | Purpose |
| :--- | :--- | :--- |
| **Config** | `server/config/` | Environment loading (`env.js`), database client (`db.js`), and Google API auth (`google.js`) |
| **Middleware** | `server/middleware/rateLimiters.js` | Centralised `express-rate-limit` instances for each endpoint type |
| **Routes** | `server/routes/` | `availability.js`, `chat.js`, `contact.js`, `reviews.js`, `stats.js` |
| **Utils** | `server/utils/` | `email.js` (Nodemailer helpers) and `gigHelpers.js` (calendar keyword parsing & DB sync logic) |

---

## Environment Variables

To run this project, configure the following variables in a `.env` file within your `/server` directory:

| Variable | Description |
| :--- | :--- |
| `CALENDAR_ID` | The unique ID of the Google Calendar to sync with. |
| `EMAIL_USER` | The email address used to send automated notifications. |
| `EMAIL_PASS` | The App Password for the email account. |
| `GOOGLE_CREDS` | Stringified JSON of your Google Service Account credentials. |
| `DATABASE_URL` | The connection URL for your Neon PostgreSQL project. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key for Google Gemini (AI chatbot). Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `GOOGLE_CALENDAR_ID` | The calendar ID used for live availability sync. |
| `REVIEW_TOKEN_SECRET` | Secret used to generate and validate one-time review submission tokens. |

---

## Installation & Local Development

> **Note for reviewers:** The project is fully live at [jamesgeorgemusic.com](https://jamesgeorgemusic.com) — no local setup required to evaluate it.

### 1. Clone and Install Dependencies
Copy and paste this block to set up the entire project:

```bash
git clone https://github.com/jamesgeorgevdm/jamesgeorgemusic.git && cd jamesgeorgemusic && npm install && cd client && npm install && cd ../server && npm install && cd ..
```

### 2. Configure Environment
Create your environment file:
```bash
touch server/.env
```
*Populate `server/.env` with the keys listed in the **Environment Variables** section above.*

### 3. Launch Development Environment
Run both the frontend and backend simultaneously:
```bash
npm run dev
```

---

## Portfolio Context
This project demonstrates the fulfilment of my real-world business challenges such as administrative overhead and scheduling conflicts—through **Full-Stack Automation**. It highlights proficiency in RESTful API design, database management, and professional-grade frontend deployment.

---
© 2026 James George Music. All rights reserved.
