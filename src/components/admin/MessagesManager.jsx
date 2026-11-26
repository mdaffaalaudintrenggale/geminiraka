import { useMemo, useState } from 'react';
import {
  CheckCheck,
  Inbox,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from 'lucide-react';
import {
  AdminEmpty,
  AdminModal,
  AdminPageHeader,
  ConfirmDialog,
  StatusBadge,
} from './ui';
import { formatDate, formatTime } from '../../lib/utils';

export default function MessagesManager({ items, onMarkRead, onDelete }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const unread = items.filter((item) => !item.read).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === 'unread' && item.read) return false;
      if (!needle) return true;
      return [item.name, item.email, item.subject, item.message].join(' ').toLowerCase().includes(needle);
    });
  }, [items, query, filter]);

  const openMessage = async (message) => {
    setSelected(message);
    if (!message.read) {
      try {
        await onMarkRead(message.id, true);
      } catch {
        // Keep the reading pane usable even when the sync fails.
      }
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete(toDelete.id);
      if (selected?.id === toDelete.id) setSelected(null);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="INTERAKSI / PESAN"
        title="Kotak masuk"
        description="Pesan dari formulir kontak website. Tandai terbaca atau hapus setelah ditindaklanjuti."
        actions={
          <span className="admin-inbox-summary">
            <Inbox size={15} /> {items.length} pesan · {unread} belum dibaca
          </span>
        }
      />

      <div className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Cari nama, email, atau isi pesan..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="admin-filter-chips">
            <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
              Semua <span>{items.length}</span>
            </button>
            <button type="button" className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')}>
              Belum dibaca <span>{unread}</span>
            </button>
          </div>
        </div>

        {filtered.length ? (
          <div className="admin-message-list">
            {filtered.map((message) => (
              <button
                type="button"
                key={message.id}
                className={`admin-message ${!message.read ? 'is-unread' : ''}`}
                onClick={() => openMessage(message)}
              >
                <span className="admin-message__avatar">{message.name.slice(0, 1).toUpperCase()}</span>
                <span className="admin-message__body">
                  <span className="admin-message__top">
                    <strong>{message.name}</strong>
                    <span className="admin-message__email">{message.email}</span>
                    {!message.read ? <i className="admin-message__dot" /> : null}
                    <small>{formatDate(message.createdAt)} · {formatTime(message.createdAt)}</small>
                  </span>
                  <span className="admin-message__subject">{message.subject}</span>
                  <span className="admin-message__excerpt">{message.message}</span>
                </span>
                <span className="admin-message__state">
                  {message.read ? <MailOpen size={15} /> : <Mail size={15} />}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <AdminEmpty
            icon={Inbox}
            title={items.length ? 'Tidak ada pesan yang cocok.' : 'Kotak masuk masih kosong.'}
            description={items.length ? 'Coba filter atau kata kunci lain.' : 'Pesan dari pengunjung website akan muncul di sini.'}
          />
        )}
      </div>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Detail pesan"
        eyebrow="PESAN MASUK"
        size="md"
        footer={
          selected ? (
            <>
              <button type="button" className="admin-btn admin-btn--danger-ghost" onClick={() => setToDelete(selected)}>
                <Trash2 size={14} /> Hapus
              </button>
              <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`} className="admin-btn admin-btn--primary">
                <Mail size={14} /> Balas via email
              </a>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="admin-message-detail">
            <div className="admin-message-detail__head">
              <span className="admin-message__avatar admin-message__avatar--large">
                {selected.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <strong>{selected.name}</strong>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <StatusBadge tone="success"><CheckCheck size={11} /> Terbaca</StatusBadge>
            </div>
            <div className="admin-message-detail__meta">
              <span>{formatDate(selected.createdAt, { weekday: 'long' })} · {formatTime(selected.createdAt)}</span>
              <span>SUBJECT: {selected.subject}</span>
            </div>
            <div className="admin-message-detail__content">
              {selected.message.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Hapus pesan ini?"
        description={toDelete ? `Pesan dari ${toDelete.name} akan dihapus permanen.` : ''}
      />
    </div>
  );
}
