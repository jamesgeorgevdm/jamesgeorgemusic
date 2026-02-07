import React from "react";
import { useNavigate } from "react-router-dom";
import "./products.css";
import FadeInWrapper from "./FadeInWrapper";

// Packages data
const packages = [
  {
    name: "Restaurant",
    price: "R500/h",
    description: "Ideal for restaurants and lounges. Easy-listening popular classics to enhance the dining experience.",
  },
  {
    name: "Corporate",
    price: "R1,200/h",
    description: "Perfect for corporate events. Background music that sets a professional yet relaxed atmosphere.",
  },
  {
    name: "Weddings",
    price: "R3,500 all-inclusive package",
    description: "Full wedding package including any amount of hours, ceremony music, cocktail hour, and reception entertainment.",
  },
  {
    name: "Private",
    price: "R1,000/h",
    description: "Exclusive performances for private parties or intimate gatherings, tailored to your event.",
  },
  {
    name: "Musical Showcase Performance",
    price: "Negotiable",
    description: "A curated musical experience showcasing a variety of styles and genres or tailored to a venue's needs, perfect for special events or ticketed performances.",
  }
];

// Styles on offer data
const styles = [
  {
    title: "Background / Classic Jazz",
    img: "/images/smooth-jazz.jpg",
    video: "https://www.youtube.com/watch?v=example1",
  },
  {
    title: "Pop & Contemporary",
    img: "/images/pop-contemporary.jpg",
    video: "https://www.youtube.com/watch?v=example2",
  },
  {
    title: "Classical / Operatic",
    img: "/images/classical-orchestral.jpg",
    video: "https://www.youtube.com/watch?v=example3",
  },
];

function Products() {
  const navigate = useNavigate();
  return (
    <FadeInWrapper>
    <div className="products-container">
      <h2>Performance Packages</h2>
      <p className="products-subtitle">
        All packages are booked at a minimum of 3 hours and include equipment / lighting.
      </p>

      {/* Packages grid */}
      <div className="products-grid">
        {packages.map((pkg, index) => (
          <div className="product-card" key={index}>
            <h3>{pkg.name}</h3>
            <p className="price">{pkg.price}</p>
            <p className="description">{pkg.description}</p>
            <button className="book-button" onClick={() => navigate("/Booking")}>Book Now</button>
          </div>
        ))}
      </div>

      {/* Styles on Offer */}
      <h2 className="styles-title">Styles on Offer</h2>
      <div className="styles-container">
        {styles.map((style, index) => (
          <div
            className={`style-card ${index % 2 === 0 ? "left" : "right"}`}
            key={index}
            onClick={() => window.open(style.video, "_blank")}
          >
            <div className="style-info">
              <h3>{style.title}</h3>
              <p>Click to watch a performance</p>
            </div>
            <img src={style.img} alt={style.title} />
          </div>
        ))}
      </div>
    </div>
    </FadeInWrapper>
  );
}

export default Products;
