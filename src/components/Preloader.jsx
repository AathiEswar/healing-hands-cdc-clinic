import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../context/ScrollContext';
import { CLINIC } from '../config';

/** Survives remounts so we never schedule a second full intro after one has finished. */
let finishedThisLoad = false;

/** Brief branded preloader — counts up, then wipes away. Keeps it under ~1.6s. */
export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const numRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const finish = () => {
      if (finishedThisLoad) {
        onCompleteRef.current?.();
        return;
      }
      finishedThisLoad = true;
      onCompleteRef.current?.();
    };

    /* Already finished this page load — stay gone (handles stale remounts). */
    if (finishedThisLoad) {
      if (rootRef.current) gsap.set(rootRef.current, { display: 'none', autoAlpha: 0 });
      finish();
      return;
    }

    if (prefersReducedMotion()) {
      const t = setTimeout(() => {
        gsap.set(rootRef.current, { autoAlpha: 0, display: 'none' });
        finish();
      }, 250);
      return () => clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const obj = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(obj, {
        v: 100,
        duration: 0.95,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = Math.round(obj.v);
        },
      })
        .to('.preloader__inner', { yPercent: -18, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, '-=0.1')
        .to(rootRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.85,
          ease: 'expo.inOut',
        }, '-=0.15')
        .set(rootRef.current, { display: 'none' });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader__inner">
        <span className="preloader__mark">
          <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
            <rect width="80" height="80" rx="20" fill="#FAF5FF" />
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
        <div className="preloader__name" aria-hidden="true">
          <span>Healing Hands</span>
          <span>Child Development Centre</span>
        </div>
        <span className="preloader__tag">{CLINIC.tagline}</span>
      </div>
      <span className="preloader__num" ref={numRef}>0</span>
    </div>
  );
}
