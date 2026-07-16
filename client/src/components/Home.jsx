import React from "react";
import FadeInWrapper from "./FadeInWrapper";
import Reviews from "./Reviews";
import Seo from "./Seo";

function Home() {
  return (
    <FadeInWrapper>
      <Seo
        title="James George Music | Professional Musician & Entertainer"
        description="Professional vocalist, saxophonist and pianist available for weddings, corporate events, and private functions in South Africa. Real-time booking and tailored packages."
        path="/"
      />
      <section className="relative w-full h-[100dvh] overflow-hidden m-0 p-0 bg-black">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover z-[1]"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="relative z-[2] h-full w-full flex flex-col justify-center items-center text-center bg-black/20">
          <h1 className="font-['BruneyClassy'] text-[clamp(3rem,12vw,7rem)] text-white m-0 px-5 uppercase tracking-[2px] [text-shadow:2px_4px_20px_rgba(0,0,0,0.8)]">
            James George
          </h1>
        </div>

        <Reviews overlay />
      </section>
    </FadeInWrapper>
  );
}

export default Home;
