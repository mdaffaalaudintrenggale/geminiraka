import { initials } from '../../lib/utils';

export default function PortraitPlaceholder({ name }) {
  return (
    <div className="portrait-placeholder">
      <div className="portrait-placeholder__grid" />
      <svg className="portrait-placeholder__figure" viewBox="0 0 400 500" role="img" aria-label="Placeholder foto profil">
        <defs>
          <linearGradient id="portraitLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="portraitGlow" cx="50%" cy="36%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="185" r="160" fill="url(#portraitGlow)" />
        <circle cx="200" cy="180" r="82" fill="none" stroke="url(#portraitLine)" strokeWidth="1.2" />
        <circle cx="200" cy="180" r="112" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 8" />
        <path
          d="M105 455c8-86 44-132 95-132s87 46 95 132"
          fill="none"
          stroke="url(#portraitLine)"
          strokeWidth="1.4"
        />
        <path
          d="M148 428c7-56 26-84 52-84s45 28 52 84"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
        />
        <path d="M118 198h-26M308 198h-26M200 48v-26" stroke="var(--line-strong)" strokeWidth="1" />
        <path d="M88 118l18 18M312 118l-18 18" stroke="var(--line)" strokeWidth="1" />
      </svg>
      <span className="portrait-placeholder__initials">{initials(name)}</span>
      <div className="portrait-placeholder__note">
        <span>FOTO PROFIL</span>
        <small>Unggah melalui panel admin</small>
      </div>
      <span className="portrait-placeholder__corner portrait-placeholder__corner--tl" />
      <span className="portrait-placeholder__corner portrait-placeholder__corner--tr" />
      <span className="portrait-placeholder__corner portrait-placeholder__corner--bl" />
      <span className="portrait-placeholder__corner portrait-placeholder__corner--br" />
    </div>
  );
}
