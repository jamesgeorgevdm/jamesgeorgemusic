import React from "react";
import "./home.css";
import FadeInWrapper from "./FadeInWrapper";
import Reviews from "./Reviews";

function Home() {
  return (
    <FadeInWrapper>
      <div>
        {/* Full-screen hero video */}
        <section className="home-container">
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

          <div className="overlay-content">
            <h1>James George</h1>
          </div>
        </section>

        {/* Reviews section below the fold */}
        <Reviews />
      </div>
    </FadeInWrapper>
  );
}

export default Home;
