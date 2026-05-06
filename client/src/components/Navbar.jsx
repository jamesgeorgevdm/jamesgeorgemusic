import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope } from 'react-icons/fa';

function Navbar() {
  // Array of navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Make a Booking', path: '/booking', isButton: true },
    { name: 'About Me', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  // Array of social media links with corresponding icons and URLs
  const socialLinks = [
    { icon: <FaInstagram />, href: "https://www.instagram.com/jamesgeorge.music/" },
    { icon: <FaFacebookF />, href: "https://www.facebook.com/profile.php?id=61561533225129" },
    { icon: <FaYoutube />, href: "https://www.youtube.com/@jamesgeorgemusic" },
    { icon: <FaEnvelope />, href: "mailto:jamesv234@gmail.com" }
  ];

  return (
    <header> 
      <nav className="fixed top-0 left-0 w-full z-[1000] bg-[#0B1C2C] px-4 py-3 md:px-8 md:py-4 flex justify-between items-center font-['BruneyClassy'] shadow-lg border-b border-[#D4A455]/20">
        
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-5 md:gap-8 list-none m-0 p-0 whitespace-nowrap">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path}
                  className={
                    item.isButton 
                    // Draws attention to the "Make a Booking" link by styling it as a button, while other links are styled as regular text with hover effects
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
          {socialLinks.map((social, i) => (
            <a 
              key={i}
              href={social.href} 
              target="_blank" // Opens the link in a new tab to keep users on the site while allowing them to explore social media profiles 
              rel="noopener noreferrer"
              aria-label={`Follow on ${social.href.includes('instagram') ? 'Instagram' : social.href.includes('facebook') ? 'Facebook' : 'YouTube'}`}
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