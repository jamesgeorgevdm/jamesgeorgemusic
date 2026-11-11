import React, { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "./Seo";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/jamesgeorge.music/" },
  { label: "YouTube", href: "https://www.youtube.com/@jamesgeorgemusic" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61561533225129" },
];

const Contact = () => {
  const [formData, setFormData] = useState({ email: "", subject: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    // Controlled inputs — name attrs must match formData keys
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    // Prevents default browser behaviour, which is to reload the page
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
        setSent(true);
        // Clear fields so a refresh/resubmit doesn't resend the same message
        setFormData({ email: "", subject: "", message: "" });
      } else {
        const data = await response.json().catch(() => ({}));
        setFeedback(data.error || "The note didn't send. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFeedback("Something went quiet on the line. Please try again.");
    } finally {
      // Always re-enable the button whether send succeeded or failed
      setIsSending(false);
    }
  };

  return (
    <div className="jg-page jg-page-top">
      <Seo
        title="Contact | James George Music"
        description="Get in touch with James George Music for bookings, enquiries and custom performance requests across South Africa."
        path="/contact"
      />
      <div className="jg-wrap">
        <h1 className="jg-display jg-title rise" style={{ "--i": 0 }}>Contact <em>me</em></h1>
        <div className="jg-ct-grid">
          <section className="rise" style={{ "--i": 1 }} aria-label="Contact form">
            {sent ? (
              <div role="status">
                <p className="jg-display" style={{ fontSize: "2rem", color: "var(--gold-2)" }}>Thank you.</p>
                <p className="jg-lead" style={{ marginTop: 12 }}>I&apos;ll sit with this and write back soon.</p>
              </div>
            ) : (
              <form className="jg-ct-form" onSubmit={handleSubmit}>
                <p className="jg-lead">
                  Got a question? Whether it&apos;s a wedding, a quiet dinner, or something not yet named, a few lines is enough.
                </p>
                <div className="jg-field">
                  <label htmlFor="contact-email">Your email</label>
                  <input id="contact-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="jg-field">
                  <label htmlFor="contact-subject">Subject</label>
                  <input id="contact-subject" type="text" name="subject" placeholder="A question about a booking" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="jg-field">
                  <label htmlFor="contact-message">Your note</label>
                  <textarea id="contact-message" name="message" rows={6} minLength={10} placeholder="Write as much or as little as you like" value={formData.message} onChange={handleChange} required />
                </div>
                <button type="submit" className="jg-btn jg-btn-solid" disabled={isSending}>
                  {isSending ? "Sending…" : <>Send the note <span className="jg-arrow" aria-hidden="true">→</span></>}
                </button>
                <output className="jg-msg" aria-live="polite">{feedback}</output>
              </form>
            )}
          </section>
          <aside className="jg-elsewhere rise" style={{ "--i": 2 }}>
            <h3 className="jg-display">Elsewhere</h3>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label} <span className="jg-arrow" aria-hidden="true">→</span></a>
                </li>
              ))}
            </ul>
            <p>
              For a date already in mind, <Link to="/booking">book a time</Link> instead. Or write directly
              to <a href="mailto:jamesv234@gmail.com">jamesv234@gmail.com</a>.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
