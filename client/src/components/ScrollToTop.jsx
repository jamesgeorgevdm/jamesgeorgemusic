import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router preserves scroll position across navigations; this restores
// top-of-page behaviour users expect when clicking nav links.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Renders nothing — side-effect-only helper mounted once in App
  return null;
}

export default ScrollToTop;
