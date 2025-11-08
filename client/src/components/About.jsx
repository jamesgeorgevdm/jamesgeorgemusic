import React, { useEffect, useState } from "react";
import "./About.css";

const About = () => {
  const stats = [
    {
      title: "Solo Performances",
      value: 58,
      description:
        "Corporates, Private Functions, and 8 Solo Shows — 7 Sold Out.",
    },
    {
      title: "Collaborative & Band Work",
      value: 172,
      description:
        "Paid performances with incredible musicians of diverse musical styles.",
    },
    {
      title: "Special Appearances",
      value: 24,
      description:
        "From an Operatic soloist for orchestras, saxophonist for jazz legends like Feya Faku and Dumza Maswana, and opening acts for Matthew Mole, Jeremy Loops, The Kiffness, and Will Linley.",
    },
    {
      title: "Restaurants / Venues",
      value: 38,
      description:
        "Regular residencies and recurring performances at prominent restaurants and venues.",
    },
    {
      title: "Weddings",
      value: 7,
      description:
        "All-inclusive wedding performances — music direction, live sets, and sound setup.",
    },
  ];

  const totalGigs = 292;
  const [counts, setCounts] = useState(
    new Array(stats.length + 1).fill(0) // +1 for total
  );

  // Animate all counters
  useEffect(() => {
    const allValues = [totalGigs, ...stats.map((s) => s.value)];
    const duration = 1500;

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
  }, []);

  return (
    <div className="about-container">
      <h2>About Me</h2>
      <p className="about-text">
        I'm a vocalist and saxophonist performing across a range of genres —
        from jazz and pop to orchestral and theatre. Over the years, I’ve built
        a reputation for musical versatility, emotional connection, and
        high-quality performances, both solo and in collaboration with other
        artists.
      </p>

      <p className="about-text">
        My work has spanned private events, stage shows, and collaborations with
        top musicians. Whether performing in intimate venues or large
        productions, I aim to bring authenticity, energy, and storytelling to
        every performance.
      </p>

      {/* Stats Section */}
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
  );
};

export default About;
