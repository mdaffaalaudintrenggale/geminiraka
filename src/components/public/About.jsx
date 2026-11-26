import {
  ArrowUpRight,
  Compass,
  GraduationCap,
  Mail,
  MapPin,
  Radio,
  Sparkles,
  UserRound,
} from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function About({ settings }) {
  const rows = [
    { label: 'Nama Lengkap', value: settings.fullName, icon: UserRound },
    { label: 'Peran', value: settings.role, icon: Compass },
    { label: 'Pendidikan', value: settings.university, icon: GraduationCap },
    { label: 'Domisili', value: settings.location, icon: MapPin },
    { label: 'Email', value: settings.email, icon: Mail, href: `mailto:${settings.email}` },
  ].filter((row) => row.value);

  return (
    <section className="section about" id="profil">
      <div className="container">
        <SectionHeader
          index="01"
          label="PROFIL / IDENTITAS"
          title={<>Informasi di balik <em>layar.</em></>}
          description="Bukan sekadar daftar skill — ini adalah konteks tentang cara saya berpikir, bekerja, dan membangun produk digital."
          aside={
            <div className="header-status">
              <span className="header-status__dot" />
              <div>
                <small>STATUS</small>
                <strong>{settings.availability}</strong>
              </div>
            </div>
          }
        />

        <div className="about-grid">
          <div className="about-main" data-reveal>
            <p className="about-lead">{settings.bio}</p>

            <div className="identity-table">
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <div className="identity-row" key={row.label}>
                    <span className="identity-row__label">
                      <Icon size={14} />
                      {row.label}
                    </span>
                    {row.href ? (
                      <a href={row.href}>{row.value}</a>
                    ) : (
                      <span className="identity-row__value">{row.value}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="about-signature">
              <div className="signature-mark">DS</div>
              <div>
                <strong>{settings.fullName}</strong>
                <span>{settings.role}</span>
              </div>
              <span className="signature-line" />
              <span className="signature-year">EST. 2023</span>
            </div>
          </div>

          <aside className="about-side">
            <div className="focus-panel" data-reveal>
              <div className="panel-topline">
                <span>FOCUS MATRIX</span>
                <span>05 / ACTIVE</span>
              </div>
              <div className="focus-list">
                {(settings.focus?.length
                  ? settings.focus
                  : ['Web Development', 'UI Engineering', 'Sistem Informasi']
                ).map((focus, index) => (
                  <div className="focus-row" key={focus}>
                    <span className="focus-row__index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="focus-row__name">{focus}</span>
                    <span className="focus-row__bar">
                      <i style={{ width: `${92 - index * 9}%` }} />
                    </span>
                    <span className="focus-row__state">ACTIVE</span>
                  </div>
                ))}
              </div>
              <div className="focus-panel__foot">
                <Sparkles size={14} />
                Selalu belajar, selalu menyempurnakan detail.
              </div>
            </div>

            <div className="about-links" data-reveal>
              {(settings.socials || []).map((social) => (
                <a key={`${social.label}-${social.url}`} href={social.url} target="_blank" rel="noreferrer">
                  <span>{social.label}</span>
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </div>

            <div className="status-panel" data-reveal>
              <div className="status-panel__icon">
                <Radio size={18} />
              </div>
              <div className="status-panel__copy">
                <small>SIGNAL / AVAILABILITY</small>
                <strong>{settings.availability}</strong>
                <p>Respons biasanya dalam 1×24 jam. Terbuka untuk proyek, riset, dan diskusi.</p>
              </div>
              <span className="status-panel__pulse" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
