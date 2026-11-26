import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  Inbox,
  Layers3,
  MessageSquare,
  Palette,
  Plus,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { AdminPageHeader, StatusBadge } from './ui';
import { formatDate } from '../../lib/utils';
import BrandMark from '../common/BrandMark';

const QUICK_ACTIONS = [
  { id: 'works', label: 'Tambah karya', icon: FileText, hint: 'Artikel, jurnal, atau karya tulis' },
  { id: 'apps', label: 'Tambah aplikasi', icon: Layers3, hint: 'Produk yang sudah dibangun' },
  { id: 'certificates', label: 'Tambah sertifikat', icon: Award, hint: 'Kredensial dan kompetensi' },
  { id: 'appearance', label: 'Edit tampilan', icon: Palette, hint: 'Tema, logo, dan foto profil' },
];

export default function Overview({ data, onNavigate, onNew }) {
  const unread = data.messages.filter((message) => !message.read).length;
  const publishedWorks = data.works.filter((work) => work.published).length;
  const firstName = data.settings.name?.split(/\s+/)[0] || 'Admin';
  const recentWorks = data.works.slice(0, 4);
  const recentMessages = data.messages.slice(0, 3);

  const metrics = [
    {
      id: 'works',
      label: 'Karya & tulisan',
      value: data.works.length,
      note: `${publishedWorks} dipublikasikan`,
      icon: BookOpen,
      tone: 'lime',
    },
    {
      id: 'apps',
      label: 'Aplikasi',
      value: data.apps.length,
      note: `${data.apps.filter((app) => app.published).length} tampil di situs`,
      icon: Layers3,
      tone: 'teal',
    },
    {
      id: 'certificates',
      label: 'Sertifikat',
      value: data.certificates.length,
      note: `${data.certificates.filter((item) => item.published).length} terverifikasi`,
      icon: Award,
      tone: 'amber',
    },
    {
      id: 'messages',
      label: 'Pesan masuk',
      value: data.messages.length,
      note: unread ? `${unread} belum dibaca` : 'Semua sudah dibaca',
      icon: Inbox,
      tone: unread ? 'pink' : 'neutral',
    },
  ];

  return (
    <div className="overview">
      <AdminPageHeader
        eyebrow="WORKSPACE / RINGKASAN"
        title={`Selamat datang, ${firstName}.`}
        description="Pantau konten, pesan, dan tampilan website dari satu control room."
        actions={
          <>
            <Link to="/" target="_blank" className="admin-btn">
              <Eye size={15} /> Lihat situs
            </Link>
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => onNew('works')}>
              <Plus size={15} /> Karya baru
            </button>
          </>
        }
      />

      <div className="overview-metrics">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <button
              type="button"
              key={metric.id}
              className={`overview-metric overview-metric--${metric.tone}`}
              onClick={() => onNavigate(metric.id)}
              style={{ '--delay': `${index * 60}ms` }}
            >
              <span className="overview-metric__icon"><Icon size={19} /></span>
              <span className="overview-metric__value">{String(metric.value).padStart(2, '0')}</span>
              <span className="overview-metric__label">{metric.label}</span>
              <span className="overview-metric__note">{metric.note}</span>
              <ArrowUpRight size={15} className="overview-metric__arrow" />
            </button>
          );
        })}
      </div>

      <div className="overview-grid">
        <div className="overview-main">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <span className="admin-eyebrow">KONTEN TERBARU</span>
                <h2>Karya & tulisan</h2>
              </div>
              <button type="button" className="admin-text-btn" onClick={() => onNavigate('works')}>
                Kelola semua <ArrowRight size={14} />
              </button>
            </div>

            {recentWorks.length ? (
              <div className="overview-list">
                {recentWorks.map((work) => (
                  <button type="button" key={work.id} className="overview-list__item" onClick={() => onNavigate('works')}>
                    <span className="overview-list__icon"><FileText size={16} /></span>
                    <span className="overview-list__main">
                      <strong>{work.title}</strong>
                      <small>{work.type} · {work.category || 'Umum'} · {work.year || '—'}</small>
                    </span>
                    <StatusBadge tone={work.published ? 'success' : 'neutral'}>
                      {work.published ? 'Live' : 'Draft'}
                    </StatusBadge>
                    <ArrowUpRight size={15} className="overview-list__arrow" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="overview-empty">
                <BookOpen size={22} />
                <p>Belum ada karya. Mulai dengan menambahkan tulisan pertama.</p>
                <button type="button" className="admin-btn admin-btn--small" onClick={() => onNew('works')}>
                  <Plus size={14} /> Tambah karya
                </button>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <span className="admin-eyebrow">INTERAKSI</span>
                <h2>Pesan terbaru</h2>
              </div>
              <button type="button" className="admin-text-btn" onClick={() => onNavigate('messages')}>
                Kotak masuk <ArrowRight size={14} />
              </button>
            </div>

            {recentMessages.length ? (
              <div className="overview-messages">
                {recentMessages.map((message) => (
                  <button type="button" key={message.id} className="overview-message" onClick={() => onNavigate('messages')}>
                    <span className="overview-message__avatar">{message.name.slice(0, 1).toUpperCase()}</span>
                    <span className="overview-message__main">
                      <strong>{message.name}{!message.read ? <i /> : null}</strong>
                      <span>{message.subject}</span>
                      <small>{formatDate(message.createdAt)}</small>
                    </span>
                    <MessageSquare size={15} className="overview-message__icon" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="overview-empty">
                <Inbox size={22} />
                <p>Belum ada pesan masuk. Form kontak siap menerima pesan.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="overview-side">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <span className="admin-eyebrow">AKSI CEPAT</span>
                <h2>Mulai dari sini</h2>
              </div>
              <Sparkles size={17} className="admin-panel__head-icon" />
            </div>
            <div className="overview-actions">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => (action.id === 'works' || action.id === 'apps' || action.id === 'certificates' ? onNew(action.id) : onNavigate(action.id))}
                  >
                    <span><Icon size={16} /></span>
                    <span>
                      <strong>{action.label}</strong>
                      <small>{action.hint}</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="admin-panel overview-profile">
            <div className="admin-panel__head">
              <div>
                <span className="admin-eyebrow">IDENTITAS</span>
                <h2>Profil aktif</h2>
              </div>
              <UserRound size={17} className="admin-panel__head-icon" />
            </div>
            <div className="overview-profile__card">
              <BrandMark logo={data.settings.logo} name={data.settings.name} size="lg" />
              <div>
                <strong>{data.settings.fullName}</strong>
                <span>{data.settings.role}</span>
              </div>
              <span className="overview-profile__status"><i /> ONLINE</span>
            </div>
            <div className="overview-profile__rows">
              <div><span>Tema</span><strong>{data.settings.mode === 'light' ? 'Light' : 'Dark'} / {data.settings.accent.toUpperCase()}</strong></div>
              <div><span>Fokus</span><strong>{data.settings.focus?.[0] || '—'}</strong></div>
              <div><span>Kontak</span><strong>{data.settings.email}</strong></div>
            </div>
            <button type="button" className="admin-btn admin-btn--block" onClick={() => onNavigate('identity')}>
              <UserRound size={14} /> Edit identitas
            </button>
          </section>

          <section className="overview-health">
            <span className="overview-health__icon"><CheckCircle2 size={18} /></span>
            <div>
              <strong>Sistem berjalan normal</strong>
              <p>Database tersinkron. Terakhir diperbarui {formatDate(data.updatedAt)}.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
