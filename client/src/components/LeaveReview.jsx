import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './leaveReview.css';

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(null);
  const display = hovered !== null ? hovered : value;

  return (
    <div
      className="star-picker"
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
            className={`star-btn ${isFull ? 'full' : isHalf ? 'half' : 'empty'}`}
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

  // Checking token
  if (tokenValid === null) {
    return (
      <main className="leave-review-page">
        <div className="lr-card">
          <p className="lr-loading">Verifying your link…</p>
        </div>
      </main>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <main className="leave-review-page">
        <div className="lr-card">
          <h1 className="lr-heading">Hmm…</h1>
          <p className="lr-error-msg">{tokenError}</p>
        </div>
      </main>
    );
  }

  // Submitted successfully
  if (submitted) {
    return (
      <main className="leave-review-page">
        <div className="lr-card lr-card--success">
          <div className="lr-success-star" aria-hidden="true">★</div>
          <h1 className="lr-heading">Thank you!</h1>
          <p className="lr-subheading">Your review has been submitted and will appear on the site shortly.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="leave-review-page">
      <div className="lr-card">
        <h1 className="lr-heading">Leave a Review</h1>
        <p className="lr-subheading">Your kind words mean the world — thank you for taking the time.</p>
        <div className="lr-divider" aria-hidden="true" />

        <form onSubmit={handleSubmit} className="lr-form" noValidate>
          <div className="lr-field">
            <label className="lr-label" htmlFor="lr-name">Your Name</label>
            <input
              id="lr-name"
              className="lr-input"
              type="text"
              required
              placeholder="e.g. Sarah & Tom"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="lr-field">
            <label className="lr-label" htmlFor="lr-date">
              Event Date <span className="lr-optional">(optional)</span>
            </label>
            <input
              id="lr-date"
              className="lr-input"
              type="date"
              value={form.event_date}
              onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
            />
          </div>

          <div className="lr-field">
            <label className="lr-label">Rating</label>
            <StarPicker value={form.rating} onChange={rating => setForm(f => ({ ...f, rating }))} />
          </div>

          <div className="lr-field">
            <label className="lr-label" htmlFor="lr-review">Your Review</label>
            <textarea
              id="lr-review"
              className="lr-textarea"
              required
              rows={5}
              placeholder="Tell us about your experience…"
              value={form.review}
              onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
            />
          </div>

          {submitError && <p className="lr-submit-error" role="alert">{submitError}</p>}

          <button type="submit" className="lr-submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LeaveReview;
