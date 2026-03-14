import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope } from 'react-icons/fa';

function Navbar() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Me', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Booking', path: '/booking' },
    { name: 'Contact', path: '/contact' },
  ];

  const socialLinks = [
    { icon: <FaInstagram />, href: "https://www.instagram.com/jamesgeorge.music/" },
    { icon: <FaFacebookF />, href: "https://www.facebook.com/profile.php?id=61561533225129" },
    { icon: <FaYoutube />, href: "https://youtube.com" },
    { icon: <FaEnvelope />, href: "mailto:jamesv234@gmail.com" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-[#0B1C2C] px-4 py-3 md:px-8 md:py-4 flex justify-between items-center font-['BruneyClassy'] shadow-lg border-b border-[#D4A455]/20">
      
      {/* Navigation Links - Scrollable on mobile */}
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <ul className="flex items-center gap-5 md:gap-8 list-none m-0 p-0 whitespace-nowrap">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path}
                className="!text-[#F6F2ED] text-sm md:text-base font-bold no-underline transition-all duration-300 hover:!text-[#D4A455] hover:drop-shadow-[0_0_8px_rgba(212,164,85,0.8)]"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-4 md:gap-6 ml-6 flex-shrink-0">
        {socialLinks.map((social, i) => (
          <a 
            key={i}
            href={social.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="!text-[#F6F2ED] text-lg md:text-xl transition-all duration-300 hover:!text-[#D4A455] hover:scale-110"
          >
            {social.icon}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;