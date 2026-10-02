import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'locomotive-scroll/dist/locomotive-scroll.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollProvider
 * ──────────────
 * Owns the Locomotive Scroll instance and bridges it to GSAP ScrollTrigger
 * via scrollerProxy (the canonical recipe). Also owns global UI state that
 * needs to talk to the scroller: booking modal (stops/starts scroll),
 * anchor navigation and scroll subscriptions (navbar, progress bar).
 *
 * Performance notes:
 *  - smooth scrolling is DISABLED on touch devices (native scroll = 60fps, no jank)
 *  - honours prefers-reduced-motion (falls back to native scroll)
 *  - one single 'scroll' listener fans out to subscribers via a Set
 */
const ScrollContext = createContext(null);
export const useScroll = () => useContext(ScrollContext);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * True only when locomotive is actually running its smooth core (desktop,
 * motion allowed). On phones/tablets it falls back to the native core, where
 * the window scrolls and `stop()`/`limit` are inert — several things below
 * have to branch on that.
 */
const isSmoothScroller = () =>
  typeof document !== 'undefined' &&
  document.documentElement.classList.contains('has-scroll-smooth');

/**
 * Position + scrollable distance for a locomotive 'scroll' event.
 *
 * The native core needs both values recomputed: it leaves `instance.limit` at
 * the viewport size (which would peg a progress bar at 100% after one screen),
 * and it assigns `instance.scroll.y` *after* dispatching, so subscribers would
 * otherwise always be one event behind.
 */
const scrollState = (args) => {
  if (isSmoothScroller()) return { y: args.scroll.y, limit: args.limit.y || 1 };
  const doc = document.scrollingElement || document.documentElement;
  return {
    y: window.scrollY || doc.scrollTop || 0,
    limit: Math.max(1, doc.scrollHeight - window.innerHeight),
  };
};

/** Skip scroll/reveal choreography on phones & tablets (≤1024). */
export const skipReveal = () =>
  typeof window !== 'undefined' &&
  (prefersReducedMotion() || window.matchMedia('(max-width: 1024px)').matches);

export function ScrollProvider({ loaded, children }) {
  const containerRef = useRef(null);
  const locoRef = useRef(null);
  const subsRef = useRef(new Set());
  const [ready, setReady] = useState(false);
  const [booking, setBooking] = useState({ open: false, dept: '', slot: '' });

  /* scroll lock — refcounted so the menu and the booking sheet can overlap */
  const lockCount = useRef(0);
  const lockedY = useRef(0);
  const lockedNative = useRef(false);

  /* ── init locomotive + scrollerProxy ─────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduce = prefersReducedMotion();
    const loco = new LocomotiveScroll({
      el,
      smooth: !reduce,
      lerp: 0.09,
      multiplier: 0.95,
      class: 'is-inview',
      reloadOnContextChange: true,
      smartphone: { smooth: false },
      tablet: { smooth: false, breakpoint: 1024 },
    });
    locoRef.current = loco;
    loco.stop(); // locked until the preloader finishes

    if (typeof window !== 'undefined') window.__loco = loco; // handy for debugging

    loco.on('scroll', (args) => {
      ScrollTrigger.update();
      // while frozen the browser still emits a scroll-to-0 event; ignore it so
      // the navbar/dock don't flip state behind an open overlay
      if (lockCount.current > 0) return;
      const { y, limit } = scrollState(args);
      subsRef.current.forEach((cb) => cb(y, limit));
    });

    ScrollTrigger.scrollerProxy(el, {
      scrollTop(value) {
        return arguments.length
          ? loco.scrollTo(value, { duration: 0, disableLerp: true })
          : loco.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      // transform-based pinning when smooth, fixed when native
      pinType: el.style.transform ? 'transform' : 'fixed',
    });

    const onRefresh = () => loco.update();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.defaults({ scroller: el });

    // refresh once fonts are in (layout shifts move trigger positions)
    let raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      setReady(true);
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    // keep locomotive in sync with content height changes
    const ro = new ResizeObserver(() => loco.update());
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      loco.destroy();
      locoRef.current = null;
      if (window.__loco === loco) delete window.__loco;
    };
  }, []);

  /* ── unlock scroll once preloader is done ────────────────── */
  useEffect(() => {
    if (loaded && locoRef.current && !booking.open) locoRef.current.start();
  }, [loaded, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Native scroll ignores loco.stop(), so hold the page still ourselves while
     the preloader is up. Safe to use overflow here — we're pinned at y=0. */
  useEffect(() => {
    if (loaded || isSmoothScroller()) return;
    const de = document.documentElement;
    de.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      de.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [loaded, ready]);

  /* ── scroll lock ─────────────────────────────────────────────
     Smooth mode: locomotive owns the scroll, stop() is enough.
     Native mode: `overflow:hidden` would collapse the document and make the
     browser clamp scrollY to 0 — losing the reader's place. Pin the body at a
     negative offset instead, then restore the exact position on release. */
  const lockScroll = useCallback(() => {
    if (lockCount.current++ > 0) return;
    lockedNative.current = !isSmoothScroller();
    if (!lockedNative.current) {
      locoRef.current?.stop();
      return;
    }
    lockedY.current = window.scrollY || document.documentElement.scrollTop || 0;
    const { body } = document;
    body.style.position = 'fixed';
    body.style.top = `-${lockedY.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    document.documentElement.classList.add('is-scroll-locked');
  }, []);

  const unlockScroll = useCallback(() => {
    if (lockCount.current === 0 || --lockCount.current > 0) return;
    if (!lockedNative.current) {
      locoRef.current?.start();
      return;
    }
    const { body } = document;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    document.documentElement.classList.remove('is-scroll-locked');
    window.scrollTo(0, lockedY.current);
  }, []);

  /* ── api ─────────────────────────────────────────────────── */
  const scrollTo = useCallback((target, opts = {}) => {
    if (!target && target !== 0) return;

    if (target === '#top' || target === 0) {
      if (locoRef.current && isSmoothScroller()) {
        locoRef.current.scrollTo(0, { duration: 800, ...opts });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const nav = document.querySelector('.nav');
    const navHeight = nav ? nav.offsetHeight : 84;
    const computedOffset = opts.offset !== undefined ? opts.offset : -(navHeight + 24);

    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        if (locoRef.current && isSmoothScroller()) {
          locoRef.current.scrollTo(el, { offset: computedOffset, duration: 800, ...opts });
        } else {
          const rect = el.getBoundingClientRect();
          const currentY = window.scrollY || document.documentElement.scrollTop || 0;
          const destinationY = currentY + rect.top + computedOffset;
          window.scrollTo({ top: Math.max(0, destinationY), behavior: 'smooth' });
        }
        return;
      }
    }

    if (locoRef.current) {
      locoRef.current.scrollTo(target, { offset: computedOffset, duration: 800, ...opts });
    }
  }, []);

  const onScroll = useCallback((cb) => {
    subsRef.current.add(cb);
    return () => subsRef.current.delete(cb);
  }, []);

  /* mirrors booking.open — lets us lock/unlock exactly once per transition
     without running side effects inside a state updater (StrictMode calls
     those twice, which would unbalance the lock refcount) */
  const bookingOpenRef = useRef(false);

  const openBooking = useCallback((dept = '', slot = '') => {
    // Fallback while booking modal is commented out: scroll to visit / contact
    scrollTo('#visit');
  }, [scrollTo]);

  const closeBooking = useCallback(() => {
    if (bookingOpenRef.current) {
      bookingOpenRef.current = false;
      unlockScroll();
    }
    setBooking((b) => ({ ...b, open: false }));
  }, [unlockScroll]);

  return (
    <ScrollContext.Provider
      value={{
        containerRef, ready, loaded, scrollTo, onScroll,
        booking, openBooking, closeBooking, lockScroll, unlockScroll,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

/**
 * useAnim — run a gsap.context() scoped animation setup once the
 * scroller is ready. Automatically reverted on unmount. Skipped
 * entirely for prefers-reduced-motion users (content stays visible).
 */
export function useAnim(scopeRef, fn, deps = []) {
  const { ready } = useScroll();
  useEffect(() => {
    if (!ready || !scopeRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => fn(gsap, ScrollTrigger), scopeRef);
    return () => ctx.revert();
  }, [ready, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

export { gsap, ScrollTrigger };
