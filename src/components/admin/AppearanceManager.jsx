import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Eye,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Sun,
  Type,
} from 'lucide-react';
import { AdminPageHeader, Field, ImageField, Toggle } from './ui';
import { initials } from '../../lib/utils';

const PRESETS = [
  { name: 'Acid Lime', accent: '#c8ff5e', accent2: '#5ce1c3' },
  { name: 'Neon Cyan', accent: '#6ce9ff', accent2: '#a78bfa' },
  { name: 'Solar Amber', accent: '#ffd166', accent2: '#ff8a5c' },
  { name: 'Signal Rose', accent: '#ff9ebc', accent2: '#ffd36e' },
  { name: 'Arctic', accent: '#d8e4ea', accent2: '#7dd3fc' },
];

export default function AppearanceManager({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = () => {
    setForm((current) => ({ ...current, accent: '#c8ff5e', accent2: '#5ce1c3', mode: 'dark', showGrid: true }));
  };

  return (
    <form className="admin-page" onSubmit={submit}>
      <AdminPageHeader
        eyebrow="SITUS / TAMPILAN"
        title="Tampilan & branding"
        description="Atur logo, foto profil, warna aksen, tema, dan konten bagian kontak."
        actions={
          <>
            <Link to="/" target="_blank" className="admin-btn">
              <Eye size={15} /> Pratinjau
            </Link>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              {saving ? 'Menyimpan...' : 'Simpan tampilan'}
            </button>
          </>
        }
      />

      <div className="admin-form-layout">
        <div className="admin-form-main">
          <section className="admin-card">
            <header className="admin-card__head">
              <span className="admin-eyebrow">01 / BRAND ASSETS</span>
              <h2>Logo & foto profil</h2>
              <p>Logo tampil di header, footer, dan panel admin. Foto profil tampil di hero section.</p>
            </header>
            <div className="admin-card__body">
              <div className="admin-asset-grid">
                <ImageField
                  label="Logo website"
                  value={form.logo}
                  onChange={(value) => setForm((current) => ({ ...current, logo: value }))}
                  aspect="square"
                  hint="Gunakan PNG transparan atau SVG berukuran persegi. Disarankan 512×512 px."
                />
                <ImageField
                  label="Foto profil"
                  value={form.photo}
                  onChange={(value) => setForm((current) => ({ ...current, photo: value }))}
                  aspect="portrait"
                  hint="Gunakan foto portrait dengan rasio 4:5. Foto akan tampil monokrom dan berwarna saat hover."
                />
              </div>
              <div className="admin-form-grid admin-form-grid--2" style={{ marginTop: 22 }}>
                <Field label="Nama situs" hint="Tampil di header sebagai wordmark.">
                  <input className="admin-input" value={form.siteName || ''} onChange={set('siteName')} maxLength={60} />
                </Field>
                <Field label="Catatan footer" hint="Satu kalimat pendek di bagian footer.">
                  <input className="admin-input" value={form.footerNote || ''} onChange={set('footerNote')} maxLength={240} />
                </Field>
              </div>
            </div>
          </section>

          <section className="admin-card">
            <header className="admin-card__head">
              <span className="admin-eyebrow">02 / COLOR SYSTEM</span>
              <h2>Warna & tema</h2>
              <p>Warna aksen memengaruhi tombol, highlight, dan elemen grafis di seluruh website.</p>
            </header>
            <div className="admin-card__body">
              <div className="admin-presets">
                {PRESETS.map((preset) => {
                  const active = preset.accent.toLowerCase() === (form.accent || '').toLowerCase();
                  return (
                    <button
                      type="button"
                      key={preset.name}
                      className={`admin-preset ${active ? 'is-active' : ''}`}
                      onClick={() => setForm((current) => ({ ...current, accent: preset.accent, accent2: preset.accent2 }))}
                    >
                      <span className="admin-preset__swatches">
                        <i style={{ background: preset.accent }} />
                        <i style={{ background: preset.accent2 }} />
                      </span>
                      <span>{preset.name}</span>
                      {active ? <Check size={13} /> : null}
                    </button>
                  );
                })}
              </div>

              <div className="admin-form-grid admin-form-grid--2" style={{ marginTop: 22 }}>
                <Field label="Warna aksen utama">
                  <div className="admin-color-input">
                    <input type="color" value={form.accent || '#c8ff5e'} onChange={set('accent')} aria-label="Pilih warna aksen" />
                    <input className="admin-input" value={form.accent || ''} onChange={set('accent')} maxLength={7} placeholder="#c8ff5e" />
                  </div>
                </Field>
                <Field label="Warna aksen sekunder">
                  <div className="admin-color-input">
                    <input type="color" value={form.accent2 || '#5ce1c3'} onChange={set('accent2')} aria-label="Pilih warna aksen sekunder" />
                    <input className="admin-input" value={form.accent2 || ''} onChange={set('accent2')} maxLength={7} placeholder="#5ce1c3" />
                  </div>
                </Field>
              </div>

              <div className="admin-theme-row">
                <div>
                  <span className="admin-field__label">Mode tampilan</span>
                  <div className="admin-segmented">
                    <button
                      type="button"
                      className={form.mode !== 'light' ? 'is-active' : ''}
                      onClick={() => setForm((current) => ({ ...current, mode: 'dark' }))}
                    >
                      <Moon size={14} /> Dark
                    </button>
                    <button
                      type="button"
                      className={form.mode === 'light' ? 'is-active' : ''}
                      onClick={() => setForm((current) => ({ ...current, mode: 'light' }))}
                    >
                      <Sun size={14} /> Light
                    </button>
                  </div>
                </div>
                <Toggle
                  checked={form.showGrid !== false}
                  onChange={(value) => setForm((current) => ({ ...current, showGrid: value }))}
                  label="Grid background"
                  description="Tampilkan pola grid halus di belakang konten."
                />
              </div>

              <button type="button" className="admin-text-btn" onClick={resetTheme} style={{ marginTop: 18 }}>
                <RotateCcw size={13} /> Kembalikan tema default
              </button>
            </div>
          </section>

          <section className="admin-card">
            <header className="admin-card__head">
              <span className="admin-eyebrow">03 / CONTACT SECTION</span>
              <h2>Konten bagian kontak</h2>
              <p>Ajakan dan penjelasan yang tampil di section kontak sebelum formulir pesan.</p>
            </header>
            <div className="admin-card__body">
              <div className="admin-form-grid">
                <Field label="Judul kontak">
                  <input className="admin-input" value={form.contactHeadline || ''} onChange={set('contactHeadline')} maxLength={200} />
                </Field>
                <Field label="Deskripsi kontak">
                  <textarea className="admin-input" rows={4} value={form.contactText || ''} onChange={set('contactText')} maxLength={1000} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-form-side">
          <div className="appearance-preview-wrap">
            <div className="appearance-preview-head">
              <span><Monitor size={14} /> LIVE PREVIEW</span>
              <span>{form.mode === 'light' ? 'LIGHT' : 'DARK'}</span>
            </div>
            <div
              className={`appearance-preview appearance-preview--${form.mode === 'light' ? 'light' : 'dark'}`}
              style={{
                '--preview-accent': form.accent || '#c8ff5e',
                '--preview-accent-2': form.accent2 || '#5ce1c3',
              }}
            >
              <div className="appearance-preview__grid" />
              <div className="appearance-preview__nav">
                <span className="appearance-preview__brand">
                  {form.logo ? <img src={form.logo} alt="" /> : <i>{initials(form.name)}</i>}
                  <b>{form.siteName || 'SITE'}</b>
                </span>
                <span className="appearance-preview__navlinks"><i /><i /><i /></span>
                <span className="appearance-preview__pill">HUBUNGI</span>
              </div>
              <div className="appearance-preview__body">
                <div className="appearance-preview__copy">
                  <span className="appearance-preview__eyebrow">PERSONAL INFORMATION SYSTEM</span>
                  <strong>{form.fullName || 'Nama Anda'}<em>.</em></strong>
                  <span className="appearance-preview__role">{form.role || 'Peran Anda'}</span>
                  <p>{form.headline || 'Headline Anda akan tampil di sini.'}</p>
                  <div className="appearance-preview__buttons"><i /><i /></div>
                </div>
                <div className="appearance-preview__portrait">
                  {form.photo ? <img src={form.photo} alt="" /> : <span>{initials(form.name)}</span>}
                  <b>SIGNAL / ONLINE</b>
                </div>
              </div>
              <div className="appearance-preview__stats">
                <span><b>12+</b><i>PROYEK</i></span>
                <span><b>08</b><i>KARYA</i></span>
                <span><b>06</b><i>SERTIFIKAT</i></span>
              </div>
            </div>
          </div>

          <div className="admin-note-card">
            <Palette size={17} />
            <div>
              <strong>Konsistensi visual</strong>
              <p>Gunakan satu warna aksen utama. Warna sekunder sebaiknya masih satu keluarga agar tampilan tetap rapi.</p>
            </div>
          </div>

          <div className="admin-note-card">
            <Type size={17} />
            <div>
              <strong>Rekomendasi aset</strong>
              <p>Logo persegi minimal 512×512 px, foto portrait 4:5 minimal 1000×1250 px, dan ukuran file di bawah 6 MB.</p>
            </div>
          </div>

          <div className="admin-note-card admin-note-card--muted">
            <ImageIcon size={17} />
            <div>
              <strong>Penyimpanan gambar</strong>
              <p>Semua gambar disimpan di folder <code>uploads/</code> pada server.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="admin-savebar">
        <span>Perubahan tampilan diterapkan setelah disimpan.</span>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Menyimpan...' : 'Simpan tampilan'}
        </button>
      </div>
    </form>
  );
}
