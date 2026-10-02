import { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { CLINIC, WA_DEFAULT } from '../config';
import { NAV_LINKS } from '../data';
import Icon from '../lib/Icons';
import Button from './Button';

export default function Navbar() {
  const { onScroll, scrollTo, openBooking, loaded, lockScroll, unlockScroll } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    return onScroll((y, limit) => {
      setScrolled(y > 32);
      setProgress(Math.min(1, y / limit));
      const goingDown = y > lastY.current + 4;
      const goingUp = y < lastY.current - 4;
      if (y > 480 && goingDown) setHidden(true);
      else if (goingUp || y <= 480) setHidden(false);
      lastY.current = y;
    });
  }, [onScroll]);

  // hold the page still under the mobile menu (and put it back on close)
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return unlockScroll;
  }, [menuOpen, lockScroll, unlockScroll]);

  useEffect(() => {
    document.documentElement.classList.toggle('is-menu-open', menuOpen);
    return () => {
      document.documentElement.classList.remove('is-menu-open');
    };
  }, [menuOpen]);

  // Esc closes; so does growing past the burger breakpoint — otherwise a
  // rotate/resize would leave an off-screen menu holding the scroll lock.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    const mq = window.matchMedia('(min-width: 1025px)');
    const onWide = (e) => { if (e.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  }, [menuOpen]);

  const go = (target) => (e) => {
    e.preventDefault();
    if (!menuOpen) {
      scrollTo(target);
      return;
    }
    setMenuOpen(false);
    // let the panel start sliding clear before the page moves underneath it
    setTimeout(() => scrollTo(target), 260);
  };

  return (
    <>
      <header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''} ${loaded ? 'is-in' : ''}`}
      >
        <div className="nav__inner">
          <a className="nav__brand" href="#top" onClick={go('#top')} aria-label={`${CLINIC.name} — home`} data-cursor="hover">
            <span className="nav__mark" aria-hidden="true">
              <svg viewBox="0 0 80 80" width="40" height="40">
                <rect width="80" height="80" rx="18" fill="#FAF5FF" />
                <path d="M40 25 C34 16 24 17 24 26 C24 33 35 42 40 45 C45 42 56 33 56 26 C56 17 46 16 40 25 Z" fill="#E11D48" />
                <text x="40" y="32" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF" textAnchor="middle">OT</text>
                <path d="M37 46 C34 43 36 41 38 41 C39 43 38 45 37 46 Z" fill="#16A34A" />
                <path d="M43 46 C46 43 44 41 42 41 C41 43 42 45 43 46 Z" fill="#16A34A" />
                <path d="M36 70 C24 66 18 52 20 38 C21 33 25 35 25 39 C23 50 28 61 36 65 C38 66 38 69 36 70 Z" fill="#6B21A8" />
                <path d="M29 64 C23 56 23 44 26 36 C27 34 30 36 29 39 C27 46 27 54 31 60 C32 62 31 63 29 64 Z" fill="#7C3AED" />
                <path d="M44 70 C56 66 62 52 60 38 C59 33 55 35 55 39 C57 50 52 61 44 65 C42 66 42 69 44 70 Z" fill="#16A34A" />
                <path d="M51 64 C57 56 57 44 54 36 C53 34 50 36 51 39 C53 46 53 54 49 60 C48 62 49 63 51 64 Z" fill="#22C55E" />
                <circle cx="34" cy="49" r="3" fill="#EC4899" />
                <path d="M32 53 C34 51 38 52 38 57 C38 62 31 63 32 53 Z" fill="#EC4899" />
                <circle cx="45" cy="48" r="3.4" fill="#F59E0B" />
                <path d="M42 52 C45 50 49 51 48 57 C48 62 41 62 42 52 Z" fill="#F59E0B" />
              </svg>
            </span>
            <span className="nav__brand-txt">
              <strong><span style={{ color: 'var(--ink)' }}>Healing</span> <span style={{ color: 'var(--sage)' }}>Hands</span></strong>
              <em>Child Development Centre</em>
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a key={l.target} href={l.target} onClick={go(l.target)} className="nav__link" data-cursor="hover">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a className="nav__phone" href={CLINIC.phoneHref} data-cursor="hover" aria-label={`Call ${CLINIC.phoneDisplay}`} title={`Call ${CLINIC.phoneDisplay}`}>
              <Icon name="phone" size={18} strokeWidth={2} />
              <span>{CLINIC.phoneDisplay}</span>
            </a>
            <a className="nav__wa" href={WA_DEFAULT} target="_blank" rel="noreferrer" data-cursor="hover" aria-label={`WhatsApp ${CLINIC.name}`} title="Chat on WhatsApp">
              <Icon name="whatsapp" size={18} />
              <span>WhatsApp</span>
            </a>
            {/* <Button variant="primary" className="btn--sm nav__cta" onClick={() => openBooking()} icon="calendar">
              Book appointment
            </Button> */}
            <button
              className={`nav__burger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              <span /><span />
            </button>
          </div>
        </div>
        <span className="nav__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </header>

      {/* Mobile full-screen menu */}
      <div className={`menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="menu__links" aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a key={l.target} href={l.target} onClick={go(l.target)} style={{ '--i': i }} className="menu__link">
              <span>{l.label}</span>
              <Icon name="arrow" size={22} />
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          {/* <button className="btn btn--primary btn--block" onClick={() => { setMenuOpen(false); openBooking(); }}>
            <span className="btn__solo">Book appointment</span>
            <span className="btn__ic"><Icon name="calendar" size={16} strokeWidth={2} /></span>
          </button> */}
          <div className="menu__row">
            <a className="btn btn--ghost btn--half" href={CLINIC.phoneHref}>
              <span className="btn__solo">Call</span>
              <span className="btn__ic"><Icon name="phone" size={15} strokeWidth={2} /></span>
            </a>
            <a className="btn btn--wa btn--half" href={WA_DEFAULT} target="_blank" rel="noreferrer">
              <span className="btn__solo">WhatsApp</span>
              <span className="btn__ic"><Icon name="whatsapp" size={15} strokeWidth={2} /></span>
            </a>
          </div>
          <p className="menu__hours">Open today · 8:00 AM – 9:00 PM</p>
        </div>
      </div>
    </>
  );
}
