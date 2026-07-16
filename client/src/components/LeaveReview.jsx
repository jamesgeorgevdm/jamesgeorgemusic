import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from './Seo';

const reviewSeo = (
  <Seo title="Leave a Review | James George Music" path="/leave-review" noindex />
);

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(null);
  const display = hovered !== null ? hovered : value;

  return (
    <div
      className="flex gap-1"
      role="group"
      aria-label="Star rating"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map(star => {
        const isFull = display >= star;
        const isHalf = !isFull && display >= star - 0.5;
        return (
          <span
            key={star}
            className={`relative text-[2.2rem] leading-none cursor-pointer select-none transition-transform duration-150 hover:scale-[1.15]
              ${isFull ? 'text-[#f1d97c]' : isHalf ? 'star-half text-[rgba(241,217,124,0.2)]' : 'text-[rgba(241,217,124,0.2)]'}`}
            role="button"
            tabIndex={0}
            aria-label={`${star} stars`}
            onMouseMove={e => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              setHovered((e.clientX - left) < width / 2 ? star - 0.5 : star);
            }}
            onClick={e => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              onChange((e.clientX - left) < width / 2 ? star - 0.5 : star);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onChange(star);
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

function LeaveReview() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [tokenValid, setTokenValid] = useState(null);
  const [tokenError, setTokenError] = useState('');

  const [form, setForm] = useState({ name: '', event_date: '', rating: 0, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError('No review link found. Please use the personalised link sent to you.');
      return;
    }

    fetch(`${import.meta.env.VITE_API}/api/validate-token?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'This link is invalid or has already been used.');
        }
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError('Could not verify your link. Please check your connection and try again.');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Could not submit your review. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const pageClass = "min-h-screen bg-gradient-to-b from-[#0b1a2e] to-[#091227] flex items-center justify-center py-24 px-6 font-['Crimson_Pro'] text-[#fdfaf3]";
  const cardClass = "bg-white/[0.04] backdrop-blur-[12px] border border-[rgba(212,175,55,0.2)] rounded-[24px] p-12 px-10 max-sm:p-8 max-sm:px-6 w-full max-w-[560px] text-center";
  const inputClass = "bg-white/[0.05] border border-[rgba(212,175,55,0.25)] rounded-[10px] py-3 px-4 text-[#fdfaf3] font-['Crimson_Pro'] text-base transition-[border-color,box-shadow] duration-300 outline-none w-full box-border focus:border-[rgba(212,175,55,0.6)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] placeholder:text-[rgba(246,242,237,0.28)]";
  const labelClass = "text-[0.82rem] font-bold uppercase tracking-[0.07em] text-[rgba(246,242,237,0.65)]";

  // Checking token
  if (tokenValid === null) {
    return (
      <main className={pageClass}>
        {reviewSeo}
        <div className={cardClass}>
          <p className="text-[rgba(234,232,225,0.55)] text-[1.1rem] py-8">Verifying your link…</p>
        </div>
      </main>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <main className={pageClass}>
        {reviewSeo}
        <div className={cardClass}>
          <h1 className="font-['BruneyClassy'] text-[2.5rem] max-sm:text-[2rem] text-[#f1d97c] m-0 mb-2">Whoops!</h1>
          <p className="text-[rgba(234,232,225,0.7)] text-[1.05rem] leading-[1.6] mt-2 mb-0">{tokenError}</p>
        </div>
      </main>
    );
  }

  // Submitted successfully
  if (submitted) {
    return (
      <main className={pageClass}>
        {reviewSeo}
        <div className={`${cardClass} py-16`}>
          <span className="block text-[4rem] text-[#f1d97c] mb-4 leading-none" aria-hidden="true">★</span>
          <h1 className="font-['BruneyClassy'] text-[2.5rem] max-sm:text-[2rem] text-[#f1d97c] m-0 mb-2">Thank you!</h1>
          <p className="text-[1.05rem] text-[#eae8e1] m-0 mb-6 leading-[1.6]">
            Your review has been submitted and will appear on the site shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      {reviewSeo}
      <div className={cardClass}>
        <h1 className="font-['BruneyClassy'] text-[2.5rem] max-sm:text-[2rem] text-[#f1d97c] m-0 mb-2">Leave a Review</h1>
        <p className="text-[1.05rem] text-[#eae8e1] m-0 mb-6 leading-[1.6]">
          Thank you for taking the time. Let myself and others know what you thought!
        </p>
        <div className="w-[60px] h-[2px] bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm mx-auto mb-8" aria-hidden="true" />

        <form onSubmit={handleSubmit} className="text-left flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-[0.45rem]">
            <label className={labelClass} htmlFor="lr-name">Your Name</label>
            <input
              id="lr-name"
              className={inputClass}
              type="text"
              required
              placeholder="e.g. Sarah & Tom"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-[0.45rem]">
            <label className={labelClass} htmlFor="lr-date">
              Event Date{' '}
              <span className="font-normal normal-case tracking-normal text-[rgba(246,242,237,0.35)]">(optional)</span>
            </label>
            <input
              id="lr-date"
              className={`${inputClass} [color-scheme:dark]`}
              type="date"
              value={form.event_date}
              onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-[0.45rem]">
            <label className={labelClass}>Rating</label>
            <StarPicker value={form.rating} onChange={rating => setForm(f => ({ ...f, rating }))} />
          </div>

          <div className="flex flex-col gap-[0.45rem]">
            <label className={labelClass} htmlFor="lr-review">Your Review</label>
            <textarea
              id="lr-review"
              className={`${inputClass} resize-y min-h-[120px]`}
              required
              rows={5}
              placeholder="Tell us about your experience…"
              value={form.review}
              onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
            />
          </div>

          {submitError && (
            <p className="text-[#f87171] text-[0.9rem] text-center m-0" role="alert">{submitError}</p>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-[#d4af37] to-[#f1d97c] text-[#0b1a2e] border-none rounded-[10px] py-[0.9rem] px-8 font-['BruneyClassy'] text-[1.15rem] tracking-[0.05em] cursor-pointer w-full transition-[transform,box-shadow,opacity] duration-200 mt-2 hover:not-disabled:-translate-y-[2px] hover:not-disabled:shadow-[0_8px_24px_rgba(212,175,55,0.3)] disabled:opacity-55 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LeaveReview;
