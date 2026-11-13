import React, { useEffect, useRef, useState } from "react";
import Seo from "./Seo";
import portraitImg from "./images/about-portrait.jpg";

// Static bio copy — kept out of the component so re-renders don't recreate the array
const bioPillars = [
  {
    title: "Versatile performer",
    desc: "I've played everything from intimate private events to sold-out solo shows, and I put each set together around the event and the people in the room.",
  },
  {
    title: "Vocalist & saxophonist",
    desc: "Singing and sax are my main instruments, and I'll pick the mix that suits your event.",
  },
  {
    title: "Professional equipment",
    desc: "I've invested in good, reliable gear. Sound gremlins are, in fact, a myth.",
  },
  {
    title: "Proven reputation",
    desc: "I perform regularly, and the secret ingredient to that is being reliable and professional. Once you've booked me, consider the music taken care of.",
  },
];

const COUNT_MS = 1600;

// Count-up from 0 using rAF; one state update per frame for every number at once
function useCountUp(targets) {
  const [values, setValues] = useState(() => targets.map(() => 0));
  const key = targets.join(",");

  useEffect(() => {
    if (!targets.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValues(targets);
      return;
    }
    let raf;
    let start;
    // Small delay so the count starts as the curtain lifts, not under it
    const delay = setTimeout(() => {
      const step = (t) => {
        start ??= t;
        const k = Math.min(1, (t - start) / COUNT_MS);
        const eased = 1 - Math.pow(1 - k, 3);
        setValues(targets.map((n) => Math.round(n * eased)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 350);
    return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return values;
}

// legacy_count = historical baseline; live_count = Calendar-synced gigs
const toStats = (data) =>
  data.map((item) => ({
    title: item.title,
    value: item.legacy_count + item.live_count,
    description: item.description,
  }));

function GigTally({ prefetchedStats }) {
  const [stats, setStats] = useState(prefetchedStats ? toStats(prefetchedStats) : null);
  const [failed, setFailed] = useState(false);
  // Guards against double-processing when prefetch arrives after a fallback fetch
  const hasProcessed = useRef(Boolean(prefetchedStats));

  useEffect(() => {
    if (hasProcessed.current) return;
    if (prefetchedStats) {
      hasProcessed.current = true;
      setStats(toStats(prefetchedStats));
      return;
    }
    // Fallback: fetch on demand if the user lands on /about before prefetch resolves
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API}/api/stats`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;
        setStats(toStats(data));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Error fetching stats:", err);
        setFailed(true);
      });
    return () => controller.abort();
  }, [prefetchedStats]);

  const total = stats ? stats.reduce((acc, s) => acc + s.value, 0) : 0;
  const counts = useCountUp(stats ? [total, ...stats.map((s) => s.value)] : []);

  if (failed) {
    return <p className="jg-total-label" style={{ margin: 0 }}>The gig count is unavailable right now.</p>;
  }

  if (!stats) {
    return (
      <div className="jg-tally-grid" aria-busy="true">
        <div><div className="jg-skel" style={{ height: 64, width: 180 }} /></div>
        <div className="jg-split">
          {[0, 1, 2, 3].map((i) => <div key={i}><div className="jg-skel" style={{ height: 44 }} /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="jg-tally-grid">
      <div>
        <div className="jg-total" aria-label={`${total} gigs played`}>{counts[0] ?? 0}</div>
        <p className="jg-total-label"><span className="jg-live" aria-hidden="true" />Gigs played, counted live from the calendar</p>
      </div>
      <div className="jg-split">
        {stats.map((s, i) => (
          <div key={s.title}>
            <b>{counts[i + 1] ?? 0}</b>
            <span>{s.title}</span>
            {s.description && <p>{s.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const About = ({ prefetchedStats }) => (
  <div className="jg-page jg-page-top">
    <Seo
      title="About James George | Professional Musician in South Africa"
      description="Meet James George, an experienced vocalist and saxophonist performing contemporary, jazz, musical theatre and operatic styles at weddings, corporate events and private functions."
      path="/about"
    />
    <div className="jg-wrap">
      <h1 className="jg-display jg-title rise" style={{ "--i": 0 }}>Programme <em>notes</em></h1>
    </div>

    {/* Live counter sits right under the title so it's on screen the moment the page opens */}
    <section className="jg-tally rise" style={{ "--i": 1 }} aria-label="Gigs played">
      <div className="jg-wrap">
        <GigTally prefetchedStats={prefetchedStats} />
      </div>
    </section>

    <div className="jg-wrap">
      <div className="jg-about-grid">
        <figure className="jg-portrait rise" style={{ "--i": 2 }}>
          <img src={portraitImg} alt="James George smiling with his saxophone on an outdoor stage" />
        </figure>
        <div>
          <div className="jg-notes rise" style={{ "--i": 3 }}>
            <p>
              Hi there! I'm James George, an experienced vocalist and saxophonist, with a few other weird and
              wonderful instruments at my disposal. Over the years I've performed extensively in contemporary,
              jazz, musical theatre and operatic styles.
            </p>
            <p>
              I've played weddings, corporate functions, private events and my own sold-out solo shows across
              the country. I also bring my own professional sound setup to every gig, so that's one less thing
              for you to organise.
            </p>
          </div>
          <div className="jg-credits">
            {bioPillars.map((p) => (
              <article className="jg-credit" key={p.title}>
                <h3 className="jg-display">{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
