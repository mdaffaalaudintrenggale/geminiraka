import { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDown, ArrowUpRight, Mail, MapPin, Radio, ScanFace } from 'lucide-react';
import PortraitPlaceholder from './PortraitPlaceholder';
import StatCounter from './StatCounter';
import { scrollToTarget } from '../../lib/scroll';
import { splitName } from '../../lib/utils';

function ProfileCard({ settings }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 });
  const glareX = useTransform(x, [-0.5, 0.5], ['18%', '82%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['12%', '88%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.16), transparent 42%)`;

  const onMove = (event) => {
    if (event.pointerType === 'touch') return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="profile-perspective">
      <motion.div
        ref={ref}
        className="profile-card"
        style={{ rotateX, rotateY }}
        onPointerMove={onMove}
        onPointerLeave={reset}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div className="profile-glare" style={{ background: glare }} />
        <div className="profile-card__top">
          <span>
            <ScanFace size={13} /> IDENTITY / 001
          </span>
          <span className="rec-label">
            <i /> REC
          </span>
        </div>
        <div className="profile-frame">
          {settings.photo ? (
            <img className="profile-photo" src={settings.photo} alt={`Foto ${settings.fullName}`} />
          ) : (
            <PortraitPlaceholder name={settings.fullName} />
          )}
          <div className="profile-frame__scan" />
          <div className="profile-frame__shade" />
          <div className="profile-caption">
            <span className="profile-caption__tag">SUBJECT</span>
            <strong>{settings.fullName}</strong>
            <small>{settings.role}</small>
          </div>
          <span className="profile-frame__cross profile-frame__cross--tl" />
          <span className="profile-frame__cross profile-frame__cross--tr" />
          <span className="profile-frame__cross profile-frame__cross--bl" />
          <span className="profile-frame__cross profile-frame__cross--br" />
        </div>
        <div className="profile-card__bottom">
          <div className="profile-card__meta">
            <span>
              <MapPin size={13} /> {settings.location}
            </span>
            <span className="profile-online">
              <i /> ONLINE
            </span>
          </div>
          <div className="profile-card__serial">
            <span>SYS/{String(settings.name || 'DS').slice(0, 3).toUpperCase()}/26</span>
            <span>VER. 2.4</span>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="profile-float"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <span className="profile-float__icon">
          <Radio size={14} />
        </span>
        <span>
          <small>SIGNAL</small>
          {settings.availability || 'Open to work'}
        </span>
      </motion.div>
    </div>
  );
}

export default function Hero({ settings }) {
  const { first, rest } = splitName(settings.fullName, settings.name);
  const stats = settings.stats?.length
    ? settings.stats
    : [
        { label: 'Proyek', value: '12+' },
        { label: 'Karya', value: '08' },
        { label: 'Sertifikat', value: '06' },
      ];

  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-kicker__tag">[{settings.heroLabel || 'Personal Information System'}]</span>
            <span className="hero-kicker__status">
              <i /> SYSTEM ONLINE
            </span>
          </div>

          <h1 className="hero-title" aria-label={settings.fullName}>
            <span className="hero-line">
              <span className="hero-line__inner">{first}</span>
            </span>
            {rest ? (
              <span className="hero-line hero-line--accent">
                <span className="hero-line__inner">{rest}<i>.</i></span>
              </span>
            ) : null}
          </h1>

          <div className="hero-role">
            <span className="hero-role__dash" />
            {settings.role}
          </div>

          <p className="hero-headline">{settings.headline}</p>

          <div className="hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToTarget('#karya')}>
              Jelajahi karya
              <ArrowUpRight size={17} />
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => scrollToTarget('#kontak')}>
              Mulai diskusi
              <Mail size={16} />
            </button>
          </div>

          <div className="hero-meta">
            <span>
              <MapPin size={14} />
              {settings.location}
            </span>
            <span className="hero-meta__divider" />
            <a href={`mailto:${settings.email}`}>
              <Mail size={14} />
              {settings.email}
            </a>
          </div>

          <button type="button" className="scroll-cue" onClick={() => scrollToTarget('#profil')}>
            <span className="scroll-cue__icon">
              <ArrowDown size={14} />
            </span>
            <span>SCROLL TO EXPLORE</span>
          </button>
        </div>

        <div className="hero-visual">
          <div className="hero-visual__backdrop">
            <span>PROFILE</span>
            <span>DATA</span>
          </div>
          <ProfileCard settings={settings} />
        </div>
      </div>

      <div className="container">
        <div className="hero-stats">
          {stats.map((stat, index) => (
            <div className="hero-stat" key={`${stat.label}-${index}`}>
              <span className="hero-stat__index">0{index + 1}</span>
              <strong className="hero-stat__value">
                <StatCounter value={stat.value} />
              </strong>
              <span className="hero-stat__label">{stat.label}</span>
            </div>
          ))}
          <div className="hero-stat hero-stat--note">
            <span className="hero-stat__index">LIVE</span>
            <p>Berbasis di {settings.location}. Sedang membuka ruang untuk proyek dan riset baru.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
