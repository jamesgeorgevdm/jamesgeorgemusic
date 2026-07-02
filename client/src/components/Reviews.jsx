import React, { useState, useEffect, useRef } from 'react';
import './reviews.css';

const StarDisplay = ({ rating }) => (
  <div className="stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => {
      const full = rating >= star;
      const half = !full && rating >= star - 0.5;
      return (
        <span key={star} className={`star ${full ? 'filled' : half ? 'half' : 'empty'}`}>★</span>
      );
    })}
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

function Reviews({ overlay = false }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API}/api/reviews`)
      .then(res => res.json())
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!trackRef.current || reviews.length === 0) return;
    const cards = trackRef.current.querySelectorAll('.review-card');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.dataset.index));
          }
        });
      },
      { root: trackRef.current, threshold: 0.5 }
    );

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [reviews]);

  const scrollToCard = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.review-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  const sectionClass = `reviews-section${overlay ? ' reviews-section--overlay' : ''}`;

  if (loading) {
    return (
      <div className={sectionClass}>
        {!overlay && (
          <div className="reviews-header">
            <h2>Reviews</h2>
            <div className="reviews-divider" aria-hidden="true" />
          </div>
        )}
        <div className="reviews-track">
          {[1, 2, 3].map(i => <div key={i} className="review-skeleton" />)}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <div className={sectionClass}>
      {!overlay && (
        <div className="reviews-header">
          <h2>Reviews</h2>
          <div className="reviews-divider" aria-hidden="true" />
        </div>
      )}

      <div className="reviews-track" ref={trackRef}>
        {reviews.map((review, i) => (
          <article key={review.id} className="review-card" data-index={i}>
            <div className="review-meta">
              <span className="review-name">{review.name}</span>
              {review.event_date && (
                <span className="review-date">{formatDate(review.event_date)}</span>
              )}
            </div>
            <StarDisplay rating={review.rating} />
            <p className="review-text">"{review.review}"</p>
          </article>
        ))}
      </div>

      {reviews.length > 1 && (
        <div className="scroll-dots" role="tablist" aria-label="Review navigation">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`scroll-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToCard(i)}
              aria-label={`Go to review ${i + 1}`}
              role="tab"
              aria-selected={i === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;
