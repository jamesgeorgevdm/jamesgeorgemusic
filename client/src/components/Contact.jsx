import React, { useState } from "react";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

const Contact = () => {
  const [formData, setFormData] = useState({ email: "", subject: "", message: "" });
  const [isSending, setIsSending] = useState(false);
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
        setFeedback("Message sent successfully!");
        // Clear fields so a refresh/resubmit doesn't resend the same message
        setFormData({ email: "", subject: "", message: "" });
      } else {
        setFeedback("Error sending message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFeedback("An unexpected error occurred. Please try again.");
    } finally {
      // Always re-enable the button whether send succeeded or failed
      setIsSending(false);
    }
  };

  const inputClass = "font-['Crimson_Pro'] p-[1.2rem] max-md:p-4 text-[1.15rem] max-md:text-base rounded-[10px] border-2 border-[#88732d] bg-[#0b1a2e] text-[#fdfaf3] focus:outline-none focus:shadow-[0_0_15px_#d4af37] w-full";

  return (
    <FadeInWrapper>
      <Seo
        title="Contact | James George Music"
        description="Get in touch with James George Music for bookings, enquiries and custom performance requests across South Africa."
        path="/contact"
      />
      <main className="min-h-screen pt-[13rem] px-8 pb-12 text-center text-[#fdfaf3] bg-[#0b1a2e] box-border">
        <h2 className="font-['BruneyClassy'] text-5xl mt-0 mb-14 text-[#f1d97c]">Contact Me</h2>

        <section className="bg-[#0f2240] border-2 border-[#88732d] rounded-[20px] py-12 px-8 max-md:py-8 max-md:px-4 max-w-[700px] mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <label htmlFor="contact-email" className="sr-only">Email Address</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
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
              className={inputClass}
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
              className={`${inputClass} min-h-[200px] max-md:min-h-[150px] resize-y`}
            />

            <button
              type="submit"
              disabled={isSending}
              className="font-['BruneyClassy'] bg-[#d4af37] text-[#0b1a2e] py-4 px-6 max-md:py-[0.9rem] text-[1.1rem] max-md:text-base border-none rounded-[10px] cursor-pointer font-bold transition-[background-color,box-shadow] duration-300 hover:bg-[#f1d97c] hover:shadow-[0_0_20px_#f1d97c]"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>

          {feedback && (
            <output className="block mt-6 text-[1.2rem] text-[#ffd700] text-center">
              {feedback}
            </output>
          )}
        </section>
      </main>
    </FadeInWrapper>
  );
};

export default Contact;
