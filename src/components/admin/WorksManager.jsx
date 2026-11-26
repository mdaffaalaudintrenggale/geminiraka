import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  FileText,
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
import { formatDate } from '../../lib/utils';

const TYPES = ['Artikel', 'Jurnal', 'Karya Tulis'];

function emptyWork() {
  return {
    title: '',
    type: 'Artikel',
    category: '',
    year: String(new Date().getFullYear()),
    excerpt: '',
    content: '',
    tags: [],
    link: '',
    cover: '',
    featured: false,
    published: true,
  };
}

export default function WorksManager({ items, onSave, onDelete, createSignal }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('Semua');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyWork);
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = type === 'Semua' || item.type === type;
      const matchesQuery =
        !needle ||
        [item.title, item.category, item.excerpt, item.type, ...(item.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      return matchesType && matchesQuery;
    });
  }, [items, query, type]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyWork());
    setTagsText('');
    setError('');
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setTagsText((item.tags || []).join(', '));
    setError('');
    setOpen(true);
  };

  useEffect(() => {
    if (!createSignal) return;
    setEditing(null);
    setForm(emptyWork());
    setTagsText('');
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
      setError('Judul karya wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const tags = tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      await onSave('works', { ...form, tags });
      setOpen(false);
      setEditing(null);
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan karya.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete('works', toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="KONTEN / KARYA"
        title="Karya & tulisan"
        description="Kelola artikel, jurnal, dan karya tulis yang tampil di website."
        actions={<AddButton onClick={openNew}>Karya baru</AddButton>}
      />

      <div className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Cari judul, kategori, atau tag..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="admin-filter-chips">
            {['Semua', ...TYPES].map((item) => (
              <button
                type="button"
                key={item}
                className={type === item ? 'is-active' : ''}
                onClick={() => setType(item)}
              >
                {item}
                <span>{item === 'Semua' ? items.length : items.filter((entry) => entry.type === item).length}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Karya</th>
                  <th>Tipe</th>
                  <th>Kategori</th>
                  <th>Tahun</th>
                  <th>Status</th>
                  <th className="admin-table__actions-head">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-table__title">
                        <span className="admin-table__icon"><FileText size={16} /></span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.excerpt || 'Tanpa ringkasan'} · {formatDate(item.createdAt)}</small>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge tone="lime">{item.type}</StatusBadge></td>
                    <td className="admin-table__muted">{item.category || '—'}</td>
                    <td className="admin-table__muted">{item.year || '—'}</td>
                    <td>
                      <div className="admin-table__status">
                        <StatusBadge tone={item.published ? 'success' : 'neutral'}>
                          {item.published ? 'Live' : 'Draft'}
                        </StatusBadge>
                        {item.featured ? <Star size={12} className="admin-star" /> : null}
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__actions">
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
            icon={FileText}
            title={items.length ? 'Tidak ada karya yang cocok.' : 'Belum ada karya.'}
            description={items.length ? 'Coba kata kunci atau filter lain.' : 'Mulai arsipkan artikel, jurnal, atau karya tulis pertama Anda.'}
            action={!items.length ? <button type="button" className="admin-btn admin-btn--primary" onClick={openNew}><Plus size={14} /> Tambah karya</button> : null}
          />
        )}
      </div>

      <AdminModal
        open={open}
        onClose={close}
        title={editing ? 'Edit karya' : 'Karya baru'}
        eyebrow={editing ? 'EDIT / KARYA' : 'CREATE / KARYA'}
        size="lg"
        footer={
          <>
            <button type="button" className="admin-btn" onClick={close} disabled={saving}>Batal</button>
            <button type="submit" form="work-form" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              {saving ? 'Menyimpan...' : 'Simpan karya'}
            </button>
          </>
        }
      >
        <form id="work-form" className="admin-form" onSubmit={submit}>
          {error ? <div className="admin-form-error">{error}</div> : null}

          <Field label="Judul karya" required>
            <input className="admin-input" value={form.title} onChange={set('title')} maxLength={180} autoFocus />
          </Field>

          <div className="admin-form-grid admin-form-grid--3">
            <Field label="Tipe">
              <select className="admin-input" value={form.type} onChange={set('type')}>
                {TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Kategori">
              <input className="admin-input" value={form.category} onChange={set('category')} placeholder="UI/UX, Sistem Informasi..." maxLength={90} />
            </Field>
            <Field label="Tahun">
              <input className="admin-input" value={form.year} onChange={set('year')} placeholder="2025" maxLength={20} />
            </Field>
          </div>

          <Field label="Ringkasan" hint="Tampil di kartu karya dan pembuka halaman baca.">
            <textarea className="admin-input" rows={3} value={form.excerpt} onChange={set('excerpt')} maxLength={500} />
          </Field>

          <Field
            label="Isi karya"
            hint="Mendukung Markdown: ## Judul, **tebal**, - daftar, > kutipan, dan tautan."
          >
            <textarea className="admin-input admin-input--code" rows={14} value={form.content} onChange={set('content')} maxLength={60000} />
          </Field>

          <div className="admin-form-grid admin-form-grid--2">
            <Field label="Tag" hint="Pisahkan dengan koma. Maksimal 12 tag.">
              <input className="admin-input" value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="React, UI/UX, Riset" />
            </Field>
            <Field label="Tautan sumber / publikasi" hint="URL eksternal, opsional.">
              <input className="admin-input" value={form.link} onChange={set('link')} placeholder="https://..." maxLength={500} />
            </Field>
          </div>

          <ImageField
            label="Cover karya"
            value={form.cover}
            onChange={(value) => setForm((current) => ({ ...current, cover: value }))}
            hint="Rasio lebar 16:7. Opsional."
          />

          <div className="admin-toggle-grid">
            <Toggle
              checked={form.published}
              onChange={(value) => setForm((current) => ({ ...current, published: value }))}
              label="Publikasikan"
              description="Tampilkan karya di website."
            />
            <Toggle
              checked={form.featured}
              onChange={(value) => setForm((current) => ({ ...current, featured: value }))}
              label="Tandai pilihan"
              description="Beri label featured dan prioritas urutan."
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Hapus karya ini?"
        description={toDelete ? `"${toDelete.title}" akan dihapus permanen dari database.` : ''}
      />
    </div>
  );
}
