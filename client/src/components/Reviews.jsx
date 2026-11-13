import React, { useEffect, useRef, useState } from 'react';

const ROTATE_MS = 7000;

// Read-only star row — half stars use the .star-half CSS fill trick
const StarDisplay = ({ rating }) => (
  <div className="jg-stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const full = rating >= star;
      const half = !full && rating >= star - 0.5;
      return <span key={star} className={full ? 'on' : half ? 'star-half off' : 'off'}>★</span>;
    })}
  </div>
);

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null;

// Compact review strip for the foot of the home hero: one review at a time, slow crossfade.
function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const [paused, setPaused] = useState(false);
  const textRefs = useRef([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API}/api/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      // Still exit loading on failure so the empty state can show
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance unless hovered, a review is open, or the visitor prefers less motion
  useEffect(() => {
    if (reviews.length < 2 || paused || expanded) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [reviews.length, paused, expanded]);

  // "Read more" only when the active review overflows its two lines
  useEffect(() => {
    const el = textRefs.current[index];
    if (!el || expanded) return;
    setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [index, reviews, expanded]);

  const go = (step) => {
    setExpanded(false);
    setIndex((i) => (i + step + reviews.length) % reviews.length);
  };

  if (loading) {
    return (
      <div className="jg-reviews" aria-busy="true">
        <div className="jg-skel" style={{ height: 14, width: 90 }} />
        <div className="jg-skel" style={{ height: 40, marginTop: 10 }} />
      </div>
    );
  }

  // Reviews come in via personal links, so no public prompt when there are none
  if (reviews.length === 0) return null;

  return (
    <div
      className="jg-reviews"
      aria-roledescription="carousel"
      aria-label="Reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <StarDisplay rating={reviews[index].rating} />
      <div className="jg-rv-stage" aria-live="polite">
        {reviews.map((r, i) => (
          <figure key={r.id} className={`jg-rv ${i === index ? 'on' : ''}`} aria-hidden={i !== index}>
            <blockquote ref={(el) => (textRefs.current[i] = el)} className={i === index && expanded ? '' : 'clamp'}>
              “{r.review}”
            </blockquote>
            <figcaption>
              {r.name}{r.event_date ? `, ${formatDate(r.event_date)}` : ''}
              {i === index && (clamped || expanded) && (
                <button type="button" className="more" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {reviews.length > 1 && (
        <div className="jg-rv-ctrl">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review">←</button>
          <span>{index + 1} / {reviews.length}</span>
          <button type="button" onClick={() => go(1)} aria-label="Next review">→</button>
        </div>
      )}
    </div>
  );
}

export default Reviews;
