import React, { useState } from "react";
import { Link } from "react-router-dom";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

const fieldBase =
  "peer w-full bg-transparent border-0 border-b border-[#D4A455]/25 rounded-none px-0 py-3 font-['Crimson_Pro'] text-[1.05rem] md:text-[1.1rem] text-[#F6F2ED] placeholder-transparent caret-[#D4A455] focus:outline-none focus:border-[#D4A455] transition-[border-color] duration-300";

function Field({ id, label, as: Tag = "input", className = "", ...props }) {
  return (
    <div className="relative">
      <Tag
        id={id}
        placeholder={label}
        className={`${fieldBase} ${className}`}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-3 origin-left text-[#F6F2ED]/40 text-[1.05rem] pointer-events-none transition-all duration-300 peer-focus:-top-2 peer-focus:text-[0.68rem] peer-focus:tracking-[0.16em] peer-focus:uppercase peer-focus:text-[#D4A455] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[0.68rem] peer-[:not(:placeholder-shown)]:tracking-[0.16em] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:text-[#D4A455]/80"
      >
        {label}
      </label>
    </div>
  );
}

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
    <FadeInWrapper>
      <Seo
        title="Contact | James George Music"
        description="Get in touch with James George Music for bookings, enquiries and custom performance requests across South Africa."
        path="/contact"
      />
      <main className="relative isolate min-h-screen overflow-hidden bg-[#070e18] text-[#F6F2ED] font-['Crimson_Pro']">
        {/* Stage-light blooms — cinematic atmosphere behind the letter */}
        <div
          className="contact-orb-a pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#D4A455]/18 blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="contact-orb-b pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-[#1a3357]/80 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#070e18_100%)]"
          aria-hidden="true"
        />
        <div className="contact-grain" aria-hidden="true" />

        <div className="relative z-[1] mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-20 items-center px-6 sm:px-10 pt-28 pb-16 md:pt-36 md:pb-24">
          <header className="text-left max-w-md">
            <p className="m-0 mb-5 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#D4A455]">
              A private note
            </p>
            <h1 className="font-['BruneyClassy'] text-[2.6rem] sm:text-[3.2rem] md:text-[3.6rem] leading-[1.15] text-[#f1d97c] m-0 mb-6">
              Contact me
            </h1>
            <div
              className="w-16 h-px mb-8 bg-gradient-to-r from-[#D4A455] to-transparent"
              aria-hidden="true"
            />
            <p className="m-0 mb-6 text-[1.08rem] sm:text-[1.15rem] leading-[1.85] text-[#F6F2ED]/78 italic">
              Got a question? Whether it's a wedding, a quiet dinner, or something not yet named;
              a few lines is enough.
            </p>
            <p className="m-0 text-[0.95rem] leading-relaxed text-[#F6F2ED]/50">
              For a date already in mind,{" "}
              <Link
                to="/booking"
                className="text-[#D4A455] no-underline border-b border-[#D4A455]/40 pb-px transition-colors duration-300 hover:text-[#f1d97c] hover:border-[#f1d97c]"
              >
                book a time
              </Link>
              {" "}instead. Or write directly to{" "}
              <a
                href="mailto:jamesv234@gmail.com"
                className="text-[#D4A455] no-underline border-b border-[#D4A455]/40 pb-px transition-colors duration-300 hover:text-[#f1d97c] hover:border-[#f1d97c]"
              >
                jamesv234@gmail.com
              </a>
              .
            </p>
          </header>

          <section
            aria-label="Contact form"
            className="relative w-full max-w-xl lg:max-w-none lg:justify-self-stretch"
          >
            {sent ? (
              <div
                className="flex min-h-[22rem] flex-col justify-center text-left"
                role="status"
              >
                <p className="font-['BruneyClassy'] text-[2rem] sm:text-[2.4rem] text-[#f1d97c] m-0 mb-4">
                  Thank you.
                </p>
                <div className="w-12 h-px mb-6 bg-[#D4A455]/70" aria-hidden="true" />
                <p className="m-0 text-[1.1rem] leading-relaxed text-[#F6F2ED]/75 italic">
                  I&apos;ll sit with this and write back soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-9 text-left">
                <Field
                  id="contact-email"
                  label="Your email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

                <Field
                  id="contact-subject"
                  label="Subject?"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <Field
                  id="contact-message"
                  label="Your note"
                  as="textarea"
                  name="message"
                  rows={6}
                  minLength={10}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="min-h-[10.5rem] resize-y leading-7 bg-[repeating-linear-gradient(transparent,transparent_1.7rem,rgba(212,164,85,0.07)_1.7rem,rgba(212,164,85,0.07)_calc(1.7rem+1px))]"
                />

                <button
                  type="submit"
                  disabled={isSending}
                  className="group inline-flex items-center justify-center gap-3 self-start min-h-11 bg-transparent border-0 border-b border-[#D4A455] rounded-none px-0 py-3 font-['BruneyClassy'] text-[1.15rem] text-[#f1d97c] cursor-pointer transition-[color,border-color,opacity] duration-300 hover:text-[#ffd700] hover:border-[#ffd700] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending…" : "Send the note"}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>

                {feedback && (
                  <output className="block text-[0.95rem] text-[#F6F2ED]/70 italic" aria-live="polite">
                    {feedback}
                  </output>
                )}
              </form>
            )}
          </section>
        </div>
      </main>
    </FadeInWrapper>
  );
};

export default Contact;
