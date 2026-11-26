import { Link } from 'react-router-dom';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import BrandMark from '../common/BrandMark';
import { scrollToTarget } from '../../lib/scroll';

const LINKS = [
  { label: 'Profil', href: '#profil' },
  { label: 'Karya', href: '#karya' },
  { label: 'Aplikasi', href: '#aplikasi' },
  { label: 'Sertifikat', href: '#sertifikat' },
  { label: 'Kontak', href: '#kontak' },
];

export default function Footer({ settings }) {
  const go = (event, href) => {
    event.preventDefault();
    scrollToTarget(href);
  };

  return (
    <footer className="site-footer">
      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee__track">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index}>
              {settings.fullName}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <BrandMark logo={settings.logo} name={settings.name} />
            <div>
              <strong>{settings.siteName}</strong>
              <p>{settings.footerNote}</p>
            </div>
          </div>

          <div className="footer-nav">
            <span className="mono-label">NAVIGASI</span>
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={(event) => go(event, link.href)}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="footer-nav">
            <span className="mono-label">TAUTAN</span>
            {(settings.socials || []).map((social) => (
              <a key={`${social.label}-${social.url}`} href={social.url} target="_blank" rel="noreferrer">
                {social.label}
                <ArrowUpRight size={12} />
              </a>
            ))}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>

          <div className="footer-status">
            <span className="mono-label">SYSTEM STATUS</span>
            <div className="footer-status__row">
              <span className="footer-status__dot" />
              <span>All systems operational</span>
            </div>
            <small>LAST UPDATE<br />{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</small>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.fullName}. All rights reserved.</span>
          <span className="footer-bottom__middle">DESIGNED &amp; BUILT WITH INTENT</span>
          <Link to="/admin" className="footer-admin">
            <LockKeyhole size={12} /> SUPERADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}
