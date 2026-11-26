import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import BrandMark from '../common/BrandMark';
import { useAuth } from '../../context/AuthContext';
import { applyTheme } from '../../lib/utils';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    applyTheme({ mode: 'dark', accent: '#c8ff5e', accent2: '#5ce1c3', showGrid: true });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await login(form.username.trim(), form.password);
    } catch (loginError) {
      setError(loginError.message || 'Gagal masuk. Periksa kredensial Anda.');
      setStatus('idle');
    }
  };

  return (
    <div className="admin-login">
      <section className="admin-login__visual">
        <div className="admin-login__visual-grid" />
        <div className="admin-login__visual-glow" />

        <div className="admin-login__brand">
          <BrandMark size="sm" name="Daffa" />
          <div>
            <strong>DAFFA.SYS</strong>
            <span>CONTROL ROOM / SUPERADMIN</span>
          </div>
        </div>

        <motion.div
          className="admin-login__center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="admin-eyebrow">SECURE ACCESS / 001</span>
          <h1>
            Kendalikan <em>sistem</em> di balik profil.
          </h1>
          <p>
            Satu ruang kerja untuk mengelola identitas, karya, aplikasi, sertifikat, dan seluruh tampilan website.
          </p>

          <div className="admin-login__terminal">
            <div className="admin-login__terminal-bar">
              <span /><span /><span />
              <em>system_check.log</em>
            </div>
            <div className="admin-login__terminal-body">
              <p><span>01</span> database connection <b>READY</b></p>
              <p><span>02</span> content engine <b>READY</b></p>
              <p><span>03</span> authorization layer <b>LOCKED</b></p>
              <p className="terminal-cursor"><span>04</span> awaiting credentials <i>_</i></p>
            </div>
          </div>
        </motion.div>

        <div className="admin-login__visual-foot">
          <span><Activity size={13} /> ALL SYSTEMS NOMINAL</span>
          <span>SECURE SESSION / 12H</span>
        </div>
      </section>

      <section className="admin-login__panel">
        <div className="admin-login__panel-top">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={14} /> Kembali ke website
          </Link>
          <span className="admin-login__secure">
            <ShieldCheck size={13} /> ENCRYPTED
          </span>
        </div>

        <motion.div
          className="admin-login__form-wrap"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="admin-login__icon">
            <LockKeyhole size={22} />
          </span>
          <span className="admin-eyebrow">SUPERADMIN SIGN-IN</span>
          <h2>Masuk ke panel</h2>
          <p className="admin-login__intro">
            Gunakan kredensial superadmin yang sudah dikonfigurasi. Sesi akan aktif selama 12 jam.
          </p>

          <form className="admin-login__form" onSubmit={submit}>
            <label className="admin-field">
              <span className="admin-field__label">Username</span>
              <div className="admin-input-icon">
                <UserRound size={16} />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  autoFocus
                />
              </div>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Password</span>
              <div className="admin-input-icon">
                <LockKeyhole size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
                <button
                  type="button"
                  className="admin-input-icon__action"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error ? <div className="admin-login__error">{error}</div> : null}

            <button type="submit" className="admin-btn admin-btn--primary admin-login__submit" disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 size={16} className="spin" /> : <LockKeyhole size={16} />}
              {status === 'loading' ? 'Memverifikasi...' : 'Masuk ke control room'}
              {status !== 'loading' ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <div className="admin-login__hint">
            <Database size={14} />
            <span>Kredensial default tersedia di dokumentasi proyek. Segera ubah password setelah masuk pertama kali.</span>
          </div>
        </motion.div>

        <div className="admin-login__panel-foot">
          <span>DAFFA.SYS © {new Date().getFullYear()}</span>
          <span>v2.4 / NODE</span>
        </div>
      </section>
    </div>
  );
}
