import React, { useEffect, useLayoutEffect, useState } from "react";
import Reviews from "./Reviews";
import Seo from "./Seo";
import isithathaImg from "./images/Isithatha Sessions.png";

const ISITHATHA_PLAYLIST =
  "https://www.youtube.com/watch?v=K-RMwp_zS9g&list=PLULcwiuFcfE8";

// The splash plays once per visit; coming back to Home goes straight to the film
let introPlayed = false;

// Cumulative hero classes per intro stage, with when each starts (ms after fonts load)
const INTRO = [
  ["name", 300, "intro pre s1"],                // name comes up on black
  ["cap", 650, "intro pre s1 s2"],              // credit line follows
  ["fade", 1300, "intro pre s1 s2 s3"],         // film fades up through navy to colour
  ["go", 2900, "intro s1 s2 s3 go"],            // reviews and session card rise
  ["done", 4600, "go"],                         // black layer and tint removed
];

function Home() {
  // Decided once per mount; introPlayed flips during the intro and must not change this
  const [skip] = useState(() => introPlayed || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [stage, setStage] = useState(skip ? "done" : "wait");

  useEffect(() => {
    if (stage === "done") return;
    introPlayed = true;
    const timers = [];
    // Wait for BruneyClassy so the name comes up in the real face, not a fallback
    const fontsReady = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
    fontsReady.then(() => {
      INTRO.forEach(([name, at]) => timers.push(setTimeout(() => setStage(name), at)));
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the splash plays, <html data-intro> hides the chat button and holds back the nav sweep;
  // cleared when it finishes or if the visitor leaves Home early
  const introOn = stage !== "done";
  useLayoutEffect(() => {
    if (!introOn) return;
    const root = document.documentElement;
    root.dataset.intro = "";
    return () => { delete root.dataset.intro; };
  }, [introOn]);

  const heroClass = stage === "wait" ? "intro pre" : skip ? "" : INTRO.find(([name]) => name === stage)[2];

  return (
    <div className="jg-page">
      <Seo
        title="James George Music | Professional Musician & Entertainer"
        description="Professional vocalist and saxophonist available for weddings, corporate events, and private functions. Based in Cape Town, performing across South Africa. Real-time booking and tailored packages."
        path="/"
      />
      <section className={`jg-hero ${heroClass}`}>
        <video
          autoPlay
          loop
          muted
          // playsInline required for iOS autoplay; muted + no controls keep it decorative
          playsInline
          poster="/images/poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
        </video>
        {stage !== "done" && (
          <>
            <div className="jg-intro-tint" aria-hidden="true" />
            <div className="jg-intro" aria-hidden="true" />
          </>
        )}

        <div className="jg-hero-title">
          <h1 className={`jg-display${skip ? " rise" : ""}`} style={{ "--i": 0 }}>James George</h1>
          <p className={`jg-hero-cap${skip ? " rise" : ""}`} style={{ "--i": 1 }}>Vocalist · Saxophone · Cape Town</p>
        </div>

        <div className="jg-hero-foot jg-wrap rise" style={{ "--i": 2 }}>
          <Reviews />
          <a
            className="jg-sess"
            href={ISITHATHA_PLAYLIST}
            target="_blank"
            // noopener prevents the new tab from accessing window.opener
            rel="noopener noreferrer"
            aria-label="Watch the Isithatha Sessions playlist on YouTube"
          >
            <span className="jg-sess-thumb">
              <img src={isithathaImg} alt="" />
              <span className="play" aria-hidden="true">▶</span>
            </span>
            <span className="jg-sess-txt">
              <b>Isithatha Sessions</b>
              <span>Watch the live playlist <span className="jg-arrow" aria-hidden="true">→</span></span>
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
