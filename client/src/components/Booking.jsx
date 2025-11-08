import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./booking.css";

const products = [
  { name: "Restaurant", price: "R500/h" },
  { name: "Corporate", price: "R1,200/h" },
  { name: "Weddings", price: "R3,500 all-inclusive package" },
  { name: "Private", price: "R1,000/h" },
  { name: "Musical Showcase Performance", price: "Negotiable" },
];

function Booking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="booking-container">
      <h1>Booking</h1>
      <p>Select a date from the calendar below, select a product, and fill out your details.</p>

      {/* Calendar */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
      />

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
  );
}

export default Booking;
