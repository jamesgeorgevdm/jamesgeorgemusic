import React from "react";
import { useNavigate } from "react-router-dom";
import FadeInWrapper from "./FadeInWrapper";

const packages = [
  { name: "Restaurant", price: "R500/h", description: "Ideal for restaurants and lounges. Easy-listening popular classics to enhance the dining experience." },
  { name: "Corporate", price: "R1,200/h", description: "Perfect for corporate events. Background music that sets a professional yet relaxed atmosphere." },
  { name: "Weddings", price: "R3,500 all-inclusive package", description: "Full wedding package including any amount of hours, ceremony music, cocktail hour, and reception entertainment." },
  { name: "Private", price: "R1,000/h", description: "Exclusive performances for private parties or intimate gatherings, tailored to your event." },
  { name: "Musical Showcase Performance", price: "Negotiable", description: "A curated musical experience showcasing a variety of styles and genres or tailored to a venue's needs, perfect for special events or ticketed performances." }
];

const styles = [
  { title: "Background / Classic Jazz", img: "/images/smooth-jazz.jpg", video: "https://www.youtube.com/watch?v=example1" },
  { title: "Pop & Contemporary", img: "/images/pop-contemporary.jpg", video: "https://www.youtube.com/watch?v=example2" },
  { title: "Classical / Operatic", img: "/images/classical-orchestral.jpg", video: "https://www.youtube.com/watch?v=example3" },
];

function Products() {
  const navigate = useNavigate();

  return (
    <FadeInWrapper>
      {/* 1. Use the exact Navy Hex */}
      <div className="min-h-screen bg-[#0B1C2C] text-[#F6F2ED] font-['Crimson_Pro'] py-16 px-6 md:px-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* 2. Use the exact Gold Hex for Titles */}
          <h2 className="font-['BruneyClassy'] text-4xl md:text-5xl text-[#D4A455] mb-4">
            Performance Packages
          </h2>
          <p className="text-lg opacity-90">
            All packages are booked at a minimum of 3 hours and include equipment / lighting.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-24">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className="group bg-[#0f2240] p-8 rounded-2xl w-full sm:w-[280px] text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(212,164,85,0.3)] border border-[#D4A455]/20"
            >
              <h3 className="font-['BruneyClassy'] text-2xl text-[#f1d97c] mb-2">{pkg.name}</h3>
              {/* 3. Gold price text */}
              <p className="text-xl font-bold mb-4 text-[#D4A455]">{pkg.price}</p>
              <p className="text-sm leading-relaxed mb-6 opacity-80 min-h-[60px]">{pkg.description}</p>
              <button 
                onClick={() => navigate("/booking")}
                className="w-full py-3 bg-[#D4A455] text-[#0B1C2C] rounded-lg font-bold transition-all hover:bg-[#f1d97c] hover:shadow-[0_0_15px_#f1d97c] cursor-pointer"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {/* Styles Header */}
        <h2 className="font-['BruneyClassy'] text-4xl text-center text-[#f1d97c] mb-12">
          Styles on Offer
        </h2>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto space-y-12 pb-12">
          {/* 4. Fix the Wavy Line color (Encoded #D4A455 is %23D4A455) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 hidden md:block -translate-x-1/2 opacity-30">
             <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg_width=%274%27_height=%271000%27_viewBox=%270_0_4_1000%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath_d=%27M2_0_C3_50,_1_150,_2_200_C3_250,_1_350,_2_400_C3_450,_1_550,_2_600_C3_650,_1_750,_2_800_C3_850,_1_950,_2_1000%27_stroke=%27%23D4A455%27_stroke-width=%274%27_fill=%27transparent%27/%3E%3C/svg%3E')] bg-repeat-y"></div>
          </div>

          {styles.map((style, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 relative z-10 
                ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div 
                onClick={() => window.open(style.video, "_blank")}
                className="w-full md:w-[45%] bg-[#0f2240] p-4 rounded-2xl flex items-center gap-6 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#D4A455]/20 group"
              >
                <img 
                  src={style.img} 
                  alt={style.title} 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="text-left">
                  <h3 className="font-['BruneyClassy'] text-lg md:text-xl text-[#f1d97c]">{style.title}</h3>
                  <p className="text-xs md:text-sm opacity-70">Click to watch a performance</p>
                </div>
              </div>
              <div className="hidden md:block md:w-[45%]"></div>
            </div>
          ))}
        </div>
      </div>
    </FadeInWrapper>
  );
}

export default Products;