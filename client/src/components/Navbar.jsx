import React from 'react'
import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope } from 'react-icons/fa'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/booking">Booking</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>

      <div className="nav-right">
        <a href="https://www.instagram.com/jamesgeorge.music/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        <a href="https://www.facebook.com/profile.php?id=61561533225129" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
        <a href="mailto:jamesv234@gmail.com"><FaEnvelope /></a>
      </div>
    </nav>
  )
}

export default Navbar
