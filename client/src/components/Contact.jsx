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
      const response = await fetch("http://localhost:5000/contact", {
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
      <div className="contact-container">
        <h2>Contact Me</h2>

        <div className="contact-card">
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
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

          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      </div>
    </FadeInWrapper>
  );
};

export default Contact;
