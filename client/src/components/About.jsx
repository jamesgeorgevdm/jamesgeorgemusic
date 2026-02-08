import React, { useEffect, useState } from "react";
import "./About.css";
import FadeInWrapper from "./FadeInWrapper";

const About = () => {
  const stats = [
    { title: "Solo Performances", value: 62, description: "Corporates, Private Functions, and 10 Solo Shows — 9 Sold Out." },
    { title: "Collaborative & Band Work", value: 192, description: "Paid performances with incredible musicians of diverse musical styles." },
    { title: "Special Appearances", value: 24, description: "Operatic soloist, performed with jazz legends like Feya Faku and Dumza Maswana, opening acts for Matthew Mole, Jeremy Loops, The Kiffness, Will Linley." },
    { title: "Restaurants / Venues", value: 40, description: "Regular residencies at prominent restaurants and venues." },
    { title: "Weddings", value: 12, description: "All-inclusive wedding performances — music direction, live sets, and sound setup." },
  ];

  const totalGigs = 330;
  const [counts, setCounts] = useState(new Array(stats.length + 1).fill(0));
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    setShowCards(true); // trigger fade-in animation

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
        setCounts(prev => {
          const updated = [...prev];
          updated[i] = Math.floor(start);
          return updated;
        });
      }, 16);
    });
  }, []);

  return (
    <FadeInWrapper>
    <div className="about-container">
      {/* Header */}
      <div className="about-header">
        <h2>About Me</h2>
        <div className="about-divider" />
      </div>

      {/* Elegant Text Blocks */}
      <div className={`about-cards ${showCards ? "fade-in" : ""}`}>
        <div className="about-card">
          <h3 className="card-title">Versatile Performer</h3>
          <p>
            I'm a vocalist and saxophonist performing across jazz, pop, orchestral, and theatre genres. My work blends technical skill with emotional depth, creating memorable performances that resonate with audiences.
          </p>
        </div>
        <div className="about-card">
          <h3 className="card-title">Collaborations & Experiences</h3>
          <p>
            Over the years, I’ve collaborated with outstanding musicians and ensembles, from intimate stage shows to grand productions. These experiences have honed my adaptability and professionalism in diverse musical settings.
          </p>
        </div>
        <div className="about-card">
          <h3 className="card-title">Events & Engagements</h3>
          <p>
            I have performed at corporate events, private functions, restaurants, and weddings, ensuring each performance aligns perfectly with the atmosphere and audience expectations.
          </p>
        </div>
        <div className="about-card">
          <h3 className="card-title">Artistic Vision</h3>
          <p>
            My aim is to deliver authentic storytelling through music, blending energy, emotion, and technical excellence. Every performance is an opportunity to connect and leave a lasting impression.
          </p>
        </div>
      </div>

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
    </FadeInWrapper>
  );
};

export default About;
