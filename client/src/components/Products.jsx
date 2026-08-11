import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

import smoothJazzImg from "./images/smooth-jazz.jpg";
import popImg from "./images/pop-contemporary.jpg";
import classicalImg from "./images/classical-orchestral.jpg";

const packages = [
  { name: "Restaurant", price: "R500/h", description: "Ideal for restaurants and lounges. Easy-listening popular classics to enhance the dining experience." },
  { name: "Corporate", price: "R1,200/h", description: "Perfect for corporate events. Background music that sets a professional yet relaxed atmosphere." },
  { name: "Weddings", price: "R3,500 all-inclusive package", description: "Full wedding package including any amount of hours, ceremony music, cocktail hour, and reception entertainment." },
  { name: "Private", price: "R1,000/h", description: "Exclusive performances for private parties or intimate gatherings, tailored to your event." },
  { name: "Musical Showcase Performance", price: "Negotiable", description: "A curated musical experience showcasing a variety of styles and genres or tailored to a venue's needs, perfect for special events or ticketed performances." }
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
    video: "https://youtu.be/y-GxjBkyJ34",
    blurb: "Familiar hits and modern favourites for receptions, parties and lively venues.",
  },
  {
    title: "Classical / Operatic",
    img: classicalImg,
    video: "https://youtu.be/DQ2kdlt41Hs",
    blurb: "Refined classical and operatic repertoire for ceremonies and formal occasions.",
  },
];

function Products() {
  const navigate = useNavigate();

  return (
    <FadeInWrapper>
      <Seo
        title="Performance Packages & Pricing | James George Music"
        description="Live music packages for restaurants, corporate events, weddings and private functions in South Africa — transparent hourly and all-inclusive pricing."
        path="/products"
      />
      <main className="min-h-screen bg-[#0B1C2C] text-[#F6F2ED] font-['Crimson_Pro'] py-16 px-6 md:px-12">

        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-['BruneyClassy'] text-4xl md:text-5xl text-[#D4A455] mb-4">
            Performance Packages
          </h1>
          <p className="text-lg opacity-90">
            All packages are booked at a minimum of 3 hours and include equipment / lighting.
          </p>
        </header>

        {/* Pricing list — Book CTAs deep-link into /booking rather than duplicating the form */}
        <section
          className="max-w-4xl mx-auto mb-20 md:mb-28"
          aria-label="Available Packages"
        >
          <ul className="list-none m-0 p-0 divide-y divide-[#D4A455]/15">
            {packages.map((pkg) => (
              <li key={pkg.name}>
                <div className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-8 items-start md:items-center py-6 md:py-8 px-0 md:px-3 md:-mx-3 rounded-xl transition-colors duration-400 hover:bg-white/[0.03]">
                  <div className="min-w-0 text-left">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-x-4 gap-y-1 mb-2">
                      <h2 className="font-['BruneyClassy'] text-[1.35rem] sm:text-2xl md:text-[1.7rem] text-[#f1d97c] m-0 leading-snug transition-colors duration-300 group-hover:text-[#ffd700]">
                        {pkg.name}
                      </h2>
                      <span className="text-[#D4A455] font-bold tracking-wide text-sm md:text-base">
                        {pkg.price}
                      </span>
                    </div>
                    <p className="text-sm md:text-[0.95rem] leading-relaxed text-[#F6F2ED]/75 m-0 max-w-2xl">
                      {pkg.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/booking")}
                    className="w-full md:w-auto justify-self-stretch md:justify-self-end shrink-0 px-5 py-2.5 rounded-full border border-[#D4A455]/50 bg-transparent text-[#D4A455] font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer hover:bg-[#D4A455] hover:text-[#0B1C2C] hover:border-[#D4A455] group-hover:shadow-[0_0_20px_rgba(212,164,85,0.2)]"
                  >
                    Book
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Style samples open YouTube in a new tab — keeps visitors on-site via the packages CTA */}
        <section aria-labelledby="styles-heading" className="pb-8">
          <header className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 id="styles-heading" className="font-['BruneyClassy'] text-3xl md:text-4xl text-[#f1d97c] mb-3">
              Styles on Offer
            </h2>
            <p className="text-sm md:text-base opacity-75">
              Hear each style in performance — click a card to watch on YouTube.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {styles.map((style) => (
              <a
                key={style.title}
                href={style.video}
                target="_blank"
                // noopener prevents the new tab from accessing window.opener
                rel="noopener noreferrer"
                aria-label={`Watch ${style.title} performance video on YouTube`}
                className="group relative block overflow-hidden rounded-2xl border border-[#D4A455]/25 bg-[#0f2240] no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A455] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-[#D4A455]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_40px_rgba(212,164,85,0.12)]"
              >
                <div className="relative aspect-[16/10] lg:aspect-[4/5] overflow-hidden">
                  {/* Empty alt — title below carries the accessible name for the card */}
                  <img
                    src={style.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C] via-[#0B1C2C]/55 to-[#0B1C2C]/15"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-[#D4A455]/90 text-[#0B1C2C] shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-400 group-hover:scale-110 group-hover:bg-[#f1d97c]"
                      aria-hidden="true"
                    >
                      <FaPlay className="ml-0.5 lg:ml-1 text-base lg:text-xl" />
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6 pt-10 lg:pt-16 text-left">
                    <h3 className="font-['BruneyClassy'] text-lg lg:text-2xl text-[#f1d97c] mb-1 lg:mb-2 leading-snug">
                      {style.title}
                    </h3>
                    {/* Blurb only on large screens — mobile cards stay image-forward */}
                    <p className="hidden lg:block text-sm leading-relaxed text-[#F6F2ED]/80 mb-4">
                      {style.blurb}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[0.7rem] lg:text-xs font-bold uppercase tracking-[0.14em] text-[#D4A455] transition-colors duration-300 group-hover:text-[#f1d97c]">
                      Watch performance
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </FadeInWrapper>
  );
}

export default Products;