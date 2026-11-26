import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import { api } from '../../lib/api';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

export default function ContactSection({ settings }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Nama, email, dan pesan wajib diisi.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await api.contact(form);
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (requestError) {
      setStatus('idle');
      setError(requestError.message || 'Pesan gagal dikirim. Coba lagi.');
    }
  };

  return (
    <section className="section contact" id="kontak">
      <div className="container">
        <SectionHeader
          index="05"
          label="KONTAK / KOLABORASI"
          title={<>Mari <em>terhubung.</em></>}
          description="Punya proyek, ide riset, atau sekadar ingin berdiskusi? Kirim pesan — saya akan membaca dan merespons."
          aside={
            <div className="response-badge">
              <Clock3 size={16} />
              <span>RESPONS<br />&lt; 24 JAM</span>
            </div>
          }
        />

        <div className="contact-shell" data-reveal>
          <div className="contact-copy">
            <span className="mono-label">OPEN CHANNEL / 05</span>
            <h3>{settings.contactHeadline}</h3>
            <p>{settings.contactText}</p>

            <div className="contact-links">
              <a href={`mailto:${settings.email}`} className="contact-link">
                <span className="contact-link__icon"><Mail size={18} /></span>
                <span>
                  <small>EMAIL</small>
                  <strong>{settings.email}</strong>
                </span>
                <ArrowUpRight size={16} />
              </a>
              {settings.phone ? (
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="contact-link">
                  <span className="contact-link__icon"><Phone size={18} /></span>
                  <span>
                    <small>TELEPON</small>
                    <strong>{settings.phone}</strong>
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              ) : null}
              <div className="contact-link contact-link--static">
                <span className="contact-link__icon"><MapPin size={18} /></span>
                <span>
                  <small>LOKASI</small>
                  <strong>{settings.location}</strong>
                </span>
              </div>
            </div>

            <div className="contact-socials">
              {(settings.socials || []).map((social) => (
                <a key={`${social.label}-${social.url}`} href={social.url} target="_blank" rel="noreferrer">
                  {social.label}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </div>

          <div className="contact-form-panel">
            <div className="contact-form-panel__top">
              <span>NEW MESSAGE</span>
              <span className="contact-form-panel__secure">
                <Sparkles size={12} /> ENCRYPTED CHANNEL
              </span>
            </div>

            {status === 'success' ? (
              <motion.div
                className="form-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="form-success__icon"><Check size={26} /></span>
                <h4>Pesan terkirim.</h4>
                <p>Terima kasih sudah menghubungi. Pesan Anda sudah masuk ke sistem dan akan dibaca secepatnya.</p>
                <button type="button" className="btn btn--ghost" onClick={() => setStatus('idle')}>
                  Kirim pesan lain
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="contact-form">
                <div className="form-row">
                  <label className="form-field">
                    <span>Nama <em>*</em></span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Nama Anda"
                      autoComplete="name"
                      maxLength={100}
                    />
                  </label>
                  <label className="form-field">
                    <span>Email <em>*</em></span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="nama@email.com"
                      autoComplete="email"
                      maxLength={160}
                    />
                  </label>
                </div>
                <label className="form-field">
                  <span>Subjek</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder="Kolaborasi / pertanyaan / lainnya"
                    maxLength={160}
                  />
                </label>
                <label className="form-field">
                  <span>Pesan <em>*</em></span>
                  <textarea
                    value={form.message}
                    onChange={update('message')}
                    placeholder="Ceritakan ide, kebutuhan, atau hal yang ingin didiskusikan..."
                    rows={5}
                    maxLength={4000}
                  />
                </label>

                {error ? <p className="form-error">{error}</p> : null}

                <button type="submit" className="btn btn--primary contact-submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Mengirim...' : 'Kirim pesan'}
                  <Send size={16} />
                </button>
                <p className="form-note">Dengan mengirim pesan, data hanya digunakan untuk membalas komunikasi Anda.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
