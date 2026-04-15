import React, { useEffect, useState } from "react";
import "./about.css";
import FadeInWrapper from "./FadeInWrapper";

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

const About = () => {
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API}/api/stats`);
        const data = await response.json();

        const formattedStats = data.map((item) => ({
          title: item.title,
          value: item.legacy_count + item.live_count,
          description: item.description,
        }));

        const totalGigs = formattedStats.reduce((acc, curr) => acc + curr.value, 0);

        setStats(formattedStats);
        startAnimations(totalGigs, formattedStats);
        setTimeout(() => setLoading(false), 400);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  const renderStatsContent = () => {
    if (loading) {
      return (
        <div className="flex flex-wrap justify-center gap-4 mt-16 px-4">
          <div className="skeleton skeleton-total rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
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
            <div key={index} className="stat-card-dynamic">
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
      <div className="about-container">
        <div className="about-header">
          <h2>About Me</h2>
          <div className="about-divider" />
        </div>

        <div className="about-cards">
          {bioPillars.map((pillar, index) => (
            <div key={index} className="about-card">
              <h3 className="card-title">{pillar.title}</h3>
              <p>{pillar.desc}</p>
            </div>
          ))}
        </div>

        {renderStatsContent()}
      </div>
    </FadeInWrapper>
  );
};

export default About;