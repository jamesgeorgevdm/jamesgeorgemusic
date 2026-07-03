import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import Booking from './components/Booking';
import Contact from './components/Contact';
import ChatbotWidget from './components/ChatbotWidget';
import LeaveReview from './components/LeaveReview';

const ROUTE_TITLES = {
  '/':             'James George Music | Professional Musician & Entertainer',
  '/about':        'About | James George Music',
  '/products':     'Packages & Products | James George Music',
  '/booking':      'Book Now | James George Music',
  '/contact':      'Contact | James George Music',
  '/leave-review': 'Leave a Review | James George Music',
};

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    document.title = ROUTE_TITLES[location.pathname] ?? 'James George Music';
  }, [location.pathname]);
  return null;
}

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
      <TitleUpdater />
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
