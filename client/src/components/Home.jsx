import React from "react";
import "./home.css";
import FadeInWrapper from "./FadeInWrapper";

function Home() {
  return (
    <FadeInWrapper>
      <main className="home-container">
        {/* Background Video */}
        <video
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/poster.jpg" 
          aria-hidden="true"
        >
          <source src="/videos/banner.mp4" type="video/mp4" />
          <source src="/videos/banner.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Hero Text Overlay */}
        <div className="overlay-content">
          <h1>James George</h1>
        </div>
      </main>
    </FadeInWrapper>
  );
}

export default Home;