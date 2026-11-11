import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import Booking from './components/Booking';
import Contact from './components/Contact';
import ChatbotWidget from './components/ChatbotWidget';
import LeaveReview from './components/LeaveReview';

// Label shown on the curtain while it covers the screen
const PAGE_LABELS = {
  '/': 'James George',
  '/about': 'About',
  '/products': 'Packages',
  '/booking': 'Book a date',
  '/contact': 'Contact',
  '/leave-review': 'Leave a review',
};

// Curtain timings must match .jg-curtain.cover / .lift durations in index.css
const COVER_MS = 1150;
const LIFT_MS = 940;

function Pages({ prefetchedStats }) {
  const location = useLocation();
  // The routes keep rendering the old page until the curtain has covered the screen
  const [shown, setShown] = useState(location);
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (location.pathname === shown.pathname) {
      if (location !== shown) setShown(location);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(location);
      window.scrollTo(0, 0);
      return;
    }
    setPhase('cover');
    const swap = setTimeout(() => {
      setShown(location);
      window.scrollTo(0, 0);
      setPhase('lift');
    }, COVER_MS);
    const done = setTimeout(() => setPhase('idle'), COVER_MS + LIFT_MS);
    return () => { clearTimeout(swap); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <div className={`jg-curtain ${phase === 'idle' ? '' : phase}`} aria-hidden="true">
        <span>{PAGE_LABELS[location.pathname] || 'James George'}</span>
      </div>
      <main>
        <Routes location={shown}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About prefetchedStats={prefetchedStats} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/leave-review" element={<LeaveReview />} />
        </Routes>
      </main>
      {/* Home is a single screen; every other page gets the footer */}
      {shown.pathname !== '/' && <Footer />}
    </>
  );
}

function App() {
  // Prefetch at app level so /about can animate immediately if the user navigates there
  const [prefetchedStats, setPrefetchedStats] = useState(null);

  useEffect(() => {
    // CSS uses body.loaded to reveal the page after fonts/styles are ready
    document.body.classList.add("loaded");

    fetch(`${import.meta.env.VITE_API}/api/stats`)
      .then(res => res.json())
      .then(data => setPrefetchedStats(data))
      .catch(err => console.error("Failed to prefetch stats:", err));
  }, []);

  return (
    <Router>
      <Navbar />
      <Pages prefetchedStats={prefetchedStats} />
      {/* Fixed FAB — lives outside <Routes> so chat state survives page changes */}
      <ChatbotWidget />
    </Router>
  );
}

export default App;
