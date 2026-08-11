import React, { useEffect, useState } from "react";

// Mounts children invisible, then flips to visible so CSS can animate the entrance.
// Without the delay, the browser often paints the final state with no transition.
const FadeInWrapper = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ~1 frame delay lets the initial opacity-0 paint commit before we toggle
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-[opacity,transform] duration-[600ms] ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
      {children}
    </div>
  );
};

export default FadeInWrapper;
