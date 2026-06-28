# [jamesgeorgemusic.com](https://jamesgeorgemusic.com)

A high-impact, full-stack portfolio and automated business engine designed for my professional performance business. This platform integrates real-time scheduling, automated gig tracking, and a dynamic media showcase to streamline the booking process, channel the necessary information seamlessly to potential clients and manage my performing career.

## Live Environment
* **Production Domain:** [jamesgeorgemusic.com](https://jamesgeorgemusic.com)
* **Frontend:** React 19 (Deployed on **Vercel**)
* **Backend:** Node.js/Express (Deployed on **Render**)
* **Database:** PostgreSQL (via **Neon**)

---

## Tech Stack

### Frontend
* **React 19 & Vite:** Modern, fast, and component-based UI development.
* **Tailwind CSS 4:** Utility-first styling with high-performance CSS processing.
* **React Calendar:** Integrated date selection for booking workflows.
* **React Router DOM:** Seamless client-side navigation.
* **Vercel AI SDK (`@ai-sdk/react`):** Streaming chat UI with real-time token rendering.
* **React Markdown:** Renders formatted AI responses within the chat widget.

### Backend
* **Node.js & Express:** Scalable server architecture handling API requests and automation logic.
* **Neon:** Managed PostgreSQL database for gig tracking and metadata.
* **Google APIs (googleapis):** Direct integration with Google Calendar for real-time availability.
* **Nodemailer:** Automated email delivery for booking requests and client communication.
* **Vercel AI SDK (`ai`) & `@ai-sdk/google`:** Server-side streaming integration with Google Gemini.
* **express-rate-limit:** Per-route rate limiting for chat, booking, and contact endpoints.

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

### 3. AI Concierge Chatbot (Gemini 2.5 Flash)
A context-aware assistant pre-loaded with detailed knowledge of packages, gear, availability policy, and performance history.
* **Streaming Responses:** Uses the Vercel AI SDK to stream tokens in real-time, giving an instant, conversational feel.
* **Scoped System Prompt:** Locked to James George Music topics—pricing, styles, booking policy, and gear specs. Politely declines off-topic requests.
* **Markdown Rendering:** Responses with lists, bold text, and structure are rendered cleanly inside the chat widget.
* **Rate Limited:** Per-IP request limiting prevents abuse, with a graceful fallback message directing users to the contact form.
* **Graceful Error Handling:** Any failure (quota exceeded, network error, misconfiguration) surfaces a friendly message rather than a raw error.

### 4. Contact & Booking Forms
Structured lead capture with automated email delivery on submission.
* **Rate Limited:** Independent per-route limits on contact and booking endpoints prevent spam.
* **Nodemailer Integration:** Submissions trigger an automated email directly to James with full client details.

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
