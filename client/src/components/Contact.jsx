import React, { useState } from "react";
import "./contact.css";
import FadeInWrapper from "./FadeInWrapper";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
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
      const response = await fetch(`${import.meta.env.VITE_API}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

      if (response.ok) {
        setFeedback("Message sent successfully!");
        setFormData({ email: "", subject: "", message: "" });
      } else {
        setFeedback("Error sending message. Please try again.");
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
    <main className="contact-container">
      <h2>Contact Me</h2>

      <section className="contact-card">
        <form onSubmit={handleSubmit} className="contact-form">
          <label htmlFor="contact-email" className="sr-only">Email Address</label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="contact-subject" className="sr-only">Subject</label>
          <input
            id="contact-subject"
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          <label htmlFor="contact-message" className="sr-only">Your Message</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Your Message"
            rows="6"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>

        {feedback && <output className="feedback">{feedback}</output>}
      </section>
    </main>
  </FadeInWrapper>
);
};

export default Contact;
