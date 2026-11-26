import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Clock, X } from 'lucide-react';
import { formatDateLong } from '../../lib/utils';
import { lockScroll, unlockScroll } from '../../lib/scroll';

function readingTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export default function WorkModal({ work, onClose }) {
  useEffect(() => {
    if (!work) return undefined;
    lockScroll();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [work, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {work ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            className="reading-modal"
            role="dialog"
            aria-modal="true"
            aria-label={work.title}
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="reading-modal__bar">
              <span>
                {work.type} / {work.year || '—'}
              </span>
              <span className="reading-modal__bar-center">
                <Clock size={13} /> {readingTime(work.content)} MENIT BACA
              </span>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup" autoFocus>
                <X size={18} />
              </button>
            </div>

            <div className="reading-modal__scroll">
              {work.cover ? (
                <div className="reading-modal__cover">
                  <img src={work.cover} alt="" />
                </div>
              ) : null}

              <header className="reading-header">
                <div className="reading-meta">
                  <span>{work.category || 'Umum'}</span>
                  <span>{formatDateLong(work.createdAt)}</span>
                </div>
                <h2>{work.title}</h2>
                <p>{work.excerpt}</p>
                <div className="reading-tags">
                  {(work.tags || []).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </header>

              <div className="prose">
                {work.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer" />
                      ),
                    }}
                  >
                    {work.content}
                  </ReactMarkdown>
                ) : (
                  <p>Konten karya ini belum tersedia. Silakan hubungi pemilik melalui halaman kontak.</p>
                )}
              </div>

              <footer className="reading-footer">
                <div>
                  <small>DIPUBLIKASIKAN</small>
                  <strong>{formatDateLong(work.createdAt)}</strong>
                </div>
                {work.link ? (
                  <a href={work.link} target="_blank" rel="noreferrer" className="btn btn--primary">
                    Buka sumber asli
                    <ArrowUpRight size={16} />
                  </a>
                ) : null}
              </footer>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
