import { useState } from 'react';
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { AdminPageHeader, Field } from './ui';
import { formatDateLong } from '../../lib/utils';

export default function AccountManager({ account, onUpdateAccount }) {
  const [form, setForm] = useState({ username: account.username, currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.currentPassword) {
      setError('Masukkan password saat ini untuk mengonfirmasi perubahan.');
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }
    setSaving(true);
    try {
      await onUpdateAccount({
        username: form.username,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword || undefined,
      });
      setForm((current) => ({ ...current, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setSuccess('Kredensial berhasil diperbarui.');
    } catch (updateError) {
      setError(updateError.message || 'Gagal memperbarui akun.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-page" onSubmit={submit}>
      <AdminPageHeader
        eyebrow="SISTEM / AKUN"
        title="Akun superadmin"
        description="Ubah username dan password akses panel. Gunakan password yang kuat dan unik."
        actions={
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            {saving ? 'Menyimpan...' : 'Simpan akun'}
          </button>
        }
      />

      <div className="admin-account-grid">
        <div className="admin-form-main">
          <section className="admin-card">
            <header className="admin-card__head">
              <span className="admin-eyebrow">01 / CREDENTIALS</span>
              <h2>Informasi akses</h2>
              <p>Username digunakan untuk masuk ke panel. Perubahan langsung berlaku setelah disimpan.</p>
            </header>
            <div className="admin-card__body">
              <Field label="Username" hint="Minimal 3 karakter. Huruf, angka, titik, garis bawah, atau strip.">
                <div className="admin-input-icon">
                  <UserRound size={16} />
                  <input className="admin-input" value={form.username} onChange={set('username')} autoComplete="username" maxLength={60} />
                </div>
              </Field>

              <div className="admin-form-divider">
                <LockKeyhole size={15} />
                <span>GANTI PASSWORD</span>
              </div>

              <Field label="Password saat ini" required hint="Diperlukan untuk menyimpan perubahan apa pun.">
                <div className="admin-input-icon">
                  <LockKeyhole size={16} />
                  <input
                    className="admin-input"
                    type={show ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={set('currentPassword')}
                    autoComplete="current-password"
                  />
                  <button type="button" className="admin-input-icon__action" onClick={() => setShow((value) => !value)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              <div className="admin-form-grid admin-form-grid--2">
                <Field label="Password baru" hint="Minimal 8 karakter. Kosongkan jika tidak ingin mengubah.">
                  <input
                    className="admin-input"
                    type={show ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={set('newPassword')}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Konfirmasi password baru">
                  <input
                    className="admin-input"
                    type={show ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {error ? <div className="admin-form-error">{error}</div> : null}
              {success ? <div className="admin-form-success">{success}</div> : null}
            </div>
          </section>
        </div>

        <aside className="admin-form-side">
          <section className="admin-account-card">
            <div className="admin-account-card__avatar">
              <KeyRound size={24} />
            </div>
            <span className="admin-eyebrow">SUPERADMIN</span>
            <h2>{account.username}</h2>
            <p>Akses penuh ke seluruh konten dan pengaturan tampilan.</p>
            <div className="admin-account-card__rows">
              <div><span>Peran</span><strong>Superadmin</strong></div>
              <div><span>Sesi</span><strong>12 jam</strong></div>
              <div><span>Terakhir diubah</span><strong>{formatDateLong(account.updatedAt)}</strong></div>
            </div>
          </section>

          <div className="admin-note-card admin-note-card--accent">
            <ShieldCheck size={18} />
            <div>
              <strong>Keamanan akun</strong>
              <p>Jangan gunakan password yang sama dengan akun lain. Panel dilengkapi pembatasan percobaan masuk dan sesi token yang kedaluwarsa otomatis.</p>
            </div>
          </div>

          <div className="admin-note-card">
            <LockKeyhole size={17} />
            <div>
              <strong>Penyimpanan kredensial</strong>
              <p>Password disimpan dalam bentuk hash bcrypt dan tidak pernah ditampilkan kembali.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="admin-savebar">
        <span>Perubahan kredensial langsung berlaku untuk sesi berikutnya.</span>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Menyimpan...' : 'Simpan akun'}
        </button>
      </div>
    </form>
  );
}
