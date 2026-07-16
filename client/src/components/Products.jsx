import React from "react";
import { useNavigate } from "react-router-dom";
import FadeInWrapper from "./FadeInWrapper";
import Seo from "./Seo";

import smoothJazzImg from "./images/smooth-jazz.jpg";
import popImg from "./images/pop-contemporary.jpg";
import classicalImg from "./images/classical-orchestral.jpg";

// Data for performance packages
const packages = [
  { name: "Restaurant", price: "R500/h", description: "Ideal for restaurants and lounges. Easy-listening popular classics to enhance the dining experience." },
  { name: "Corporate", price: "R1,200/h", description: "Perfect for corporate events. Background music that sets a professional yet relaxed atmosphere." },
  { name: "Weddings", price: "R3,500 all-inclusive package", description: "Full wedding package including any amount of hours, ceremony music, cocktail hour, and reception entertainment." },
  { name: "Private", price: "R1,000/h", description: "Exclusive performances for private parties or intimate gatherings, tailored to your event." },
  { name: "Musical Showcase Performance", price: "Negotiable", description: "A curated musical experience showcasing a variety of styles and genres or tailored to a venue's needs, perfect for special events or ticketed performances." }
];

// Data for styles on offer with corresponding images and video links
const styles = [
  { title: "Background / Classic Jazz", img: smoothJazzImg, video: "https://www.youtube.com/@jamesgeorgemusic" },
  { title: "Pop & Contemporary", img: popImg, video: "https://www.youtube.com/@jamesgeorgemusic" },
  { title: "Classical / Operatic", img: classicalImg, video: "https://www.youtube.com/@jamesgeorgemusic" },
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
        
        {/* Header Section */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-['BruneyClassy'] text-4xl md:text-5xl text-[#D4A455] mb-4">
            Performance Packages
          </h1>
          <p className="text-lg opacity-90">
            All packages are booked at a minimum of 3 hours and include equipment / lighting.
          </p>
        </header>

        {/* Packages Grid - Wrapped in a section */}
        <section className="flex flex-wrap justify-center gap-8 mb-24" aria-label="Available Packages">
          {packages.map((pkg, index) => (
            <article 
              key={index}
              className="group bg-[#0f2240] p-8 rounded-2xl w-full sm:w-[280px] text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(212,164,85,0.3)] border border-[#D4A455]/20"
            >
              <h2 className="font-['BruneyClassy'] text-2xl text-[#f1d97c] mb-2">{pkg.name}</h2>
              <p className="text-xl font-bold mb-4 text-[#D4A455]">{pkg.price}</p>
              <p className="text-sm leading-relaxed mb-6 opacity-80 min-h-[60px]">{pkg.description}</p>
              <button 
                onClick={() => navigate("/booking")} // Navigates to the booking page when the button is clicked, allowing users to easily proceed with booking after viewing package details
                className="w-full py-3 bg-[#D4A455] text-[#0B1C2C] rounded-lg font-bold transition-all hover:bg-[#f1d97c] hover:shadow-[0_0_15px_#f1d97c] cursor-pointer"
              >
                Book {pkg.name}
              </button>
            </article>
          ))}
        </section>

        {/* Styles Section */}
        <section aria-labelledby="styles-heading">
          <h2 id="styles-heading" className="font-['BruneyClassy'] text-4xl text-center text-[#f1d97c] mb-12">
            Styles on Offer
          </h2>

          <div className="relative max-w-5xl mx-auto space-y-12 pb-12">
            {/* Timeline Line decorative - hidden from screen readers */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 hidden md:block -translate-x-1/2 opacity-30" aria-hidden="true">
               <div className="h-full w-full bg-[url('data:image/svg+xml,...')] bg-repeat-y"></div>
            </div>

            {styles.map((style, index) => (
              <article 
                key={index}
                className={`flex flex-col md:flex-row items-center gap-8 relative z-10 
                  ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`} // Alternates the layout of each style card for visual interest, with images on opposite sides for even and odd indexed items
              >
                <button 
                  onClick={() => window.open(style.video, "_blank")}
                  className="w-full md:w-[45%] bg-[#0f2240] p-4 rounded-2xl flex items-center gap-6 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#D4A455]/20 group"
                  aria-label={`Watch ${style.title} performance video`}
                >
                  <img 
                    src={style.img} 
                    alt="" /* Alt empty because the title is in the heading below */
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="text-left">
                    <h3 className="font-['BruneyClassy'] text-lg md:text-xl text-[#f1d97c]">{style.title}</h3>
                    <p className="text-xs md:text-sm opacity-70">VIDEO CONTENT COMING SOON</p>
                  </div>
                </button>
                <div className="hidden md:block md:w-[45%]" aria-hidden="true"></div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </FadeInWrapper>
  );
}

export default Products;