import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Award, BadgeCheck, ExternalLink, ShieldCheck, X } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { lockScroll, unlockScroll } from '../../lib/scroll';

function CertificatePreview({ certificate, index }) {
  return (
    <div className={`certificate-preview certificate-preview--${index % 3}`}>
      {certificate.image ? (
        <img src={certificate.image} alt={`Sertifikat ${certificate.title}`} loading="lazy" />
      ) : (
        <>
          <div className="certificate-preview__grid" />
          <div className="certificate-preview__head">
            <span>CERTIFICATE</span>
            <span>NO. {String(index + 1).padStart(3, '0')}</span>
          </div>
          <div className="certificate-preview__seal">
            <BadgeCheck size={28} />
            <span>VERIFIED</span>
          </div>
          <div className="certificate-preview__body">
            <small>THIS CERTIFIES THAT</small>
            <strong>{certificate.title}</strong>
            <span>{certificate.issuer}</span>
          </div>
          <div className="certificate-preview__foot">
            <span>{certificate.date || '2025'}</span>
            <span>{certificate.credentialId || 'CREDENTIAL ID'}</span>
          </div>
        </>
      )}
      <span className="certificate-preview__hover">
        <ArrowUpRight size={18} />
      </span>
    </div>
  );
}

function CertificateModal({ certificate, onClose }) {
  useEffect(() => {
    if (!certificate) return undefined;
    lockScroll();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [certificate, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {certificate ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="certificate-modal"
            role="dialog"
            aria-modal="true"
            aria-label={certificate.title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="certificate-modal__bar">
              <span>CREDENTIAL / VERIFIED</span>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup" autoFocus>
                <X size={18} />
              </button>
            </div>
            <div className="certificate-modal__visual">
              <CertificatePreview certificate={certificate} index={0} />
            </div>
            <div className="certificate-modal__content">
              <span className="certificate-issuer">
                <Award size={14} /> {certificate.issuer}
              </span>
              <h2>{certificate.title}</h2>
              <div className="certificate-details">
                <div>
                  <small>TANGGAL</small>
                  <strong>{certificate.date || '—'}</strong>
                </div>
                <div>
                  <small>CREDENTIAL ID</small>
                  <strong>{certificate.credentialId || '—'}</strong>
                </div>
              </div>
              {certificate.skills?.length ? (
                <div className="reading-tags">
                  {certificate.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              ) : null}
              {certificate.link ? (
                <a href={certificate.link} target="_blank" rel="noreferrer" className="btn btn--primary">
                  Verifikasi sertifikat <ExternalLink size={15} />
                </a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default function CertificatesSection({ certificates = [] }) {
  const [selected, setSelected] = useState(null);

  return (
    <section className="section certificates" id="sertifikat">
      <div className="container">
        <SectionHeader
          index="04"
          label="KREDENSIAL / SERTIFIKAT"
          title={<>Bukti kompetensi & <em>proses.</em></>}
          description="Sertifikasi dan kredensial yang menandai perjalanan belajar, validasi keterampilan, dan komitmen untuk terus berkembang."
          aside={
            <div className="verified-badge">
              <ShieldCheck size={17} />
              <span>VERIFIED<br />CREDENTIALS</span>
            </div>
          }
        />

        {certificates.length ? (
          <div className="certificate-grid">
            {certificates.map((certificate, index) => (
              <motion.button
                type="button"
                key={certificate.id}
                className="certificate-card"
                onClick={() => setSelected(certificate)}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.24), ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
                aria-label={`Lihat sertifikat ${certificate.title}`}
              >
                <CertificatePreview certificate={certificate} index={index} />
                <div className="certificate-card__info">
                  <div>
                    <span>{certificate.issuer}</span>
                    <h3>{certificate.title}</h3>
                  </div>
                  <span className="certificate-card__year">{certificate.date || '—'}</span>
                </div>
                <div className="certificate-card__skills">
                  {(certificate.skills || []).slice(0, 3).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Award size={24} />
            <strong>Belum ada sertifikat.</strong>
            <span>Tambahkan melalui panel superadmin.</span>
          </div>
        )}
      </div>

      <CertificateModal certificate={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
