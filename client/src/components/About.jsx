import React, { useEffect, useState } from "react";
import "./about.css";
import FadeInWrapper from "./FadeInWrapper";

const About = () => {
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API}/api/stats`);
        const data = await response.json();
        
        // Transform DB data for the UI
        const formattedStats = data.map(item => ({
          title: item.title,
          value: item.legacy_count + item.live_count,
          description: item.description
        }));

        const totalGigs = formattedStats.reduce((acc, curr) => acc + curr.value, 0);
        
        setStats(formattedStats);
        startAnimations(totalGigs, formattedStats);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const startAnimations = (total, items) => {
    const allValues = [total, ...items.map((s) => s.value)];
    const duration = 1500;
    
    // Initialize counts with zeros
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
        setCounts(prev => {
          const updated = [...prev];
          updated[i] = Math.floor(start);
          return updated;
        });
      }, 16);
    });
  };

  if (loading) return <div className="loading">Loading Stats...</div>;

  return (
    <FadeInWrapper>
      <div className="about-container">
        <div className="about-header">
          <h2>About Me</h2>
          <div className="about-divider" />
        </div>

        <div className="about-cards fade-in">
          <div className="about-card">
            <h3 className="card-title">Versatile Performer</h3>
            <p>Vocalist and saxophonist performing across jazz, pop, and theatre.</p>
          </div>
          {/* ... other cards remain the same ... */}
        </div>

        {/* Stats Section - Scalable & Smaller */}
<div className="flex flex-wrap justify-center gap-4 mt-16 px-4">
  
  {/* Total Gigs Box - Full width on mobile, smaller on desktop */}
  <div className="w-full max-w-sm bg-gradient-to-br from-[#d4af37] to-[#f1d97c] text-[#0b1a2e] p-6 rounded-xl flex flex-col items-center shadow-lg">
    <h3 className="text-4xl md:text-5xl font-bold leading-none">{counts[0]}</h3>
    <p className="text-sm md:text-base font-semibold uppercase tracking-wider">Total Gigs</p>
  </div>

  {/* Dynamic Stat Items - 2 per row on tablet, 3-4 on desktop */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
    {stats.map((item, index) => (
      <div key={index} className="bg-[#0f2240] border border-[#d4af37]/40 rounded-lg p-4 transition-all hover:border-[#d4af37]">
        <h3 className="text-2xl text-[#f1d97c] font-bold mb-1">{counts[index + 1]}</h3>
        <p className="text-xs font-bold text-white uppercase mb-1">{item.title}</p>
        <p className="text-[0.8rem] leading-snug text-gray-300">{item.description}</p>
      </div>
    ))}
  </div>

</div>
      </div>
    </FadeInWrapper>
  );
};

export default About;