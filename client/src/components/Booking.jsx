import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

const products = [
  { name: "Restaurant", price: "R500/h" },
  { name: "Corporate", price: "R1,200/h" },
  { name: "Wedding", price: "R3,500 all-inclusive package" },
  { name: "Private", price: "R1,000/h" },
  { name: "Solo Show / Musical Showcase", price: "Negotiable" },
];

const times = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const inputClass = "font-['Crimson_Pro'] p-[0.9rem] rounded-lg border border-[rgba(212,175,55,0.4)] bg-[#0f2240] text-[#fdfaf3] text-base w-full focus:outline-none focus:border-[#d4af37] focus:shadow-[0_0_10px_rgba(212,175,55,0.2)]";

function Booking() {
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [retryController, setRetryController] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    message: "",
    startTime: "",
    endTime: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Separated into its own function so it can be called by both
  // the useEffect and the retry button
  const fetchAvailability = async (date, signal) => {
    setIsLoading(true);
    setAvailabilityError(false);
    // en-CA gives YYYY-MM-DD format — unambiguous, matches backend expectation
    const dateStr = date.toLocaleDateString("en-CA");
    try {
      const res = await fetch(
        // signal allows AbortController to cancel this request if date changes mid-fetch
        `${import.meta.env.VITE_API}/api/availability?date=${dateStr}`,
        { signal }
      );
      const data = await res.json();
      setBlockedTimes(data.blocked || []);
    } catch (err) {
      if (err.name === "AbortError") return; // ignore cancelled requests
      console.error("Availability fetch error:", err);
      setAvailabilityError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // New Abort Controller created each time for each request
    const controller = new AbortController();
    fetchAvailability(selectedDate, controller.signal);
    return () => controller.abort();
  }, [selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeClick = (time) => {
    if (blockedTimes.includes(time)) return;

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
    if (!formData.startTime || !formData.endTime) return false;
    const startIdx = times.indexOf(formData.startTime);
    const endIdx = times.indexOf(formData.endTime);
    const idx = times.indexOf(time);
    // Returns true if slot's index falls between startIdx and endIdx (inclusive)
    return idx >= startIdx && idx <= endIdx;
  };

  const handleSubmit = async (e) => {
    // Prevents default browser behaviour, which is to reload the page
    e.preventDefault();
    if (!formData.startTime || !formData.endTime) {
      setFeedback("Please select a timeslot.");
      return;
    }

    setIsSending(true);
    setFeedback("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API}/api/send-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: selectedDate }),
      });

      if (response.ok) {
        setFeedback("Booking request sent successfully!");
        setFormData({ name: "", email: "", phone: "", product: "", message: "", startTime: "", endTime: "" });
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

  return (
    <FadeInWrapper>
      <Seo
        title="Book Now | James George Music"
        description="Check real-time availability and request your booking for weddings, corporate events and private functions with James George Music."
        path="/booking"
      />
      <main className="pt-32 max-md:pt-24 px-8 pb-16 text-center bg-[#0b1a2e] text-[#fdfaf3] min-h-screen flex flex-col items-center font-['Crimson_Pro']">
        <h1 className="font-['BruneyClassy'] text-5xl mb-4 text-[#f1d97c]">Booking</h1>
        <p className="text-[1.1rem] mb-8">Select a date, choose a product, and pick your timeslot.</p>

        <section aria-label="Select Date">
          <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
        </section>

        <h2 className="font-['BruneyClassy'] text-[2rem] mt-12 text-[#f1d97c]">Select Timeslot</h2>

        <section
          className="grid grid-cols-3 md:grid-cols-6 gap-3 my-6 mx-auto w-[95%] md:w-full md:max-w-[700px]"
          aria-live="polite"
        >
          {isLoading ? (
            <p className="col-span-full text-center m-0">Checking availability...</p>
          ) : availabilityError ? (
            <div className="col-span-full flex flex-col items-center gap-4">
              <p>Couldn't load availability. Please try again.</p>
              <button
                type="button"
                className="bg-[#d4af37] font-['BruneyClassy'] text-[#0b1a2e] p-4 border-none rounded-lg cursor-pointer font-bold text-[1.1rem] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
                onClick={() => {
                  // Cancel any in-flight retry before starting a new one
                  if (retryController) retryController.abort();
                  const controller = new AbortController();
                  setRetryController(controller);
                  fetchAvailability(selectedDate, controller.signal);
                }}
              >
                {isLoading ? "Retrying..." : "Retry"}
              </button>
            </div>
          ) : blockedTimes.length === times.length ? (
            <p className="col-span-full text-center m-0">Fully booked for this day.</p>
          ) : (
            times.map((time) => (
              <button
                type="button"
                key={time}
                title={blockedTimes.includes(time) ? "Unavailable" : ""}
                className={`p-[0.7rem] border rounded-lg font-['Crimson_Pro'] transition-all duration-200
                  ${blockedTimes.includes(time)
                    ? "bg-[#1a1a1a] text-[#555] line-through cursor-not-allowed opacity-50 border-[#333]"
                    : isHighlighted(time)
                    ? "bg-[#d4af37] text-[#0b1a2e] font-bold border-[#f1d97c] cursor-pointer"
                    : "bg-[#0f2240] text-white border-[#d4af37] cursor-pointer hover:bg-[#1a3357] hover:-translate-y-[2px] hover:border-[#f1d97c]"
                  }`}
                onClick={() => handleTimeClick(time)}
                disabled={blockedTimes.includes(time)}
              >
                {time}
              </button>
            ))
          )}
        </section>

        <p className="mt-6 font-['Crimson_Pro'] text-[1.2rem] text-[#f1d97c] italic">
          {formData.startTime && formData.endTime
            ? `Selected: ${formData.startTime} - ${formData.endTime}`
            : formData.startTime
            ? `Selected start: ${formData.startTime}`
            : "No timeslot selected"}
        </p>

        <form
          className="flex flex-col w-full max-w-[550px] mx-auto mt-12 gap-[1.2rem]"
          onSubmit={handleSubmit}
        >
          <label htmlFor="product" className="sr-only">Select Service</label>
          <select id="product" name="product" value={formData.product} onChange={handleChange} required className={inputClass}>
            <option value="">Select a product</option>
            {products.map((prod, index) => (
              <option key={index} value={prod.name}>
                {prod.name} – {prod.price}
              </option>
            ))}
          </select>

          <label htmlFor="name" className="sr-only">Your Name</label>
          <input id="name" type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required className={inputClass} />

          <label htmlFor="email" className="sr-only">Your Email</label>
          <input id="email" type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required className={inputClass} />

          <label htmlFor="phone" className="sr-only">Your Phone Number</label>
          <input id="phone" type="tel" name="phone" placeholder="Your Phone Number" value={formData.phone} onChange={handleChange} required className={inputClass} />

          <label htmlFor="message" className="sr-only">Message</label>
          <textarea id="message" name="message" placeholder="Describe your event" rows="6" value={formData.message} onChange={handleChange} required className={inputClass} />

          <button
            type="submit"
            disabled={isSending}
            className="bg-[#d4af37] font-['BruneyClassy'] text-[#0b1a2e] p-4 border-none rounded-lg cursor-pointer font-bold text-[1.1rem] mt-4 transition-all duration-300 hover:not-disabled:bg-[#f1d97c] hover:not-disabled:-translate-y-[2px] hover:not-disabled:shadow-[0_5px_15px_rgba(241,217,124,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send Booking Request"}
          </button>
        </form>

        {feedback && (
          <output className="mt-6 font-['Crimson_Pro'] font-bold text-[#f1d97c] text-[1.2rem]">
            {feedback}
          </output>
        )}
      </main>
    </FadeInWrapper>
  );
}

export default Booking;
