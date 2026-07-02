import React, { useEffect, useRef, useState } from "react";
import FadeInWrapper from "./FadeInWrapper";

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
      <main className="bg-gradient-to-b from-[#0b1a2e] to-[#091227] font-['Crimson_Pro'] text-[#fdfaf3] py-20 px-8 min-h-screen text-center">
        <header>
          <h2 className="text-[2.8rem] max-md:text-[2.2rem] font-['BruneyClassy'] text-[#f1d97c] mb-4">
            About Me
          </h2>
          <div className="w-20 h-[3px] mx-auto mb-20 bg-gradient-to-r from-[#ffd700] to-[#f1d97c] rounded-sm" aria-hidden="true" />
        </header>

        <section
          className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-10 max-w-[1200px] mx-auto mb-32 max-lg:mx-8 max-lg:mb-20 max-lg:gap-6 max-md:mx-4 max-md:mb-16"
          aria-label="Professional Pillars"
        >
          {bioPillars.map((pillar, index) => (
            <article
              key={index}
              className={`bg-white/[0.04] backdrop-blur-[12px] border border-[rgba(212,175,55,0.2)] rounded-[20px] p-10 max-md:p-8 max-md:px-6 transition-all duration-[400ms] relative hover:-translate-y-[10px] hover:rotate-0 hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] hover:bg-white/[0.08] max-md:rotate-0 ${index % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"}`}
            >
              <h3 className="font-['BruneyClassy'] text-[1.6rem] text-[#f1d97c] mb-4">{pillar.title}</h3>
              <p className="text-[1.05rem] leading-[1.7] text-[#eae8e1]">{pillar.desc}</p>
            </article>
          ))}
        </section>

        <section aria-label="Performance Statistics">
          {renderStatsContent()}
        </section>
      </main>
    </FadeInWrapper>
  );
};

export default About;
