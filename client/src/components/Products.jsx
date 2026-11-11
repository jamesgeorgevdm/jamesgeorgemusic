import React, { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "./Seo";

import smoothJazzImg from "./images/smooth-jazz.jpg";
import popImg from "./images/pop-contemporary.jpg";
import classicalImg from "./images/classical-orchestral.jpg";

// Rates mirror server/config/packages.js (used by the chat assistant) — keep in sync
const packages = [
  { name: "Weddings", price: "R3,500", note: "All inclusive, any number of hours." },
  { name: "Corporate events", price: "R1,800 / hr", note: "Background music that keeps the room professional yet relaxed." },
  { name: "Private events", price: "R1,500 / hr", note: "Parties and intimate gatherings, tailored to your event." },
  { name: "Restaurants & lounges", price: "Local rates", note: "Easy-listening popular classics for the dining room." },
  { name: "Musical showcase", price: "Negotiable", note: "Curated or ticketed performances across styles and genres." },
];

// A wedding runs in this order, so the tabs are a real sequence
const acts = [
  {
    tab: "Ceremony",
    style: "Classical & opera",
    title: "The walk down the aisle",
    copy: "Refined classical and operatic repertoire for the processional, the signing and the moment you walk out married.",
    img: classicalImg,
    video: "https://youtu.be/DQ2kdlt41Hs",
  },
  {
    tab: "Cocktail hour",
    style: "Background & classic jazz",
    title: "Drinks on the lawn",
    copy: "Warm, easy-listening jazz on saxophone and piano that fills the space without competing with conversation.",
    img: smoothJazzImg,
    video: "https://www.youtube.com/watch?v=qLJJZcFYeXQ",
  },
  {
    tab: "Reception",
    style: "Pop & contemporary",
    title: "Dinner, speeches, dancing",
    copy: "Familiar hits and modern favourites that carry the reception from the first course to the last song.",
    img: popImg,
    video: "https://youtu.be/y-GxjBkyJ34",
  },
];

function Products() {
  const [active, setActive] = useState(0);
  const act = acts[active];

  return (
    <div className="jg-page jg-page-top">
      <Seo
        title="Performance Packages & Pricing | James George Music"
        description="Live music packages for restaurants, corporate events, weddings and private functions in South Africa, with transparent hourly and all-inclusive pricing."
        path="/products"
      />
      <div className="jg-wrap">
        <h1 className="jg-display jg-title rise" style={{ "--i": 0 }}>Programme <em>&amp; fees</em></h1>
        <div className="jg-pk-grid">
          <div className="rise" style={{ "--i": 1 }}>
            <p className="jg-lead">Every booking includes professional sound equipment and lighting, with a repertoire shaped around your event.</p>
            <p className="jg-lead" style={{ marginTop: 18 }}>Hourly bookings have a three-hour minimum.</p>
          </div>
          <section className="jg-card rise" style={{ "--i": 2 }} aria-label="Fees">
            <div className="jg-card-head">This Season</div>
            <ul className="jg-fees">
              {packages.map((p) => (
                <li className="jg-fee" key={p.name}>
                  <span className="jg-fee-name">{p.name}</span>
                  <span className="jg-fee-dots" aria-hidden="true" />
                  <span className="jg-fee-price">{p.price}</span>
                  <span className="jg-fee-note">{p.note}</span>
                </li>
              ))}
            </ul>
            <p className="jg-card-foot">Travel outside the Cape Town area at R4.50/km (AA rates)</p>
          </section>
        </div>
      </div>

      <section className="jg-acts" aria-labelledby="acts-title">
        <div className="jg-wrap">
          <h2 id="acts-title" className="jg-display">A wedding in three acts</h2>
          <p className="jg-lead" style={{ marginTop: 14 }}>One musician from the aisle to the last dance.</p>
          <div className="jg-act-tabs" role="tablist" aria-label="Wedding acts">
            {acts.map((a, i) => (
              <button
                key={a.tab}
                type="button"
                role="tab"
                id={`act-tab-${i}`}
                aria-selected={i === active}
                aria-controls="act-panel"
                className="jg-act-tab"
                onClick={() => setActive(i)}
              >
                {a.tab}
              </button>
            ))}
          </div>
          {/* key remounts the panel so its crossfade replays on every tab change */}
          <div className="jg-act-panel" id="act-panel" role="tabpanel" aria-labelledby={`act-tab-${active}`} key={active}>
            <div className="pic"><img src={act.img} alt="" /></div>
            <div className="txt">
              <span className="when">{act.style}</span>
              <h3 className="jg-display">{act.title}</h3>
              <p>{act.copy}</p>
              <a className="jg-btn jg-btn-line" href={act.video} target="_blank" rel="noopener noreferrer">
                Listen <span className="jg-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="jg-included">
            <span>All three acts are included in the R3,500 wedding package.</span>
            <Link className="jg-btn jg-btn-solid" to="/booking">Book a date <span className="jg-arrow" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Products;
