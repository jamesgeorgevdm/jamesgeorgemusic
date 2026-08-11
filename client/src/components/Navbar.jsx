import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope } from 'react-icons/fa';

function Navbar() {
  // isButton highlights the primary conversion path (booking) in the nav
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Make a Booking', path: '/booking', isButton: true },
    { name: 'About Me', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  // label used for accessible names — href alone isn't enough for icon-only links
  const socialLinks = [
    { icon: <FaInstagram />, href: "https://www.instagram.com/jamesgeorge.music/", label: "Instagram" },
    { icon: <FaFacebookF />, href: "https://www.facebook.com/profile.php?id=61561533225129", label: "Facebook" },
    { icon: <FaYoutube />, href: "https://www.youtube.com/@jamesgeorgemusic", label: "YouTube" },
    { icon: <FaEnvelope />, href: "mailto:jamesv234@gmail.com", label: "Email" }
  ];

  return (
    <header> 
      {/* Fixed so content scrolls underneath; z-[1000] stays above page sections */}
      <nav className="fixed top-0 left-0 w-full z-[1000] bg-[#0B1C2C] px-4 py-3 md:px-8 md:py-4 flex justify-between items-center font-['BruneyClassy'] shadow-lg border-b border-[#D4A455]/20">
        
        {/* Horizontal scroll on narrow screens instead of wrapping / hamburger */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-5 md:gap-8 list-none m-0 p-0 whitespace-nowrap">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path}
                  className={
                    item.isButton 
                      // Booking CTA styled as a button; other links stay text-only
                      ? "bg-[#D4A455] !text-[#0B1C2C] px-8 py-2.5 rounded-full text-sm md:text-base font-bold no-underline transition-all duration-300 hover:bg-[#F6F2ED] hover:scale-105 shadow-md hover:shadow-[0_0_20px_rgba(212,164,85,0.4)] tracking-wide"
                      : "!text-[#F6F2ED] text-sm md:text-base font-bold no-underline transition-all duration-300 hover:!text-[#D4A455] hover:drop-shadow-[0_0_8px_rgba(212,164,85,0.8)]"
                  }
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-6 flex-shrink-0" aria-label="Social Media Links">
          {socialLinks.map((social) => (
            <a 
              key={social.label}
              href={social.href} 
              // New tab keeps the site open while visitors check social profiles
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label === "Email" ? "Email James" : `Follow on ${social.label}`}
              className="!text-[#F6F2ED] text-lg md:text-xl transition-all duration-300 hover:!text-[#D4A455] hover:scale-110"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;