import React, { useState, useEffect, useRef } from 'react';

const StarDisplay = ({ rating }) => (
  <div className="flex gap-[3px] mb-2" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => {
      const full = rating >= star;
      const half = !full && rating >= star - 0.5;
      return (
        <span
          key={star}
          className={`text-[1.1rem] max-md:text-[1rem] leading-none ${full ? 'text-[#f1d97c]' : half ? 'star-half text-[rgba(241,217,124,0.2)]' : 'text-[rgba(241,217,124,0.2)]'}`}
        >
          ★
        </span>
      );
    })}
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

function ReviewText({ text, overlay }) {
  const [expanded, setExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) return;
      setNeedsClamp(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded, overlay]);

  return (
    <div className="mb-3">
      <p
        ref={textRef}
        className={`text-sm max-md:text-xs leading-[1.65] text-[#eae8e1] italic${
          !expanded ? (overlay ? ' line-clamp-4' : ' line-clamp-5') : ''
        }`}
      >
        "{text}"
      </p>
      {(needsClamp || expanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(prev => !prev);
          }}
          className="mt-1.5 p-0 border-none bg-transparent cursor-pointer font-['Crimson_Pro'] text-[0.8rem] max-md:text-[0.72rem] text-[#f1d97c] hover:text-[#ffd700] underline underline-offset-2 decoration-[rgba(241,217,124,0.4)] hover:decoration-[#ffd700] transition-colors duration-200"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

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

  // Track which card is most visible using IntersectionObserver
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

  const skeletonClass = "flex-[0_0_290px] max-md:flex-[0_0_250px] max-sm:flex-[0_0_220px] h-[175px] max-md:h-[155px] rounded-[20px] bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:200%_100%] border border-[rgba(212,175,55,0.1)] backdrop-blur-[16px] animate-[reviews-skeleton-loading_1.5s_infinite]";

  const sectionClass = overlay
    ? "absolute bottom-0 left-0 right-0 z-[3] pb-4 bg-gradient-to-t from-[rgba(9,18,39,0.85)] to-transparent pointer-events-none"
    : "bg-gradient-to-b from-[#091227] to-[#0b1a2e] py-20 pb-24 text-center font-['Crimson_Pro'] text-[#fdfaf3]";

  const trackClass = overlay
    ? "flex gap-4 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch] pt-3 px-8 max-md:px-4 pb-2 max-w-[1200px] mx-auto no-scrollbar pointer-events-auto"
    : "flex gap-6 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch] pt-4 px-12 pb-8 max-md:px-6 max-w-[1200px] mx-auto no-scrollbar";

  const cardClass = overlay
    ? "review-card flex-[0_0_290px] max-md:flex-[0_0_250px] max-sm:flex-[0_0_220px] snap-start bg-[rgba(9,18,39,0.55)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.25)] rounded-[20px] p-5 max-md:p-4 px-[1.4rem] max-md:px-[1.1rem] text-left transition-all duration-[400ms] ease-in-out hover:-translate-y-[6px] hover:bg-[rgba(9,18,39,0.75)]"
    : "review-card flex-[0_0_300px] max-md:flex-[0_0_260px] max-sm:flex-[0_0_230px] snap-start bg-white/[0.04] backdrop-blur-[12px] border border-[rgba(212,175,55,0.2)] rounded-[20px] p-6 max-md:p-5 px-[1.6rem] max-md:px-[1.2rem] text-left transition-all duration-[400ms] ease-in-out hover:-translate-y-[6px] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.5)] hover:bg-white/[0.08]";

  const dotsClass = overlay
    ? "flex justify-center gap-2 mt-3 pointer-events-auto"
    : "flex justify-center gap-2 mt-8";

  if (loading) {
    return (
      <div className={sectionClass}>
        {!overlay && (
          <div className="mb-[3.5rem]">
            <h2 className="font-['BruneyClassy'] text-[2.8rem] text-[#f1d97c] mb-4">Reviews</h2>
            <div className="w-20 h-[3px] mx-auto bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm" aria-hidden="true" />
          </div>
        )}
        <div className={trackClass}>
          {[1, 2, 3].map(i => <div key={i} className={skeletonClass} />)}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={sectionClass}>
        {!overlay && (
          <div className="mb-[3.5rem]">
            <h2 className="font-['BruneyClassy'] text-[2.8rem] max-md:text-[2.2rem] text-[#f1d97c] mb-4">Reviews</h2>
            <div className="w-20 h-[3px] mx-auto bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm" aria-hidden="true" />
          </div>
        )}
        <p className="text-center text-[rgba(234,232,225,0.45)] text-[1.35rem] max-md:text-[1.15rem] py-12">Reviews coming soon.</p>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      {!overlay && (
        <div className="mb-[3.5rem]">
          <h2 className="font-['BruneyClassy'] text-[2.8rem] max-md:text-[2.2rem] text-[#f1d97c] mb-4">Reviews</h2>
          <div className="w-20 h-[3px] mx-auto bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm" aria-hidden="true" />
        </div>
      )}

      <div className={trackClass} ref={trackRef}>
        {reviews.map((review, i) => (
          <article key={review.id} className={cardClass} data-index={i}>
            <div className="flex flex-col gap-[0.2rem] border-b border-[rgba(212,175,55,0.15)] pb-2 mb-2">
              <span className="font-['BruneyClassy'] text-[1rem] max-md:text-[0.9rem] text-[#f1d97c]">{review.name}</span>
              {review.event_date && (
                <span className="text-[0.8rem] max-md:text-[0.72rem] text-[rgba(234,232,225,0.55)]">{formatDate(review.event_date)}</span>
              )}
            </div>
            <StarDisplay rating={review.rating} />
            <ReviewText text={review.review} overlay={overlay} />
          </article>
        ))}
      </div>

      {reviews.length > 1 && (
        <div className={dotsClass} role="tablist" aria-label="Review navigation">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`w-[7px] h-[7px] rounded-full border-none cursor-pointer p-0 transition-[background,transform] duration-300
                ${i === activeIndex
                  ? "bg-[#f1d97c] scale-[1.3]"
                  : "bg-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.55)]"
                }`}
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
