import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import {
  AddButton,
  AdminEmpty,
  AdminModal,
  AdminPageHeader,
  ConfirmDialog,
  Field,
  ImageField,
  StatusBadge,
  Toggle,
} from './ui';

const STATUSES = ['Live', 'Beta', 'Prototype', 'Archived'];

function emptyApp() {
  return {
    title: '',
    description: '',
    category: '',
    tech: [],
    link: '',
    repo: '',
    image: '',
    status: 'Live',
    year: String(new Date().getFullYear()),
    featured: false,
    published: true,
  };
}

export default function AppsManager({ items, onSave, onDelete, createSignal }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyApp);
  const [techText, setTechText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.title, item.description, item.category, item.status, ...(item.tech || [])]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyApp());
    setTechText('');
    setError('');
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setTechText((item.tech || []).join(', '));
    setError('');
    setOpen(true);
  };

  useEffect(() => {
    if (!createSignal) return;
    setEditing(null);
    setForm(emptyApp());
    setTechText('');
    setError('');
    setOpen(true);
  }, [createSignal]);

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setError('');
  };

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Nama aplikasi wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const tech = techText.split(',').map((item) => item.trim()).filter(Boolean);
      await onSave('apps', { ...form, tech });
      setOpen(false);
      setEditing(null);
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan aplikasi.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete('apps', toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="KONTEN / APLIKASI"
        title="Aplikasi & produk"
        description="Tampilkan aplikasi yang sudah Anda bangun, lengkap dengan teknologi dan tautannya."
        actions={<AddButton onClick={openNew}>Aplikasi baru</AddButton>}
      />

      <div className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Cari aplikasi atau teknologi..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span className="admin-toolbar__meta">{filtered.length} dari {items.length} aplikasi</span>
        </div>

        {filtered.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Aplikasi</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Teknologi</th>
                  <th>Tahun</th>
                  <th className="admin-table__actions-head">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-table__title">
                        <span className="admin-table__icon admin-table__icon--app">
                          {item.image ? <img src={item.image} alt="" /> : <Layers3 size={16} />}
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.description || 'Tanpa deskripsi'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table__muted">{item.category || '—'}</td>
                    <td>
                      <div className="admin-table__status">
                        <StatusBadge tone={item.status === 'Live' ? 'success' : item.status === 'Beta' ? 'warning' : 'neutral'}>
                          {item.status}
                        </StatusBadge>
                        {item.featured ? <Star size={12} className="admin-star" /> : null}
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__tags">
                        {(item.tech || []).slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}
                        {(item.tech || []).length > 3 ? <span>+{item.tech.length - 3}</span> : null}
                      </div>
                    </td>
                    <td className="admin-table__muted">{item.year || '—'}</td>
                    <td>
                      <div className="admin-table__actions">
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="admin-icon-btn" aria-label="Buka aplikasi">
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                        <button type="button" className="admin-icon-btn" onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setToDelete(item)} aria-label={`Hapus ${item.title}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmpty
            icon={Layers3}
            title={items.length ? 'Tidak ada aplikasi yang cocok.' : 'Belum ada aplikasi.'}
            description={items.length ? 'Coba kata kunci lain.' : 'Tambahkan produk digital yang sudah Anda bangun.'}
            action={!items.length ? <button type="button" className="admin-btn admin-btn--primary" onClick={openNew}><Plus size={14} /> Tambah aplikasi</button> : null}
          />
        )}
      </div>

      <AdminModal
        open={open}
        onClose={close}
        title={editing ? 'Edit aplikasi' : 'Aplikasi baru'}
        eyebrow={editing ? 'EDIT / APLIKASI' : 'CREATE / APLIKASI'}
        size="lg"
        footer={
          <>
            <button type="button" className="admin-btn" onClick={close} disabled={saving}>Batal</button>
            <button type="submit" form="app-form" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              {saving ? 'Menyimpan...' : 'Simpan aplikasi'}
            </button>
          </>
        }
      >
        <form id="app-form" className="admin-form" onSubmit={submit}>
          {error ? <div className="admin-form-error">{error}</div> : null}

          <Field label="Nama aplikasi" required>
            <input className="admin-input" value={form.title} onChange={set('title')} maxLength={120} autoFocus />
          </Field>

          <div className="admin-form-grid admin-form-grid--3">
            <Field label="Kategori">
              <input className="admin-input" value={form.category} onChange={set('category')} placeholder="Web App, Dashboard..." maxLength={90} />
            </Field>
            <Field label="Status">
              <select className="admin-input" value={form.status} onChange={set('status')}>
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
            <Field label="Tahun">
              <input className="admin-input" value={form.year} onChange={set('year')} placeholder="2025" maxLength={20} />
            </Field>
          </div>

          <Field label="Deskripsi" hint="Jelaskan masalah yang diselesaikan dan fungsi utama aplikasi.">
            <textarea className="admin-input" rows={4} value={form.description} onChange={set('description')} maxLength={1200} />
          </Field>

          <div className="admin-form-grid admin-form-grid--2">
            <Field label="Teknologi" hint="Pisahkan dengan koma.">
              <input className="admin-input" value={techText} onChange={(event) => setTechText(event.target.value)} placeholder="React, Express, MySQL" />
            </Field>
            <Field label="Tautan aplikasi">
              <input className="admin-input" value={form.link} onChange={set('link')} placeholder="https://..." maxLength={500} />
            </Field>
            <Field label="Tautan repositori">
              <input className="admin-input" value={form.repo} onChange={set('repo')} placeholder="https://github.com/..." maxLength={500} />
            </Field>
          </div>

          <ImageField
            label="Screenshot aplikasi"
            value={form.image}
            onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            hint="Rasio 16:9. Jika kosong, website akan menampilkan visual generatif."
          />

          <div className="admin-toggle-grid">
            <Toggle
              checked={form.published}
              onChange={(value) => setForm((current) => ({ ...current, published: value }))}
              label="Publikasikan"
              description="Tampilkan aplikasi di website."
            />
            <Toggle
              checked={form.featured}
              onChange={(value) => setForm((current) => ({ ...current, featured: value }))}
              label="Tandai pilihan"
              description="Prioritaskan aplikasi pada urutan tampil."
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Hapus aplikasi ini?"
        description={toDelete ? `"${toDelete.title}" akan dihapus permanen dari database.` : ''}
      />
    </div>
  );
}
