import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Packages', path: '/products' },
  { name: 'Contact', path: '/contact' },
];

function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const indRef = useRef(null);

  // One gold underline slides between links instead of each link drawing its own
  useLayoutEffect(() => {
    const place = () => {
      const active = listRef.current?.querySelector('a.l[aria-current="page"]');
      const ind = indRef.current;
      if (!ind) return;
      if (!active) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1;
      ind.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth})`;
    };
    place();
    window.addEventListener('resize', place);
    // Fonts can land after first paint and change link widths
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = (path) => (pathname === path ? 'page' : undefined);

  return (
    <header>
      {/* Transparent over the home film, solid everywhere else */}
      <nav className={`jg-nav ${pathname === '/' ? '' : 'solid'}`} aria-label="Main">
        <div className="jg-wrap">
          <Link className="jg-mark" to="/">James George</Link>
          <ul className="jg-links" ref={listRef}>
            {LINKS.map((l) => (
              <li key={l.path}><Link className="l" to={l.path} aria-current={current(l.path)}>{l.name}</Link></li>
            ))}
            <li>
              <Link className="jg-btn jg-btn-solid jg-nav-book" to="/booking" aria-current={current('/booking')}>
                Book a date <span className="jg-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="jg-ind" ref={indRef} aria-hidden="true" />
          </ul>
          {/* Phones: booking stays one tap away beside the menu */}
          <div className="jg-nav-end">
            <Link className="jg-btn jg-btn-solid jg-nav-book" to="/booking" aria-current={current('/booking')}>
              Book <span className="jg-arrow" aria-hidden="true">→</span>
            </Link>
            <button
              type="button"
              className="jg-menu-btn"
              aria-expanded={open}
              aria-controls="jg-sheet"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>
      <nav id="jg-sheet" className={`jg-sheet ${open ? 'open' : ''}`} aria-label="Pages" aria-hidden={!open}>
        {[...LINKS.slice(0, 3), { name: 'Book a date', path: '/booking' }, LINKS[3]].map((l) => (
          <Link key={l.path} to={l.path} aria-current={current(l.path)} tabIndex={open ? 0 : -1}>{l.name}</Link>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
