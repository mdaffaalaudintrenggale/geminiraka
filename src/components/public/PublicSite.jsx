import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import Header from './Header';
import Hero from './Hero';
import Ticker from './Ticker';
import About from './About';
import WorksSection from './WorksSection';
import AppsSection from './AppsSection';
import CertificatesSection from './CertificatesSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import BrandMark from '../common/BrandMark';
import { api } from '../../lib/api';
import { applyTheme, initials } from '../../lib/utils';
import {
  destroySmoothScroll,
  gsap,
  initSmoothScroll,
  refreshScroll,
  ScrollTrigger,
} from '../../lib/scroll';

function SiteLoader() {
  return (
    <div className="site-loader">
      <div className="site-loader__glow" />
      <div className="site-loader__brand">
        <span className="site-loader__mark">DS</span>
        <div>
          <strong>DAFFA.SYS</strong>
          <span>PERSONAL INFORMATION SYSTEM</span>
        </div>
      </div>
      <div className="site-loader__status">
        <span>INITIALIZING PROFILE SYSTEM</span>
        <span>LOADING / 001</span>
      </div>
      <div className="site-loader__bar"><i /></div>
      <span className="site-loader__foot">GSAP · MOTION · LENIS</span>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="site-loader site-loader--error">
      <div className="site-loader__brand">
        <span className="site-loader__mark">!</span>
        <div>
          <strong>KONEKSI TERPUTUS</strong>
          <span>{message}</span>
        </div>
      </div>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        <RefreshCw size={16} /> Coba lagi
      </button>
    </div>
  );
}

function PointerGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 90, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 90, damping: 20, mass: 0.5 });

  useEffect(() => {
    const onMove = (event) => {
      x.set(event.clientX - 240);
      y.set(event.clientY - 240);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [x, y]);

  return <motion.div className="pointer-glow" style={{ x: sx, y: sy }} aria-hidden="true" />;
}

export default function PublicSite() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    api
      .getPublic(controller.signal)
      .then((payload) => {
        setData(payload);
        applyTheme(payload.settings);
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Gagal memuat data profil.');
      });
    return () => controller.abort();
  }, [retryKey]);

  useEffect(() => {
    if (!data?.settings) return;
    document.title = `${data.settings.fullName} — ${data.settings.role}`;
    applyTheme(data.settings);
  }, [data]);

  useEffect(() => {
    initSmoothScroll();
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => destroySmoothScroll();
  }, []);

  useEffect(() => {
    if (!data) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduceMotion) {
        const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
        timeline
          .fromTo('.hero-kicker', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
          .fromTo(
            '.hero-line__inner',
            { yPercent: 115 },
            { yPercent: 0, duration: 1.15, stagger: 0.12, ease: 'expo.out' },
            0.18,
          )
          .fromTo(
            '.hero-role, .hero-headline, .hero-actions, .hero-meta, .scroll-cue',
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.07 },
            0.62,
          )
          .fromTo('.hero-visual__backdrop', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.1 }, 0.35)
          .fromTo('.hero-stat', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 }, 0.95);

        gsap.to('.hero-visual', {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        gsap.utils.toArray('[data-reveal]').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 34, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 88%', once: true },
            },
          );
        });

        gsap.utils.toArray('.section-index__line').forEach((line) => {
          gsap.fromTo(
            line,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: { trigger: line, start: 'top 92%', once: true },
            },
          );
        });
      }
    }, rootRef);

    const timer = window.setTimeout(refreshScroll, 320);
    const onLoad = () => refreshScroll();
    window.addEventListener('load', onLoad);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [data]);

  if (error) return <ErrorScreen message={error} onRetry={() => setRetryKey((value) => value + 1)} />;
  if (!data) return <SiteLoader />;

  const { settings } = data;

  return (
    <div className="site-shell" ref={rootRef}>
      <div className="site-bg" aria-hidden="true">
        <div className="site-bg__grid" />
        <div className="site-bg__glow site-bg__glow--one" />
        <div className="site-bg__glow site-bg__glow--two" />
        <div className="site-bg__noise" />
      </div>
      <PointerGlow />

      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <Header settings={settings} />
      <main id="main-content">
        <Hero settings={settings} />
        <Ticker settings={settings} />
        <About settings={settings} />
        <WorksSection works={data.works} />
        <AppsSection apps={data.apps} />
        <CertificatesSection certificates={data.certificates} />
        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
