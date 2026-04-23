import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./booking.css";
import FadeInWrapper from "./FadeInWrapper";

const products = [
  { name: "Restaurant", price: "R500/h" },
  { name: "Corporate", price: "R1,200/h" },
  { name: "Wedding", price: "R3,500 all-inclusive package" },
  { name: "Private", price: "R1,000/h" },
  { name: "Solo Show / Musical Showcase", price: "Negotiable" },
];

const times = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function Booking() {
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
  const fetchAvailability = async () => {
    setIsLoading(true);
    const dateStr = selectedDate.toLocaleDateString("en-CA");
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/api/availability?date=${dateStr}`);
      const data = await res.json();
      setBlockedTimes(data.blocked || []);
    } catch (err) {
      console.error("Availability fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchAvailability();
}, [selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeClick = (time) => {
  if (blockedTimes.includes(time)) return;

  if (!formData.startTime) {
    setFormData({ ...formData, startTime: time, endTime: "" });
    return;
  }

  if (!formData.endTime) {
    const startIdx = times.indexOf(formData.startTime);
    const endIdx = times.indexOf(time);

    if (endIdx <= startIdx) {
      setFormData({ ...formData, startTime: time, endTime: "" });
      return;
    }

    const between = times.slice(startIdx, endIdx + 1);
    if (between.some(t => blockedTimes.includes(t))) {
      return; // stops crossing blocked hours
    }

    setFormData({ ...formData, endTime: time });
    return;
  }

  setFormData({ ...formData, startTime: time, endTime: "" });
};

  const isHighlighted = (time) => {
    if (!formData.startTime || !formData.endTime) return false;
    const startIdx = times.indexOf(formData.startTime);
    const endIdx = times.indexOf(formData.endTime);
    const idx = times.indexOf(time);
    return idx >= startIdx && idx <= endIdx;
  };

  const handleSubmit = async (e) => {
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
        setFormData({
          name: "",
          email: "",
          phone: "",
          product: "",
          message: "",
          startTime: "",
          endTime: "",
        });
      } else {
        setFeedback("Error sending booking. Please try again.");
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
    <main className="booking-container">
      <h1>Booking</h1>
      <p>Select a date, choose a product, and pick your timeslot.</p>

      <section aria-label="Select Date">
        <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
      </section>

      <h2 className="timeslot-title">Select Timeslot</h2>
      
      <section className="timeslot-grid" aria-live="polite">
        {isLoading ? (
          <p>Checking availability...</p>
        ) : blockedTimes.length === times.length ? (
          <p>Fully booked for this day.</p>
        ) : (
          times.map((time) => (
            <button
              type="button" 
              key={time}
              title={blockedTimes.includes(time) ? "Unavailable" : ""}
              className={`timeslot 
                ${isHighlighted(time) ? "highlighted" : ""} 
                ${blockedTimes.includes(time) ? "blocked" : ""}`}
              onClick={() => handleTimeClick(time)}
              disabled={blockedTimes.includes(time)}
            >
              {time}
            </button>
          ))
        )}
      </section>

      <p className="selected-times">
        {formData.startTime && formData.endTime
          ? `Selected: ${formData.startTime} - ${formData.endTime}`
          : formData.startTime
          ? `Selected start: ${formData.startTime}`
          : "No timeslot selected"}
      </p>

      <form className="booking-form" onSubmit={handleSubmit}>
  
  <label htmlFor="product" className="sr-only">Select Service</label>
  <select id="product" name="product" value={formData.product} onChange={handleChange} required>
    <option value="">Select a product</option>
    {products.map((prod, index) => (
      <option key={index} value={prod.name}>
        {prod.name} – {prod.price}
      </option>
    ))}
  </select>

  <label htmlFor="name" className="sr-only">Your Name</label>
  <input id="name" type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
  
  <label htmlFor="email" className="sr-only">Your Email</label>
  <input id="email" type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
  
  <label htmlFor="phone" className="sr-only">Your Phone Number</label>
  <input id="phone" type="tel" name="phone" placeholder="Your Phone Number" value={formData.phone} onChange={handleChange} required />
  
  <label htmlFor="message" className="sr-only">Message</label>
  <textarea id="message" name="message" placeholder="Describe your event" rows="6" value={formData.message} onChange={handleChange} required />

  <button type="submit" disabled={isSending}>
    {isSending ? "Sending..." : "Send Booking Request"}
  </button>
</form>

      {feedback && <output className="feedback">{feedback}</output>}
    </main>
  </FadeInWrapper>
);
}

export default Booking;
