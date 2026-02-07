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

// Generate hourly timeslots (08:00–22:00)
const times = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function Booking() {
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

  // Fetch blocked times from backend when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      const dateStr = selectedDate.toISOString().split("T")[0];
      try {
        const res = await fetch(`http://localhost:5000/api/availability?date=${dateStr}`);
        const data = await res.json();
        setBlockedTimes(data.blocked || []);
      } catch (err) {
        console.error("Availability fetch error:", err);
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Timeslot selection
  const handleTimeClick = (time) => {
    if (blockedTimes.includes(time)) return; // prevent selecting blocked
    if (!formData.startTime) {
      setFormData({ ...formData, startTime: time, endTime: "" });
    } else if (!formData.endTime) {
      if (times.indexOf(time) > times.indexOf(formData.startTime)) {
        setFormData({ ...formData, endTime: time });
      } else {
        // Reset if clicked earlier time
        setFormData({ ...formData, startTime: time, endTime: "" });
      }
    } else {
      // Reset selection if both already chosen
      setFormData({ ...formData, startTime: time, endTime: "" });
    }
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
    setIsSending(true);
    setFeedback("");

    try {
      const response = await fetch("http://localhost:5000/api/send-booking", {
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
    <div className="booking-container">
      <h1>Booking</h1>
      <p>Select a date, choose a product, and pick your timeslot.</p>

      {/* Calendar */}
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      {/* Timeslot Grid */}
      <h3 className="timeslot-title">Select Timeslot</h3>
      <div className="timeslot-grid">
        {times.map((time) => (
          <div
            key={time}
            className={`timeslot 
              ${isHighlighted(time) ? "highlighted" : ""} 
              ${blockedTimes.includes(time) ? "blocked" : ""}`}
            onClick={() => handleTimeClick(time)}
          >
            {time}
          </div>
        ))}
      </div>
      <p className="selected-times">
        {formData.startTime && formData.endTime
          ? `Selected: ${formData.startTime} - ${formData.endTime}`
          : formData.startTime
          ? `Selected start: ${formData.startTime}`
          : "No timeslot selected"}
      </p>

      {/* Booking Form */}
      <form className="booking-form" onSubmit={handleSubmit}>
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
        >
          <option value="">Select a product</option>
          {products.map((prod, index) => (
            <option key={index} value={prod.name}>
              {prod.name} – {prod.price}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Your Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Describe your event"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send Booking Request"}
        </button>
      </form>

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
    </FadeInWrapper>
  );
}

export default Booking;
