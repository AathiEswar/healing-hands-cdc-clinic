import { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { DOCTORS } from '../data';
import SectionHeader from '../components/SectionHeader';
import Icon from '../lib/Icons';

/**
 * Horizontally scrollable doctor rail — native overflow scroll (buttery on
 * every device), enhanced with drag-to-scroll on desktop + progress bar.
 */
export default function Doctors() {
  const { openBooking } = useScroll();
  const rowRef = useRef(null);
  const [progress, setProgress] = useState(0);

  /* progress bar synced to the rail */
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = row.scrollWidth - row.clientWidth;
        setProgress(max > 0 ? row.scrollLeft / max : 0);
      });
    };
    row.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { row.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  /* drag-to-scroll (desktop) */
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !window.matchMedia('(pointer: fine)').matches) return;
    let down = false, startX = 0, startLeft = 0, moved = 0;

    const onDown = (e) => {
      down = true; moved = 0;
      startX = e.clientX; startLeft = row.scrollLeft;
      row.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      row.scrollLeft = startLeft - dx;
    };
    const onUp = () => { down = false; row.classList.remove('is-dragging'); };
    const onClick = (e) => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } };

    row.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    row.addEventListener('click', onClick, true);
    return () => {
      row.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      row.removeEventListener('click', onClick, true);
    };
  }, []);

  const nudge = (dir) => {
    const row = rowRef.current;
    const card = row?.querySelector('.doc-card');
    if (!row || !card) return;
    row.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' });
  };

  return (
    <section className="doctors section" data-scroll-section id="doctors">
      <div className="container">
        <SectionHeader
          eyebrow="Our Specialist"
          segments={[{ t: 'Clinical director who ' }, { t: 'listens and cares.', em: true }]}
          side={
            <>
              <p>Experienced pediatric specialist in Occupational Therapy and Child Mental Health — dedicated to compassionate, evidence-based therapy and family guidance.</p>
            </>
          }
        />
      </div>

      <div className="doctors__rail-wrap">
        <div className="doctors__rail container" ref={rowRef}>
          {DOCTORS.map((d) => (
            <article className="doc-card" key={d.name} data-reveal style={{ '--h': d.hue }}>
              <div className="doc-card__portrait" aria-hidden="true">
                <span className="doc-card__ring" />
                <span className="doc-card__initials">{d.initials}</span>
              </div>
              <div className="doc-card__body">
                <h3 className="doc-card__name">{d.name}</h3>
                <p className="doc-card__creds">{d.creds}</p>
                <div className="doc-card__chips">
                  <span className="chip chip--tint">{d.dept}</span>
                  <span className="chip">{d.exp}</span>
                </div>
                <p className="doc-card__slot">
                  <span className="pulse-dot" aria-hidden="true" /> Next: {d.slot}
                </p>
                <button
                  className="doc-card__btn"
                  onClick={() => openBooking(d.dept, d.slot)}
                  data-cursor="hover"
                >
                  Book with {d.name.split(' ')[1]} <Icon name="arrowR" size={14} strokeWidth={2.2} />
                </button>
              </div>
            </article>
          ))}
          <div className="doctors__end" aria-hidden="true" />
        </div>
      </div>

      <div className="container">
        <div className="doctors__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
      </div>
    </section>
  );
}
