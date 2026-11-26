import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { ArrowUpRight, LockKeyhole, Menu, X } from 'lucide-react';
import BrandMark from '../common/BrandMark';
import { lockScroll, scrollToTarget, unlockScroll } from '../../lib/scroll';

const NAV = [
  { label: 'Profil', href: '#profil', index: '01' },
  { label: 'Karya', href: '#karya', index: '02' },
  { label: 'Aplikasi', href: '#aplikasi', index: '03' },
  { label: 'Sertifikat', href: '#sertifikat', index: '04' },
  { label: 'Kontak', href: '#kontak', index: '05' },
];

export default function Header({ settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (event, href) => {
    event.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToTarget(href), open ? 120 : 0);
  };

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="site-header__inner">
          <a
            className="site-brand"
            href="#top"
            onClick={(event) => go(event, '#top')}
            aria-label={`${settings.siteName} — kembali ke atas`}
          >
            <BrandMark logo={settings.logo} name={settings.name} size="sm" />
            <span className="site-brand__text">
              <strong>{settings.siteName}</strong>
              <small>PERSONAL INFORMATION SYSTEM</small>
            </span>
          </a>

          <nav className="site-nav" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)}>
                <span className="site-nav__index">{item.index}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-header__actions">
            <span className="availability-chip">
              <i />
              <span>{settings.availability || 'Available'}</span>
            </span>
            <Link to="/admin" className="icon-button header-admin" title="Panel Superadmin" aria-label="Panel Superadmin">
              <LockKeyhole size={16} />
            </Link>
            <a
              href="#kontak"
              className="header-cta"
              onClick={(event) => go(event, '#kontak')}
            >
              Hubungi
              <ArrowUpRight size={15} />
            </a>
            <button
              type="button"
              className="menu-toggle"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-menu__top">
              <span className="mono-label">NAVIGATION / 2026</span>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Tutup menu">
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-nav" aria-label="Navigasi mobile">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => go(event, item.href)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.055, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span>{item.index}</span>
                  {item.label}
                  <ArrowUpRight size={22} />
                </motion.a>
              ))}
            </nav>
            <div className="mobile-menu__foot">
              <div>
                <span className="mono-label">EMAIL</span>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
              <Link to="/admin" onClick={() => setOpen(false)}>
                Superadmin <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
