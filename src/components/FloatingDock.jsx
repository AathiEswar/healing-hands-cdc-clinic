import { useEffect, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { CLINIC, WA_DEFAULT } from '../config';
import Icon from '../lib/Icons';
import { Magnetic } from '../lib/anim';

/**
 * Conversion safety net:
 *  - mobile: sticky bottom dock (Call · WhatsApp · Book) after the hero
 *  - desktop: floating magnetic "Book" pill, bottom-right
 */
export default function FloatingDock() {
  const { onScroll, openBooking, booking } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => onScroll((y) => setVisible(y > 280)), [onScroll]);

  const shown = visible && !booking.open;

  return (
    <>
      {/* Desktop floating action pills */}
      <div className={`fab ${shown ? 'is-in' : ''}`}>
        <Magnetic strength={0.3}>
          <a
            className="fab__btn fab__btn--phone"
            href={CLINIC.phoneHref}
            data-cursor="hover"
            aria-label={`Call ${CLINIC.name}`}
          >
            <Icon name="phone" size={18} strokeWidth={2} />
            <span>Call</span>
          </a>
        </Magnetic>

        <Magnetic strength={0.3}>
          <a
            className="fab__btn fab__btn--wa"
            href={WA_DEFAULT}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
            aria-label="Chat on WhatsApp"
          >
            <Icon name="whatsapp" size={19} />
            <span>WhatsApp</span>
          </a>
        </Magnetic>

        {/* <Magnetic strength={0.4}>
          <button className="fab__btn" onClick={() => openBooking()} data-cursor="hover" aria-label="Book an appointment">
            <span className="fab__ring" aria-hidden="true" />
            <Icon name="calendar" size={18} strokeWidth={2} />
            <span>Book now</span>
          </button>
        </Magnetic> */}
      </div>

      {/* Mobile sticky dock */}
      <nav className={`dock ${shown ? 'is-in' : ''}`} aria-label="Quick actions">
        <a className="dock__item dock__item--phone" href={CLINIC.phoneHref} aria-label={`Call ${CLINIC.name}`} title="Call clinic">
          <Icon name="phone" size={20} strokeWidth={2} />
          <span>Call</span>
        </a>
        <a className="dock__item dock__item--wa" href={WA_DEFAULT} target="_blank" rel="noreferrer" aria-label="WhatsApp consultation" title="Chat on WhatsApp">
          <Icon name="whatsapp" size={20} />
          <span>WhatsApp</span>
        </a>
        {/* <button className="dock__item dock__item--main" onClick={() => openBooking()} aria-label="Book appointment" title="Book appointment">
          <Icon name="calendar" size={20} strokeWidth={2} />
          <span>Book now</span>
        </button> */}
      </nav>
    </>
  );
}
