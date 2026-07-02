import React, { useEffect, useState } from "react";

// Simple wrapper component that applies a fade-in effect to its children when mounted, using a combination of state and CSS classes to trigger the animation
const FadeInWrapper = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50); // slight delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-[opacity,transform] duration-[600ms] ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
      {children}
    </div>
  );
};

export default FadeInWrapper;
