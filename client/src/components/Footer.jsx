import React from 'react';
import { Link } from 'react-router-dom';

const SOCIALS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@jamesgeorgemusic' },
  { label: 'Instagram', href: 'https://www.instagram.com/jamesgeorge.music/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61561533225129' },
];

function Footer() {
  return (
    <footer className="jg-foot">
      <div className="jg-wrap">
        <div className="jg-foot-grid">
          <div className="big"><Link to="/">James<br />George</Link></div>
          <div>
            <h4>Pages</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/products">Packages</Link></li>
              <li><Link to="/booking">Book a date</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Listen</h4>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="base">
          <span>James George Music</span>
          <a href="mailto:jamesv234@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>jamesv234@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
