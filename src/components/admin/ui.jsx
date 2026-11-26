import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Check,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { api } from '../../lib/api';

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="admin-page-head">
      <div>
        {eyebrow ? <span className="admin-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-head__actions">{actions}</div> : null}
    </div>
  );
}

export function Field({ label, hint, required, children, className = '' }) {
  return (
    <label className={`admin-field ${className}`}>
      <span className="admin-field__label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {hint ? <small className="admin-field__hint">{hint}</small> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`admin-toggle ${disabled ? 'is-disabled' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`admin-toggle__switch ${checked ? 'is-on' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span />
      </button>
      <span className="admin-toggle__copy">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

export function ImageField({ label, value, onChange, hint, aspect = 'wide', required = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 6 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await api.upload(file);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError.message || 'Upload gagal.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="admin-image-field">
      <span className="admin-field__label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      <div
        className={`admin-image-field__inner ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          uploadFile(event.dataTransfer.files?.[0]);
        }}
      >
        <div className={`admin-image-field__preview admin-image-field__preview--${aspect}`}>
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="admin-image-field__empty">
              <ImageIcon size={24} />
              <small>Belum ada gambar</small>
            </span>
          )}
          {busy ? (
            <span className="admin-image-field__busy">
              <Loader2 size={22} className="spin" />
              Mengunggah...
            </span>
          ) : null}
        </div>
        <div className="admin-image-field__side">
          <p>{hint || 'JPG, PNG, WEBP, GIF, atau AVIF. Maksimal 6 MB.'}</p>
          <div className="admin-image-field__actions">
            <button type="button" className="admin-btn admin-btn--small" onClick={() => inputRef.current?.click()} disabled={busy}>
              <Upload size={14} /> {value ? 'Ganti gambar' : 'Upload gambar'}
            </button>
            {value ? (
              <button type="button" className="admin-btn admin-btn--small admin-btn--danger-ghost" onClick={() => onChange('')} disabled={busy}>
                <Trash2 size={14} /> Hapus
              </button>
            ) : null}
          </div>
          {error ? <span className="admin-inline-error">{error}</span> : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(event) => uploadFile(event.target.files?.[0])}
      />
    </div>
  );
}

export function AdminModal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="admin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className={`admin-modal admin-modal--${size}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="admin-modal__head">
              <div>
                {eyebrow ? <span className="admin-eyebrow">{eyebrow}</span> : null}
                <h2>{title}</h2>
              </div>
              <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Tutup">
                <X size={18} />
              </button>
            </header>
            <div className="admin-modal__body">{children}</div>
            {footer ? <footer className="admin-modal__foot">{footer}</footer> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function ConfirmDialog({ open, title = 'Hapus data ini?', description, onClose, onConfirm, busy, label = 'Hapus' }) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      eyebrow="KONFIRMASI"
      size="sm"
      footer={
        <>
          <button type="button" className="admin-btn" onClick={onClose} disabled={busy}>
            Batal
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            {busy ? 'Menghapus...' : label}
          </button>
        </>
      }
    >
      <div className="admin-confirm">
        <span className="admin-confirm__icon"><AlertTriangle size={22} /></span>
        <p>{description || 'Tindakan ini tidak dapat dibatalkan. Data akan dihapus permanen.'}</p>
      </div>
    </AdminModal>
  );
}

export function AdminEmpty({ icon: Icon = Info, title, description, action }) {
  return (
    <div className="admin-empty">
      <span><Icon size={24} /></span>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function AdminLoading({ label = 'Memuat data...' }) {
  return (
    <div className="admin-loading">
      <Loader2 size={20} className="spin" />
      <span>{label}</span>
    </div>
  );
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((message, type = 'success') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, show, dismiss };
}

export function Toast({ toast, onClose }) {
  return createPortal(
    <AnimatePresence>
      {toast ? (
        <motion.div
          className={`admin-toast admin-toast--${toast.type}`}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="status"
        >
          <span className="admin-toast__icon">
            {toast.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
          </span>
          <span>{toast.message}</span>
          <button type="button" onClick={onClose} aria-label="Tutup notifikasi"><X size={14} /></button>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function AddButton({ onClick, children = 'Tambah data' }) {
  return (
    <button type="button" className="admin-btn admin-btn--primary" onClick={onClick}>
      <Plus size={15} />
      {children}
    </button>
  );
}
