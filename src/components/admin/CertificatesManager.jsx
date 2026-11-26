import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
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

function emptyCertificate() {
  return {
    title: '',
    issuer: '',
    date: String(new Date().getFullYear()),
    credentialId: '',
    link: '',
    image: '',
    skills: [],
    published: true,
  };
}

export default function CertificatesManager({ items, onSave, onDelete, createSignal }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCertificate);
  const [skillsText, setSkillsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.title, item.issuer, item.credentialId, ...(item.skills || [])]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyCertificate());
    setSkillsText('');
    setError('');
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setSkillsText((item.skills || []).join(', '));
    setError('');
    setOpen(true);
  };

  useEffect(() => {
    if (!createSignal) return;
    setEditing(null);
    setForm(emptyCertificate());
    setSkillsText('');
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
      setError('Nama sertifikat wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const skills = skillsText.split(',').map((item) => item.trim()).filter(Boolean);
      await onSave('certificates', { ...form, skills });
      setOpen(false);
      setEditing(null);
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan sertifikat.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete('certificates', toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="KONTEN / SERTIFIKAT"
        title="Sertifikat & kredensial"
        description="Kelola bukti kompetensi, sertifikasi, dan kredensial profesional Anda."
        actions={<AddButton onClick={openNew}>Sertifikat baru</AddButton>}
      />

      <div className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Cari sertifikat atau penerbit..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span className="admin-toolbar__meta">{filtered.length} dari {items.length} sertifikat</span>
        </div>

        {filtered.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sertifikat</th>
                  <th>Penerbit</th>
                  <th>Tanggal</th>
                  <th>Credential ID</th>
                  <th>Status</th>
                  <th className="admin-table__actions-head">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-table__title">
                        <span className="admin-table__icon admin-table__icon--cert">
                          {item.image ? <img src={item.image} alt="" /> : <Award size={16} />}
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.skills?.slice(0, 3).join(' · ') || 'Tanpa skill tag'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table__muted">{item.issuer || '—'}</td>
                    <td className="admin-table__muted">{item.date || '—'}</td>
                    <td className="admin-table__mono">{item.credentialId || '—'}</td>
                    <td>
                      <StatusBadge tone={item.published ? 'success' : 'neutral'}>
                        {item.published ? 'Published' : 'Hidden'}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="admin-icon-btn" aria-label="Buka sertifikat">
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
            icon={Award}
            title={items.length ? 'Tidak ada sertifikat yang cocok.' : 'Belum ada sertifikat.'}
            description={items.length ? 'Coba kata kunci lain.' : 'Tambahkan kredensial untuk memperkuat profil profesional Anda.'}
            action={!items.length ? <button type="button" className="admin-btn admin-btn--primary" onClick={openNew}><Plus size={14} /> Tambah sertifikat</button> : null}
          />
        )}
      </div>

      <AdminModal
        open={open}
        onClose={close}
        title={editing ? 'Edit sertifikat' : 'Sertifikat baru'}
        eyebrow={editing ? 'EDIT / SERTIFIKAT' : 'CREATE / SERTIFIKAT'}
        size="lg"
        footer={
          <>
            <button type="button" className="admin-btn" onClick={close} disabled={saving}>Batal</button>
            <button type="submit" form="certificate-form" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              {saving ? 'Menyimpan...' : 'Simpan sertifikat'}
            </button>
          </>
        }
      >
        <form id="certificate-form" className="admin-form" onSubmit={submit}>
          {error ? <div className="admin-form-error">{error}</div> : null}

          <Field label="Nama sertifikat" required>
            <input className="admin-input" value={form.title} onChange={set('title')} maxLength={180} autoFocus />
          </Field>

          <div className="admin-form-grid admin-form-grid--3">
            <Field label="Penerbit">
              <input className="admin-input" value={form.issuer} onChange={set('issuer')} placeholder="Dicoding, BNSP, Coursera..." maxLength={120} />
            </Field>
            <Field label="Tanggal / tahun">
              <input className="admin-input" value={form.date} onChange={set('date')} placeholder="2025" maxLength={30} />
            </Field>
            <Field label="Credential ID">
              <input className="admin-input" value={form.credentialId} onChange={set('credentialId')} placeholder="ID kredensial" maxLength={80} />
            </Field>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <Field label="Skill terkait" hint="Pisahkan dengan koma.">
              <input className="admin-input" value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="React, UI/UX, Data Analysis" />
            </Field>
            <Field label="Tautan verifikasi">
              <input className="admin-input" value={form.link} onChange={set('link')} placeholder="https://..." maxLength={500} />
            </Field>
          </div>

          <ImageField
            label="Gambar sertifikat"
            value={form.image}
            onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            hint="Rasio landscape. Jika kosong, website menampilkan preview sertifikat generatif."
          />

          <Toggle
            checked={form.published}
            onChange={(value) => setForm((current) => ({ ...current, published: value }))}
            label="Tampilkan di website"
            description="Sembunyikan jika sertifikat belum siap dipublikasikan."
          />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Hapus sertifikat ini?"
        description={toDelete ? `"${toDelete.title}" akan dihapus permanen dari database.` : ''}
      />
    </div>
  );
}
