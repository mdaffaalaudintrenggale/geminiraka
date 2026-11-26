import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Eye,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { AdminPageHeader, Field, Toggle } from './ui';
import { initials } from '../../lib/utils';

function SectionCard({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`admin-card ${className}`}>
      <header className="admin-card__head">
        <span className="admin-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="admin-card__body">{children}</div>
    </section>
  );
}

export default function IdentityManager({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [focusText, setFocusText] = useState((settings.focus || []).join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
    setFocusText((settings.focus || []).join(', '));
  }, [settings]);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const setStat = (index, key, value) => {
    setForm((current) => {
      const stats = [...(current.stats || [])];
      stats[index] = { ...stats[index], [key]: value };
      return { ...current, stats };
    });
  };

  const addStat = () => {
    setForm((current) => ({ ...current, stats: [...(current.stats || []), { label: '', value: '' }] }));
  };

  const removeStat = (index) => {
    setForm((current) => ({ ...current, stats: (current.stats || []).filter((_, i) => i !== index) }));
  };

  const setSocial = (index, key, value) => {
    setForm((current) => {
      const socials = [...(current.socials || [])];
      socials[index] = { ...socials[index], [key]: value };
      return { ...current, socials };
    });
  };

  const addSocial = () => {
    setForm((current) => ({ ...current, socials: [...(current.socials || []), { label: '', url: '' }] }));
  };

  const removeSocial = (index) => {
    setForm((current) => ({ ...current, socials: (current.socials || []).filter((_, i) => i !== index) }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const focus = focusText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      await onSave({ ...form, focus });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-page" onSubmit={submit}>
      <AdminPageHeader
        eyebrow="SITUS / IDENTITAS"
        title="Identitas & profil"
        description="Semua informasi di sini tampil di halaman utama, bagian profil, dan footer."
        actions={
          <>
            <Link to="/" target="_blank" className="admin-btn">
              <Eye size={15} /> Pratinjau
            </Link>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              {saving ? 'Menyimpan...' : 'Simpan perubahan'}
            </button>
          </>
        }
      />

      <div className="admin-form-layout">
        <div className="admin-form-main">
          <SectionCard
            eyebrow="01 / CORE IDENTITY"
            title="Informasi utama"
            description="Nama dan peran yang akan terlihat paling menonjol di hero section."
          >
            <div className="admin-form-grid admin-form-grid--2">
              <Field label="Nama pendek" required hint="Digunakan untuk logo monogram dan sapaan.">
                <input className="admin-input" value={form.name || ''} onChange={set('name')} maxLength={80} required />
              </Field>
              <Field label="Nama lengkap" required hint="Tampil sebagai judul utama di hero.">
                <input className="admin-input" value={form.fullName || ''} onChange={set('fullName')} maxLength={120} required />
              </Field>
              <Field label="Peran / profesi" required hint="Contoh: Information Systems Student.">
                <input className="admin-input" value={form.role || ''} onChange={set('role')} maxLength={120} />
              </Field>
              <Field label="Label hero" hint="Teks kecil di atas nama. Contoh: Personal Information System.">
                <input className="admin-input" value={form.heroLabel || ''} onChange={set('heroLabel')} maxLength={80} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="02 / NARRATIVE"
            title="Narasi & positioning"
            description="Tentukan pesan utama yang ingin disampaikan kepada pengunjung."
          >
            <div className="admin-form-grid">
              <Field label="Headline" hint="Satu kalimat kuat yang muncul di bawah nama.">
                <input className="admin-input" value={form.headline || ''} onChange={set('headline')} maxLength={260} />
              </Field>
              <Field label="Tagline / ringkasan" hint="Paragraf pendek pendukung headline.">
                <textarea className="admin-input" rows={3} value={form.tagline || ''} onChange={set('tagline')} maxLength={500} />
              </Field>
              <Field label="Bio lengkap" hint="Tampil di bagian profil. Ceritakan latar belakang, pendekatan, dan minat Anda.">
                <textarea className="admin-input" rows={7} value={form.bio || ''} onChange={set('bio')} maxLength={4000} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="03 / DETAILS"
            title="Detail personal"
            description="Informasi kontak dan pendidikan yang ditampilkan secara transparan."
          >
            <div className="admin-form-grid admin-form-grid--2">
              <Field label="Lokasi">
                <input className="admin-input" value={form.location || ''} onChange={set('location')} maxLength={120} />
              </Field>
              <Field label="Status ketersediaan">
                <input className="admin-input" value={form.availability || ''} onChange={set('availability')} maxLength={90} />
              </Field>
              <Field label="Email">
                <input className="admin-input" type="email" value={form.email || ''} onChange={set('email')} maxLength={160} />
              </Field>
              <Field label="Telepon">
                <input className="admin-input" value={form.phone || ''} onChange={set('phone')} maxLength={50} />
              </Field>
              <Field label="Pendidikan">
                <input className="admin-input" value={form.university || ''} onChange={set('university')} maxLength={140} />
              </Field>
              <Field label="Fokus keahlian" hint="Pisahkan dengan koma. Contoh: Web Development, UI Engineering.">
                <input className="admin-input" value={focusText} onChange={(event) => setFocusText(event.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <div className="admin-form-columns">
            <SectionCard
              eyebrow="04 / STATISTIK"
              title="Angka profil"
              description="Tampil di bawah hero. Maksimal 6 item."
            >
              <div className="admin-repeater">
                {(form.stats || []).map((stat, index) => (
                  <div className="admin-repeater__row" key={index}>
                    <input
                      className="admin-input"
                      placeholder="Label, mis. Proyek Selesai"
                      value={stat.label}
                      onChange={(event) => setStat(index, 'label', event.target.value)}
                      maxLength={50}
                    />
                    <input
                      className="admin-input admin-repeater__value"
                      placeholder="12+"
                      value={stat.value}
                      onChange={(event) => setStat(index, 'value', event.target.value)}
                      maxLength={12}
                    />
                    <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => removeStat(index)} aria-label="Hapus statistik">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {(form.stats || []).length < 6 ? (
                <button type="button" className="admin-add-row" onClick={addStat}>
                  <Plus size={14} /> Tambah statistik
                </button>
              ) : null}
            </SectionCard>

            <SectionCard
              eyebrow="05 / SOCIAL"
              title="Tautan sosial"
              description="Tampil di profil, kontak, dan footer."
            >
              <div className="admin-repeater">
                {(form.socials || []).map((social, index) => (
                  <div className="admin-repeater__row admin-repeater__row--social" key={index}>
                    <input
                      className="admin-input"
                      placeholder="Label"
                      value={social.label}
                      onChange={(event) => setSocial(index, 'label', event.target.value)}
                      maxLength={40}
                    />
                    <input
                      className="admin-input"
                      placeholder="https://..."
                      value={social.url}
                      onChange={(event) => setSocial(index, 'url', event.target.value)}
                      maxLength={300}
                    />
                    <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => removeSocial(index)} aria-label="Hapus tautan">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {(form.socials || []).length < 8 ? (
                <button type="button" className="admin-add-row" onClick={addSocial}>
                  <Plus size={14} /> Tambah tautan
                </button>
              ) : null}
            </SectionCard>
          </div>
        </div>

        <aside className="admin-form-side">
          <div className="identity-preview">
            <div className="identity-preview__top">
              <span>LIVE PROFILE</span>
              <span><i /> AKTIF</span>
            </div>
            <div className="identity-preview__avatar">
              {settings.photo ? <img src={settings.photo} alt="" /> : <span>{initials(form.fullName || form.name)}</span>}
            </div>
            <strong>{form.fullName || 'Nama lengkap'}</strong>
            <span className="identity-preview__role">{form.role || 'Peran / profesi'}</span>
            <p>{form.headline || 'Headline akan tampil di sini.'}</p>
            <div className="identity-preview__rows">
              <div><MapPin size={13} /><span>{form.location || 'Lokasi'}</span></div>
              <div><Mail size={13} /><span>{form.email || 'Email'}</span></div>
              <div><GraduationCap size={13} /><span>{form.university || 'Pendidikan'}</span></div>
            </div>
            <Link to="/" target="_blank" className="admin-btn admin-btn--block">
              <ArrowUpRight size={14} /> Buka website
            </Link>
          </div>

          <div className="admin-note-card">
            <UserRound size={17} />
            <div>
              <strong>Tips identitas</strong>
              <p>Gunakan nama lengkap yang konsisten dengan sertifikat dan publikasi agar mudah ditemukan.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="admin-savebar">
        <span>Perubahan belum diterapkan sampai Anda menyimpan.</span>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Menyimpan...' : 'Simpan identitas'}
        </button>
      </div>
    </form>
  );
}
