import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Background video */}
      <video className="background-video" autoPlay loop muted playsInline preload="auto">
        <source src="/videos/banner.mp4" type="video/mp4" />
        <source src="/videos/banner.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay text */}
      <div className="overlay-content">
        <h1>James George Music</h1>
        <p>Tenor saxophonist and vocalist performing across South Africa.</p>
      </div>
    </div>
  );
}

export default Home;
