import React from "react";
import { Link } from "react-router-dom";
import Seo from "./Seo";

import smoothJazzImg from "./images/smooth-jazz.jpg";
import popImg from "./images/pop-contemporary.jpg";
import classicalImg from "./images/classical-operatic.jpg";

// Rates mirror server/config/packages.js (used by the chat assistant) — keep in sync
const packages = [
  { name: "Weddings", price: "R3,500", note: "All inclusive, any number of hours." },
  { name: "Corporate events", price: "R1,800 / hr", note: "Background music that keeps the room professional yet relaxed." },
  { name: "Private events", price: "R1,500 / hr", note: "Parties and intimate gatherings, tailored to your event." },
  { name: "Restaurants & lounges", price: "Local rates", note: "Easy-listening popular classics for the dining room." },
  { name: "Musical showcase", price: "Negotiable", note: "Curated or ticketed performances across styles and genres." },
];

const styles = [
  {
    title: "Background / Classic Jazz",
    img: smoothJazzImg,
    video: "https://www.youtube.com/watch?v=qLJJZcFYeXQ",
    blurb: "Warm, easy-listening jazz that fills a room without competing with conversation.",
  },
  {
    title: "Pop & Contemporary",
    img: popImg,
    video: "https://www.youtube.com/watch?v=ZuUglV4z0zw",
    blurb: "Familiar hits and modern favourites for receptions, parties and lively venues.",
  },
  {
    title: "Classical / Operatic",
    img: classicalImg,
    video: "https://youtu.be/DQ2kdlt41Hs",
    blurb: "Refined classical and operatic repertoire for sophisticated occasions and special requests.",
  },
];

function Products() {
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
            <p className="jg-lead" style={{ marginTop: 18 }}>Based in Cape Town and occasionally in Gqeberha, with travel further afield for larger events.</p>
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

      <section className="jg-acts" aria-labelledby="styles-title">
        <div className="jg-wrap">
          <h2 id="styles-title" className="jg-display">Styles on offer</h2>
          <p className="jg-lead" style={{ marginTop: 14 }}>Hear each style in performance on YouTube.</p>
          <ul className="jg-styles">
            {styles.map((s) => (
              <li key={s.title}>
                <a
                  className="jg-style"
                  href={s.video}
                  target="_blank"
                  // noopener prevents the new tab from accessing window.opener
                  rel="noopener noreferrer"
                  aria-label={`Watch a ${s.title} performance on YouTube`}
                >
                  {/* Empty alt: the card's label names it */}
                  <div className="pic"><img src={s.img} alt="" loading="lazy" /></div>
                  <div className="txt">
                    <h3 className="jg-display">{s.title}</h3>
                    <p>{s.blurb}</p>
                    <span className="go">Watch on YouTube <span className="jg-arrow" aria-hidden="true">→</span></span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <div className="jg-styles-cta">
            <div>
              <h2 className="jg-display">Have a date in mind?</h2>
              <p>See which dates are open and book online.</p>
            </div>
            <Link className="jg-btn jg-btn-solid" to="/booking">Book a date <span className="jg-arrow" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Products;
