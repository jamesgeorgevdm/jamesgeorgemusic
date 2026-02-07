import React, { useEffect, useState } from "react";
import "./FadeInWrapper.css";

const FadeInWrapper = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50); // slight delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fade-in-wrapper ${visible ? "visible" : ""}`}>
      {children}
    </div>
  );
};

export default FadeInWrapper;
