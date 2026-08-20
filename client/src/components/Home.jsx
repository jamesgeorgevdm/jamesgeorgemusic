import React from "react";
import { FaPlay } from "react-icons/fa";
import FadeInWrapper from "./FadeInWrapper";
import Reviews from "./Reviews";
import Seo from "./Seo";
import isithathaImg from "./images/Isithatha Sessions.png";

const ISITHATHA_PLAYLIST =
  "https://www.youtube.com/watch?v=K-RMwp_zS9g&list=PLULcwiuFcfE8";

function FeaturedSession() {
  return (
    <a
      href={ISITHATHA_PLAYLIST}
      target="_blank"
      // noopener prevents the new tab from accessing window.opener
      rel="noopener noreferrer"
      aria-label="Watch Isithatha Sessions playlist on YouTube"
      className="group relative pointer-events-auto order-1 md:order-2 block w-full md:w-[320px] lg:w-[400px] xl:w-[460px] shrink-0 overflow-hidden rounded-[20px] border border-[rgba(212,175,55,0.25)] bg-[rgba(9,18,39,0.55)] backdrop-blur-[16px] no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A455] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-[#D4A455]/60 hover:bg-[rgba(9,18,39,0.75)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_40px_rgba(212,164,85,0.12)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* Empty alt — the link aria-label carries the accessible name */}
        <img
          src={isithathaImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-105 transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C] via-[#0B1C2C]/50 to-[#0B1C2C]/10"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#D4A455]/90 text-[#0B1C2C] shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-400 group-hover:scale-110 group-hover:bg-[#f1d97c]"
            aria-hidden="true"
          >
            <FaPlay className="ml-0.5 text-sm md:text-lg" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-5 pt-10 text-left">
          <p className="m-0 mb-0.5 text-[0.62rem] md:text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#D4A455]">
            Featured Session
          </p>
          <h2 className="font-['BruneyClassy'] text-lg md:text-xl lg:text-2xl text-[#f1d97c] m-0 mb-1.5 md:mb-2 leading-snug">
            Isithatha Sessions
          </h2>
          <span className="inline-flex items-center gap-2 text-[0.68rem] md:text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#D4A455] transition-colors duration-300 group-hover:text-[#f1d97c]">
            Watch playlist
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </a>
  );
}

function Home() {
  return (
    <FadeInWrapper>
      <Seo
        title="James George Music | Professional Musician & Entertainer"
        description="Professional vocalist, saxophonist and pianist available for weddings, corporate events, and private functions in South Africa. Real-time booking and tailored packages."
        path="/"
      />
      {/* 100dvh avoids mobile browser chrome shrinking/growing the hero mid-scroll */}
      <section className="relative w-full h-[100dvh] overflow-hidden m-0 p-0 bg-black">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover z-[1]"
          autoPlay
          loop
          muted
          // playsInline required for iOS autoplay; muted + no controls keep it decorative
          playsInline
          poster="/images/poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="relative z-[2] h-full w-full flex flex-col justify-center items-center text-center bg-black/20 pb-[40vh] md:pb-[26vh]">
          <h1 className="font-['BruneyClassy'] text-[clamp(3rem,12vw,7rem)] text-white m-0 px-5 uppercase tracking-[2px] [text-shadow:2px_4px_20px_rgba(0,0,0,0.8)]">
            James George
          </h1>
        </div>

        {/* overlay packs reviews left and the featured session right into the hero footer */}
        <div className="absolute bottom-0 left-0 right-0 z-[3] pb-4 md:pb-5 bg-gradient-to-t from-[rgba(9,18,39,0.85)] to-transparent pointer-events-none">
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 md:gap-5 px-4 md:pl-8 md:pr-24 max-w-[1500px] mx-auto">
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <Reviews overlay />
            </div>
            <FeaturedSession />
          </div>
        </div>
      </section>
    </FadeInWrapper>
  );
}

export default Home;
