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
  const [prefetchedStats, setPrefetchedStats] = useState(null);

  useEffect(() => {
    document.body.classList.add("loaded");

    fetch(`${import.meta.env.VITE_API}/api/stats`)
      .then(res => res.json())
      .then(data => setPrefetchedStats(data))
      .catch(err => console.error("Failed to prefetch stats:", err));
  }, []);

  return (
    <Router>
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
      <ChatbotWidget />
    </Router>
  );
}

export default App;
