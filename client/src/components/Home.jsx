import React from "react";
import "./home.css";
import FadeInWrapper from "./FadeInWrapper";

function Home() {
  return (
    <FadeInWrapper>
      <main className="home-container">
        <video
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true" 
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
          <source src="/videos/banner.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        <section className="overlay-content">
          <h1>James George</h1>
        </section>
      </main>
    </FadeInWrapper>
  );
}

export default Home;
