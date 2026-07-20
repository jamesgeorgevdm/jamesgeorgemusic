import React, { useEffect, useRef, useState } from "react";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

// Static content for the bio pillars
const bioPillars = [
  {
    title: "Versatile Performer",
    desc: "Performed extensively in contemporary, jazz, musical theater and even operatic styles across a wide range of settings - from birthday parties and weddings to sold-out solo shows.",
  },
  {
    title: "Multi-Instrumentalist",
    desc: "A seasoned and fully qualified professional vocalist, saxophonist and pianist with multiple other weird and wonderful instruments at my disposal.",
  },
  {
    title: "Professional Equipment",
    desc: "Quality and reliable equipment is an investment - sound gremlins are, in fact, a myth.",
  },
  {
    title: "Proven Reputation",
    desc: "Performing as regularly as I do is the result of reliable professionalism - consider the entertainment side of your event completely taken care of.",
  },
];

// Main About component
const About = ({ prefetchedStats }) => {
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  // Format raw API data and kick off animations
  const processStats = (data) => {
    const formattedStats = data.map((item) => ({
      title: item.title,
      value: item.legacy_count + item.live_count,
      description: item.description,
    }));

    const totalGigs = formattedStats.reduce((acc, curr) => acc + curr.value, 0);

    setStats(formattedStats);
    startAnimations(totalGigs, formattedStats);
    setTimeout(() => setLoading(false), 400);
  };

  useEffect(() => {
    if (hasProcessed.current) return;

    if (prefetchedStats) {
      // Already fetched at app level — use it directly
      hasProcessed.current = true;
      processStats(prefetchedStats);
    } else {
      // Fallback: fetch on demand if prefetch hasn't resolved yet
      const fetchStats = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API}/api/stats`);
          const data = await response.json();
          hasProcessed.current = true;
          processStats(data);
        } catch (err) {
          console.error("Error fetching stats:", err);
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [prefetchedStats]);

  // Function to animate counts from 0 to their target values
  const startAnimations = (total, items) => {
    const allValues = [total, ...items.map((s) => s.value)];
    const duration = 1500;
    setCounts(new Array(allValues.length).fill(0));

    allValues.forEach((target, i) => {
      let start = 0;
      const increment = target / (duration / 16);
      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(interval);
        }
        setCounts((prev) => {
          const updated = [...prev];
          updated[i] = Math.floor(start);
          return updated;
        });
      }, 16);
    });
  };

  const skeletonBase = "bg-gradient-to-r from-[#0f2240] via-[#1b3358] to-[#0f2240] bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] rounded-xl";

  // Render function for the stats section
  const renderStatsContent = () => {
    if (loading) {
      return (
        <div className="flex flex-wrap justify-center gap-4 mt-16 px-4">
          <div className={`${skeletonBase} h-[140px] w-full max-w-sm`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${skeletonBase} h-[110px] w-full`} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-16 px-4">
        <div className="w-full max-w-sm bg-gradient-to-br from-[#d4af37] to-[#f1d97c] text-[#0b1a2e] p-6 rounded-xl flex flex-col items-center shadow-lg">
          <h3 className="text-4xl md:text-5xl font-bold">{counts[0]}</h3>
          <p className="text-sm font-semibold uppercase tracking-wider">Total Gigs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-[#0f2240] border border-[rgba(212,175,55,0.25)] rounded-xl p-6 transition-all duration-300 text-left hover:border-[#f1d97c] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
            >
              <h3 className="text-2xl text-[#f1d97c] font-bold mb-1">{counts[index + 1]}</h3>
              <p className="text-xs font-bold text-white uppercase mb-1">{item.title}</p>
              <p className="text-[0.8rem] leading-snug text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <FadeInWrapper>
      <Seo
        title="About James George | Professional Musician in South Africa"
        description="Meet James George — a fully qualified vocalist, saxophonist and pianist performing contemporary, jazz, musical theatre and operatic styles at weddings, corporate events and private functions."
        path="/about"
      />
      <main className="bg-gradient-to-b from-[#0b1a2e] to-[#091227] font-['Crimson_Pro'] text-[#fdfaf3] py-16 md:py-20 px-5 sm:px-8 min-h-screen text-center">
        <header>
          <h2 className="text-[2.2rem] sm:text-[2.5rem] md:text-[2.8rem] font-['BruneyClassy'] text-[#f1d97c] mb-4">
            About Me
          </h2>
          <div className="w-20 h-[3px] mx-auto mb-14 md:mb-20 bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm" aria-hidden="true" />
        </header>

        <section
          className="relative max-w-5xl mx-auto mb-24 md:mb-32 text-left"
          aria-label="Professional Pillars"
        >
          {/* Alternate zig-zag only on large screens — tablets stay single-column */}
          <div
            className="hidden lg:block absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-[#D4A455]/80 via-[#D4A455]/30 to-transparent"
            aria-hidden="true"
          />
          <div
            className="lg:hidden absolute left-[0.85rem] top-3 bottom-3 w-px bg-gradient-to-b from-[#D4A455]/80 via-[#D4A455]/25 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-16">
            {bioPillars.map((pillar, index) => {
              const isLeft = index % 2 === 0;
              return (
                <article
                  key={pillar.title}
                  className={`group relative flex items-start gap-5 lg:gap-0 ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <span
                    className="relative z-[1] shrink-0 mt-1.5 flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full border border-[#D4A455]/50 bg-[#0b1a2e] text-[0.65rem] lg:text-xs tracking-[0.08em] text-[#D4A455] font-['BruneyClassy'] transition-all duration-500 group-hover:border-[#f1d97c] group-hover:text-[#f1d97c] group-hover:shadow-[0_0_18px_rgba(241,217,124,0.35)] lg:absolute lg:left-1/2 lg:-translate-x-1/2"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={`flex-1 min-w-0 ${
                      isLeft ? "lg:pr-10 lg:text-right" : "lg:pl-10 lg:text-left"
                    }`}
                  >
                    <h3 className="font-['BruneyClassy'] text-[1.4rem] sm:text-[1.55rem] lg:text-[1.75rem] text-[#f1d97c] mb-2.5 leading-snug transition-colors duration-300 group-hover:text-[#ffd700]">
                      {pillar.title}
                    </h3>
                    <p
                      className={`text-[0.98rem] sm:text-[1.05rem] leading-[1.75] sm:leading-[1.8] text-[#eae8e1]/80 m-0 max-w-md transition-colors duration-300 group-hover:text-[#eae8e1] ${
                        isLeft ? "lg:ml-auto" : ""
                      }`}
                    >
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="hidden lg:block flex-1" aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </section>

        <section aria-label="Performance Statistics">
          {renderStatsContent()}
        </section>
      </main>
    </FadeInWrapper>
  );
};

export default About;
