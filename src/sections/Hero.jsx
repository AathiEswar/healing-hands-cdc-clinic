import { useRef } from 'react';
import { useScroll, useAnim, skipReveal } from '../context/ScrollContext';
import { CLINIC } from '../config';
import { SPECIALTIES_TICKER, DOCTORS } from '../data';
import Button from '../components/Button';
import Marquee from '../components/Marquee';
import Icon from '../lib/Icons';

const Stars = ({ n = 5 }) => (
  <span className="stars" aria-label={`${CLINIC.rating} star rating`}>
    {Array.from({ length: n }).map((_, i) => <Icon key={i} name="star" size={13} />)}
  </span>
);

export default function Hero() {
  const { openBooking } = useScroll();
  const scope = useRef(null);
  const nextDoc = DOCTORS[0];

  /* gentle perpetual float on the cards (instant start, zero delay) */
  useAnim(scope, (gsap) => {
    if (skipReveal()) return;
    gsap.to('.hero__card--slot', { y: -10, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.hero__card--rating', { y: -14, duration: 3.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  });

  return (
    <section className="hero" data-scroll-section id="top" ref={scope}>
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__blob hero__blob--1" data-scroll data-scroll-speed="1.2" />
        <span className="hero__blob hero__blob--2" data-scroll data-scroll-speed="-0.8" />
      </div>

      <div className="hero__inner container">
        <div className="hero__copy">
          <h1 className="hero__title">
            Specialized therapy for your <em>child’s growth &amp; development.</em>
          </h1>

          <p className="hero__sub">
            3+ years of specialized Occupational Therapy, Speech Therapy, Behavior Therapy, and Pediatric Mental Health support in <strong className="hero__sub-highlight">Thiruverkadu</strong>, Chennai. Compassionate care tailored for your child.
          </p>

          <div className="hero__ctas">
            {/* <Button magnetic icon="calendar" onClick={() => openBooking()} aria-label="Book a consultation">
              Book a consultation
            </Button> */}
            <Button variant="primary" icon="phone" href={CLINIC.phoneHref}>
              Call the center
            </Button>
          </div>

          <div className="hero__proof">
            <span className="hero__proof-item">
              <Stars />
              <strong>{CLINIC.rating}</strong> · {CLINIC.reviewCount} reviews
            </span>
            <span className="hero__proof-sep" aria-hidden="true" />
            <span className="hero__proof-item"><strong>100%</strong> Dedicated Care</span>
            <span className="hero__proof-sep" aria-hidden="true" />
            <span className="hero__proof-item"><strong>3+</strong> years exp.</span>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="false">
          {/* Main Hero Visual: Child Development & Therapy Showcase Card */}
          <div className="hero__main-card" data-scroll data-scroll-speed="-0.3">
            <div className="hero__img-frame">
              <img
                src="/hero-child-stacking.jpg"
                alt="Child engaged in learning and occupational therapy at Healing Hands CDC"
                className="hero__main-img"
              />
              <div className="hero__img-badge">
                <span className="hero__img-badge-dot" />
                <span>Play &amp; Sensory Learning</span>
              </div>
              <div className="hero__img-caption">
                <p className="hero__img-quote">“Small Steps Today, Bright Futures Tomorrow.”</p>
                <span className="hero__img-sub">Individualized 1-on-1 Child Therapy</span>
              </div>
            </div>
            <span className="hero__floating-heart" title="Occupational Therapy">
              OT
            </span>
          </div>

          {/* <div className="hero__card hero__card--slot" data-scroll data-scroll-speed="0.6">
            <p className="hero__card-eyebrow"><span className="pulse-dot" aria-hidden="true" /> Next evaluation slot</p>
            <p className="hero__card-doc">{nextDoc.name}</p>
            <p className="hero__card-dept">{nextDoc.dept}</p>
            <p className="hero__card-time"><Icon name="clock" size={14} /> {nextDoc.slot}</p>
            <button
              className="hero__card-btn"
              onClick={() => openBooking(nextDoc.dept, nextDoc.slot)}
              data-cursor="hover"
            >
              Book session <Icon name="arrowR" size={14} strokeWidth={2.2} />
            </button>
          </div> */}

          <div className="hero__card hero__card--rating" data-scroll data-scroll-speed="1.1">
            <Stars />
            <p><strong>{CLINIC.rating}</strong> Parent Rating</p>
            <span>{CLINIC.reviewCount} parent reviews</span>
          </div>

          <div className="hero__chip" data-scroll data-scroll-speed="0.9">
            <Icon name="pin" size={15} /> Opp. Udhavum Karangal School, Thiruverkadu
          </div>
        </div>
      </div>

      <div className="hero__ticker" aria-hidden="true">
        <Marquee duration={34}>
          {SPECIALTIES_TICKER.map((s) => (
            <span className="ticker__item" key={s}>
              {s} <i>✦</i>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
