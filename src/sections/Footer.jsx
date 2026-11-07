import { useScroll } from '../context/ScrollContext';
import { CLINIC } from '../config';
import { NAV_LINKS, SERVICES } from '../data';
import Icon from '../lib/Icons';

export default function Footer() {
  const { scrollTo, openBooking } = useScroll();
  const go = (target) => (e) => { e.preventDefault(); scrollTo(target); };

  return (
    <footer className="footer" data-scroll-section>
      <div className="container">
        <div className="footer__top">
          <p className="footer__tag" data-reveal>Nurturing every step of your child’s development.</p>
          <h2 className="footer__wordmark" aria-label={CLINIC.name}>
            <span className="footer__wordmark-line">
              {"Healing Hands".split('').map((ch, i) => (
                <span key={`l1-${i}`} style={{ '--i': i }}>{ch === ' ' ? '\u00A0' : ch}</span>
              ))}
            </span>
            <span className="footer__wordmark-line">
              {"Child Development Centre".split('').map((ch, i) => (
                <span key={`l2-${i}`} style={{ '--i': i + 13 }}>{ch === ' ' ? '\u00A0' : ch}</span>
              ))}
            </span>
          </h2>
        </div>

        <div className="footer__grid">
          <div className="footer__col footer__col--brand">
            <p>
              A specialized Child Development Centre in {CLINIC.city} providing expert Occupational,
              Speech, Behavior, and Physical therapy for children.
            </p>
            <button className="btn btn--primary btn--sm" onClick={() => openBooking()} data-cursor="hover">
              <span className="btn__solo">Book consultation</span>
              <span className="btn__ic"><Icon name="calendar" size={14} strokeWidth={2} /></span>
            </button>
          </div>

          <nav className="footer__col" aria-label="Explore">
            <h4>Explore</h4>
            {NAV_LINKS.map((l) => (
              <a key={l.target} href={l.target} onClick={go(l.target)} data-cursor="hover">{l.label}</a>
            ))}
          </nav>

          <nav className="footer__col" aria-label="Services">
            <h4>Services</h4>
            {SERVICES.slice(0, 5).map((s) => (
              <a key={s.id} href="#services" onClick={go('#services')} data-cursor="hover">{s.title}</a>
            ))}
          </nav>

          <div className="footer__col" aria-label="Contact">
            <h4>Contact & Visit</h4>
            <p>{CLINIC.address}</p>
            <p className="footer__landmark" style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>Landmark: {CLINIC.landmark}</p>
            <a href={CLINIC.phoneHref} data-cursor="hover">{CLINIC.phoneDisplay}</a>
            <a href={`mailto:${CLINIC.email}`} data-cursor="hover">{CLINIC.email}</a>
            <p className="footer__hours">Mon–Fri: 9:00 AM – 7:00 PM | Sat: 9:00 AM – 1:00 PM</p>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 {CLINIC.name}. All rights reserved.</p>
          <p className="footer__legal">
            <a href="#top" onClick={(e) => e.preventDefault()} data-cursor="hover">Privacy</a>
            <a href="#top" onClick={(e) => e.preventDefault()} data-cursor="hover">Terms</a>
          </p>
          <button className="footer__up round-btn" onClick={() => scrollTo('#top', { offset: 0 })} aria-label="Back to top" data-cursor="hover">
            <Icon name="arrowR" size={16} strokeWidth={2} className="rot--90" />
          </button>
        </div>
      </div>
    </footer>
  );
}
