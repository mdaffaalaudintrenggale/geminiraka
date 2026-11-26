import { motion } from 'motion/react';
import { ArrowUpRight, Code2, Globe2, Layers3 } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { initials } from '../../lib/utils';

const STATUS_LABEL = {
  Live: 'LIVE',
  Beta: 'BETA',
  Prototype: 'PROTOTYPE',
  Archived: 'ARCHIVED',
};

function AppCard({ app, index }) {
  return (
    <motion.article
      className="app-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.07, 0.25), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      <div className={`app-visual app-visual--${index % 3}`}>
        {app.image ? (
          <img src={app.image} alt={`Tampilan ${app.title}`} loading="lazy" />
        ) : (
          <>
            <div className="app-window-bar">
              <span /><span /><span />
              <em>{STATUS_LABEL[app.status] || app.status}</em>
            </div>
            <div className="app-visual__grid" />
            <div className="app-visual__monogram">{initials(app.title)}</div>
            <div className="app-visual__meta">
              <span>APP / {String(index + 1).padStart(2, '0')}</span>
              <span>{app.year || '2025'}</span>
            </div>
            <div className="app-visual__lines">
              <i /><i /><i /><i />
            </div>
          </>
        )}
        {app.image ? (
          <span className="app-visual__status">{STATUS_LABEL[app.status] || app.status}</span>
        ) : null}
      </div>

      <div className="app-content">
        <div className="app-content__top">
          <span>{app.category || 'Web App'}</span>
          <span>{app.year || '—'}</span>
        </div>
        <h3>{app.title}</h3>
        <p>{app.description}</p>
        <div className="app-tech">
          {(app.tech || []).map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <div className="app-actions">
          {app.link ? (
            <a href={app.link} target="_blank" rel="noreferrer">
              <Globe2 size={15} /> Kunjungi aplikasi <ArrowUpRight size={14} />
            </a>
          ) : (
            <span className="app-private">
              <Layers3 size={14} /> Private / internal project
            </span>
          )}
          {app.repo ? (
            <a href={app.repo} target="_blank" rel="noreferrer" className="app-repo" aria-label={`Repositori ${app.title}`}>
              <Code2 size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export default function AppsSection({ apps = [] }) {
  return (
    <section className="section apps" id="aplikasi">
      <div className="container">
        <SectionHeader
          index="03"
          label="PRODUK / APLIKASI"
          title={<>Produk yang sudah <em>berjalan.</em></>}
          description="Aplikasi dan sistem yang saya rancang, bangun, dan uji — dari kebutuhan operasional hingga pengalaman pengguna."
          aside={
            <span className="section-count">
              <strong>{String(apps.length).padStart(2, '0')}</strong>
              <span>APLIKASI<br />TERBANGUN</span>
            </span>
          }
        />

        {apps.length ? (
          <div className="app-grid">
            {apps.map((app, index) => (
              <AppCard app={app} index={index} key={app.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Layers3 size={24} />
            <strong>Belum ada aplikasi yang dipublikasikan.</strong>
            <span>Tambahkan melalui panel superadmin.</span>
          </div>
        )}

        <div className="apps-footnote" data-reveal>
          <span className="mono-label">BUILT WITH INTENT</span>
          <p>Setiap aplikasi dirancang dengan fokus pada kejelasan alur, konsistensi antarmuka, dan kemudahan perawatan.</p>
          <span className="apps-footnote__line" />
          <span className="mono-label">2024 — 2026</span>
        </div>
      </div>
    </section>
  );
}
