import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initSmoothScroll() {
  if (lenis) return lenis;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return null;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.35,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add('lenis', 'lenis-smooth');

  lenis._daffaCleanup = () => {
    gsap.ticker.remove(raf);
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    lenis?.destroy();
    lenis = null;
  };
  return lenis;
}

export function destroySmoothScroll() {
  lenis?._daffaCleanup?.();
}

export function scrollToTarget(target, options = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  if (lenis) {
    lenis.scrollTo(element, { offset: options.offset ?? -82, duration: options.duration ?? 1.25 });
  } else {
    const top = element.getBoundingClientRect().top + window.scrollY + (options.offset ?? -82);
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function lockScroll() {
  document.documentElement.classList.add('lenis-stopped');
  document.body.style.overflow = 'hidden';
  lenis?.stop();
}

export function unlockScroll() {
  document.documentElement.classList.remove('lenis-stopped');
  document.body.style.overflow = '';
  lenis?.start();
}

export function refreshScroll() {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
