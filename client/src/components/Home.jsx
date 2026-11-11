import React, { useEffect, useState } from "react";
import Reviews from "./Reviews";
import Seo from "./Seo";
import isithathaImg from "./images/Isithatha Sessions.png";

const ISITHATHA_PLAYLIST =
  "https://www.youtube.com/watch?v=K-RMwp_zS9g&list=PLULcwiuFcfE8";

// The splash plays once per visit; coming back to Home goes straight to the film
let introPlayed = false;

// Navy layer with the name cut out of it, so the film is first seen through the letters
function IntroMask() {
  const letters = { fill: "#000", stroke: "#000", strokeWidth: 10, textAnchor: "middle", dominantBaseline: "central", lengthAdjust: "spacingAndGlyphs" };
  return (
    <div className="jg-intro" aria-hidden="true">
      <svg className="land" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <mask id="jg-mask-land">
            <rect x="-2000" y="-2000" width="5600" height="4900" fill="#fff" />
            <text x="800" y="300" fontSize="400" textLength="1140" {...letters}>James</text>
            <text x="800" y="640" fontSize="400" textLength="1300" {...letters}>George</text>
          </mask>
        </defs>
        <rect x="-2000" y="-2000" width="5600" height="4900" fill="#0B1C2C" fillOpacity="0.8" mask="url(#jg-mask-land)" />
      </svg>
      <svg className="port" viewBox="0 0 900 1600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <mask id="jg-mask-port">
            <rect x="-2000" y="-2000" width="4900" height="5600" fill="#fff" />
            <text x="450" y="650" fontSize="300" textLength="780" {...letters}>James</text>
            <text x="450" y="950" fontSize="300" textLength="840" {...letters}>George</text>
          </mask>
        </defs>
        <rect x="-2000" y="-2000" width="4900" height="5600" fill="#0B1C2C" fillOpacity="0.8" mask="url(#jg-mask-port)" />
      </svg>
    </div>
  );
}

function Home() {
  // Decided once per mount; introPlayed flips during the intro and must not change this
  const [skip] = useState(() => introPlayed || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  // pre: letters only · open: mask scales away · go: title and strip rise · done: mask removed
  const [stage, setStage] = useState(skip ? "done" : "pre");

  useEffect(() => {
    if (stage === "done") return;
    introPlayed = true;
    const timers = [];
    // Wait for BruneyClassy so the cut-out letters are the real face, not a fallback
    const fontsReady = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
    fontsReady.then(() => {
      timers.push(setTimeout(() => setStage("open"), 1400));
      timers.push(setTimeout(() => setStage("go"), 1400 + 950));
      timers.push(setTimeout(() => setStage("done"), 1400 + 1800));
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroClass = { pre: "pre", open: "pre open", go: "open go", done: skip ? "" : "go" }[stage];

  return (
    <div className="jg-page">
      <Seo
        title="James George Music | Professional Musician & Entertainer"
        description="Professional vocalist, saxophonist and pianist available for weddings, corporate events, and private functions in South Africa. Real-time booking and tailored packages."
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
        {stage !== "done" && <IntroMask />}

        <div className="jg-hero-title">
          <h1 className="jg-display rise" style={{ "--i": 0 }}>James George</h1>
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
