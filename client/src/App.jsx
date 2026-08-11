import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import Booking from './components/Booking';
import Contact from './components/Contact';
import ChatbotWidget from './components/ChatbotWidget';
import LeaveReview from './components/LeaveReview';
import ScrollToTop from './components/ScrollToTop';

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
      {/* Resets scroll on every route change — SPA navigations keep prior scroll otherwise */}
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About prefetchedStats={prefetchedStats} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/leave-review" element={<LeaveReview />} />
        </Routes>
      </main>
      {/* Fixed FAB — lives outside <Routes> so chat state survives page changes */}
      <ChatbotWidget />
    </Router>
  );
}

export default App;
