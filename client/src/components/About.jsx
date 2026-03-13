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
        const response = await fetch("http://localhost:5000/api/stats");
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

        <div className="stats-container">
          <div className="stat-item total">
            <div className="total-inner">
              <h3>{counts[0]}</h3>
              <p>Total Gigs</p>
            </div>
          </div>

          {stats.map((item, index) => (
            <div key={index} className="stat-item">
              <h3>{counts[index + 1]}</h3>
              <p className="stat-title">{item.title}</p>
              <p className="stat-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </FadeInWrapper>
  );
};

export default About;