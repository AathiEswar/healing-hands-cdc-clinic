import { useState, useCallback, useRef } from 'react';
import { ScrollProvider, useScroll, useAnim, ScrollTrigger, skipReveal } from './context/ScrollContext';

import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import FloatingDock from './components/FloatingDock';
import BookingModal from './components/BookingModal';

import Hero from './sections/Hero';
import TrustStats from './sections/TrustStats';
import Services from './sections/Services';
import Brochures from './sections/Brochures';
import About from './sections/About';
import Doctors from './sections/Doctors';
import Process from './sections/Process';
import Testimonials from './sections/Testimonials';
import Faq from './sections/Faq';
import CtaBanner from './sections/CtaBanner';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

function Site() {
  const { containerRef } = useScroll();
  const scope = useRef(null);

  /* one global reveal system for [data-reveal] elements — desktop only */
  useAnim(scope, (gsap) => {
    if (skipReveal()) return;

    const items = gsap.utils.toArray('[data-reveal]');
    gsap.set(items, { y: 30, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true,
        }),
    });
    /* safety: reveal anything ScrollTrigger might have missed (e.g. above fold) */
    ScrollTrigger.refresh();
  });

  return (
    <>
      <Cursor />
      <Navbar />
      <FloatingDock />
      {/* <BookingModal /> */}

      <div className="scroll-container" data-scroll-container ref={containerRef}>
        <div ref={scope}>
          <main>
            <Hero />
            <TrustStats />
            <Services />
            <Brochures />
            {/* <About /> */}
            <Doctors />
            <Process />
            <Testimonials />
            <Faq />
            {/* <CtaBanner /> */}
            <Contact />
          </main>
          <Footer />
        </div>
      </div>

      <div className="grain" aria-hidden="true" />
    </>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const onLoaded = useCallback(() => setLoaded(true), []);

  return (
    <ScrollProvider loaded={loaded}>
      {!loaded && <Preloader onComplete={onLoaded} />}
      <Site />
    </ScrollProvider>
  );
}
