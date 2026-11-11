import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import Seo from "./Seo";

const products = [
  { name: "Restaurant", price: "Standard local rates" },
  { name: "Corporate", price: "R1,800/h" },
  { name: "Wedding", price: "R3,500 all-inclusive package" },
  { name: "Private", price: "R1,500/h" },
  { name: "Solo Show / Musical Showcase", price: "Negotiable" },
];

const times = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

// Local Y-M-D — avoid toLocaleDateString("en-CA") (unreliable on Windows) and
// toISOString (UTC shifts SAST midnight back a day)
const toDateStr = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

const emptyForm = { name: "", email: "", phone: "", product: "", message: "", startTime: "", endTime: "" };

function Booking() {
  // Start true so the first paint never shows empty slots as "all free"
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [retryController, setRetryController] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  // Keeps the stamped ticket filled in after the form clears
  const [lastSent, setLastSent] = useState(null);

  // Separated into its own function so it can be called by both
  // the useEffect and the retry button
  const fetchAvailability = async (date, signal) => {
    setIsLoading(true);
    setAvailabilityError(false);
    // Drop previous day's blocks immediately — never flash stale/empty as open
    setBlockedTimes([]);
    const dateStr = toDateStr(date);
    // Render cold-starts often kill the first proxied request; retry wakes the instance
    const maxAttempts = 3;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (signal?.aborted) return;
        try {
          const res = await fetch(
            // signal allows AbortController to cancel this request if date changes mid-fetch
            `${import.meta.env.VITE_API || ""}/api/availability?date=${dateStr}`,
            { signal }
          );
          if (!res.ok) throw new Error(`Availability HTTP ${res.status}`);
          const data = await res.json();
          if (signal?.aborted) return;
          setBlockedTimes(Array.isArray(data.blocked) ? data.blocked : []);
          return;
        } catch (err) {
          if (err.name === "AbortError") return; // ignore cancelled requests
          if (attempt === maxAttempts) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        }
      }
    } catch (err) {
      if (err.name === "AbortError" || signal?.aborted) return;
      console.error("Availability fetch error:", err);
      setAvailabilityError(true);
    } finally {
      // Aborted fetch must NOT clear loading — a newer request owns that flag
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // New Abort Controller created each time for each request
    const controller = new AbortController();
    // Clear timeslot when the date changes so a prior selection can't ride over
    setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
    fetchAvailability(selectedDate, controller.signal);
    return () => controller.abort();
  }, [selectedDate]);

  const handleChange = (e) => {
    setSent(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeClick = (time) => {
    if (blockedTimes.includes(time)) return;
    setSent(false);

    // No start time — set clicked time as start, clear stale endTime
    if (!formData.startTime) {
      setFormData({ ...formData, startTime: time, endTime: "" });
      return;
    }
    // Start set, no end — validate range
    if (!formData.endTime) {
      const startIdx = times.indexOf(formData.startTime);
      const endIdx = times.indexOf(time);

      if (endIdx <= startIdx) {
        setFormData({ ...formData, startTime: time, endTime: "" });
        return;
      }
      // +1 makes slice inclusive of end slot
      const between = times.slice(startIdx, endIdx + 1);
      if (between.some(t => blockedTimes.includes(t))) return;

      setFormData({ ...formData, endTime: time });
      return;
    }
    // Both set — reset and treat click as new start
    setFormData({ ...formData, startTime: time, endTime: "" });
  };

  // Called on every timeslot button on each render
  const isHighlighted = (time) => {
    if (time === formData.startTime) return true;
    if (!formData.startTime || !formData.endTime) return false;
    const idx = times.indexOf(time);
    // Returns true if slot's index falls between start and end (inclusive)
    return idx >= times.indexOf(formData.startTime) && idx <= times.indexOf(formData.endTime);
  };

  const handleSubmit = async (e) => {
    // Prevents default browser behaviour, which is to reload the page
    e.preventDefault();
    if (!formData.startTime || !formData.endTime) {
      setFeedback("Choose a start and end time.");
      return;
    }

    setIsSending(true);
    setFeedback("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API || ""}/api/send-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: toDateStr(selectedDate) }),
      });

      if (response.ok) {
        setFeedback("Request sent. James will confirm by email.");
        setSent(true);
        setLastSent(formData);
        setFormData(emptyForm);
      } else {
        const data = await response.json();
        // Surface validation errors from server errors array if present
        if (data.errors) {
          setFeedback(data.errors.join(" "));
        } else {
          setFeedback(data.error || "Error sending booking. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setFeedback("An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const retry = () => {
    // Cancel any in-flight retry before starting a new one
    if (retryController) retryController.abort();
    const controller = new AbortController();
    setRetryController(controller);
    fetchAvailability(selectedDate, controller.signal);
  };

  const t = sent && lastSent ? lastSent : formData;
  const product = products.find((p) => p.name === t.product);
  const timeLabel = t.startTime && t.endTime
    ? `${t.startTime} - ${t.endTime}`
    : t.startTime ? `From ${t.startTime}` : "";

  const renderSlots = () => {
    if (isLoading) {
      return (
        <div className="jg-slots" aria-busy="true">
          {times.map((t) => <div key={t} className="jg-skel jg-slot-skel" />)}
        </div>
      );
    }
    if (availabilityError) {
      return (
        <div>
          <p className="jg-slot-note" style={{ marginTop: 0 }}>Couldn't load availability for this day.</p>
          <button type="button" className="jg-btn jg-btn-line" style={{ marginTop: 12 }} onClick={retry}>Try again</button>
        </div>
      );
    }
    if (blockedTimes.length === times.length) {
      return <p className="jg-slot-note" style={{ marginTop: 0 }}>Fully booked on this day. Try another date.</p>;
    }
    return (
      <>
        <div className="jg-slots">
          {times.map((time) => {
            const blocked = blockedTimes.includes(time);
            return (
              <button
                type="button"
                key={time}
                className={`jg-slot ${isHighlighted(time) ? "sel" : ""}`}
                onClick={() => handleTimeClick(time)}
                disabled={blocked}
                aria-pressed={isHighlighted(time)}
                aria-label={blocked ? `${time} unavailable` : time}
              >
                {time}
              </button>
            );
          })}
        </div>
        <p className="jg-slot-note">
          {formData.startTime && formData.endTime
            ? `Selected ${formData.startTime} - ${formData.endTime}`
            : formData.startTime
            ? "Now choose an end time."
            : "Choose a start time, then an end time."}
        </p>
      </>
    );
  };

  return (
    <div className="jg-page jg-page-top">
      <Seo
        title="Book Now | James George Music"
        description="Check real-time availability and request your booking for weddings, corporate events and private functions with James George Music."
        path="/booking"
      />
      <div className="jg-wrap">
        <h1 className="jg-display jg-title rise" style={{ "--i": 0 }}>Book <em>a date</em></h1>
        <div className="jg-bk-grid">
          <form className="jg-form rise" style={{ "--i": 1 }} onSubmit={handleSubmit}>
            <div className="jg-field">
              <label htmlFor="date">Event date</label>
              <DatePicker id="date" value={selectedDate} onChange={setSelectedDate} minDate={new Date()} />
            </div>
            <div className="jg-field">
              <label htmlFor="product">Occasion</label>
              <select id="product" name="product" value={formData.product} onChange={handleChange} required>
                <option value="">Choose an occasion</option>
                {products.map((prod) => (
                  <option key={prod.name} value={prod.name}>{prod.name}</option>
                ))}
              </select>
            </div>

            <fieldset className="jg-field full" style={{ border: 0, padding: 0, margin: 0 }} aria-live="polite">
              <legend className="jg-label" style={{ marginBottom: 10 }}>Time</legend>
              {renderSlots()}
            </fieldset>

            <div className="jg-field">
              <label htmlFor="name">Your name</label>
              <input id="name" type="text" name="name" autoComplete="name" placeholder="Full name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="jg-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" name="phone" autoComplete="tel" placeholder="082 000 0000" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="jg-field full">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="jg-field full">
              <label htmlFor="message">About your event</label>
              <textarea id="message" name="message" rows="5" placeholder="Venue, timings, a song you'd love to hear" value={formData.message} onChange={handleChange} required />
            </div>

            <button type="submit" className="jg-btn jg-btn-solid" disabled={isSending}>
              {isSending ? "Sending…" : <>Request this date <span className="jg-arrow" aria-hidden="true">→</span></>}
            </button>
            <output className="jg-msg full" aria-live="polite">{feedback}</output>
          </form>

          {/* Live ticket: mirrors the form so visitors see their booking take shape */}
          <div className="jg-ticket-wrap rise" style={{ "--i": 2 }} aria-hidden="true">
            <div className={`jg-ticket ${sent ? "sent" : ""}`}>
              <div className="jg-ticket-main">
                <div className="jg-t-top"><b>James George</b><span>Live performance</span></div>
                <dl className="jg-t-fields">
                  <div><dt>Occasion</dt><dd className={t.product ? "" : "empty"}>{t.product || "Choose an occasion"}</dd></div>
                  <div><dt>Fee</dt><dd className={product ? "" : "empty"}>{product ? product.price : "Shown here"}</dd></div>
                  <div><dt>Host</dt><dd className={t.name.trim() ? "" : "empty"}>{t.name.trim() || "Your name"}</dd></div>
                  <div><dt>Time</dt><dd className={timeLabel ? "" : "empty"}>{timeLabel || "Pick a time"}</dd></div>
                </dl>
              </div>
              <div className="jg-t-stub">
                <div className="jg-t-day">{String(selectedDate.getDate()).padStart(2, "0")}</div>
                <div className="jg-t-mon">{selectedDate.toLocaleDateString("en-ZA", { month: "short" })}</div>
                <div className="jg-t-year">{selectedDate.getFullYear()}</div>
              </div>
              <div className="jg-stamp">Requested</div>
            </div>
            <p className="jg-ticket-note">Your ticket fills in as you go. Times come from James's live calendar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
