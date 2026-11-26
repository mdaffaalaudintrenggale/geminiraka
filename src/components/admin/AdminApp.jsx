import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  ChevronRight,
  ExternalLink,
  FileText,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Layers3,
  Loader2,
  LogOut,
  Menu,
  Palette,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { applyTheme, initials } from '../../lib/utils';
import BrandMark from '../common/BrandMark';
import Login from './Login';
import Overview from './Overview';
import IdentityManager from './IdentityManager';
import AppearanceManager from './AppearanceManager';
import WorksManager from './WorksManager';
import AppsManager from './AppsManager';
import CertificatesManager from './CertificatesManager';
import MessagesManager from './MessagesManager';
import AccountManager from './AccountManager';
import { AdminLoading, Toast, useToast } from './ui';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [{ id: 'overview', label: 'Ringkasan', icon: LayoutDashboard }],
  },
  {
    label: 'Konten',
    items: [
      { id: 'works', label: 'Karya & tulisan', icon: FileText },
      { id: 'apps', label: 'Aplikasi', icon: Layers3 },
      { id: 'certificates', label: 'Sertifikat', icon: Award },
    ],
  },
  {
    label: 'Situs',
    items: [
      { id: 'identity', label: 'Identitas & profil', icon: UserRound },
      { id: 'appearance', label: 'Tampilan & branding', icon: Palette },
    ],
  },
  {
    label: 'Interaksi',
    items: [{ id: 'messages', label: 'Kotak masuk', icon: Inbox }],
  },
  {
    label: 'Sistem',
    items: [{ id: 'account', label: 'Akun superadmin', icon: KeyRound }],
  },
];

const TAB_META = {
  overview: { label: 'Ringkasan', eyebrow: 'CONTROL ROOM' },
  works: { label: 'Karya & tulisan', eyebrow: 'MANAJEMEN KONTEN' },
  apps: { label: 'Aplikasi', eyebrow: 'MANAJEMEN KONTEN' },
  certificates: { label: 'Sertifikat', eyebrow: 'MANAJEMEN KONTEN' },
  identity: { label: 'Identitas & profil', eyebrow: 'PENGATURAN SITUS' },
  appearance: { label: 'Tampilan & branding', eyebrow: 'PENGATURAN SITUS' },
  messages: { label: 'Kotak masuk', eyebrow: 'INTERAKSI' },
  account: { label: 'Akun superadmin', eyebrow: 'SISTEM' },
};

function AdminBoot() {
  return (
    <div className="admin-boot">
      <div className="admin-boot__mark"><ShieldCheck size={22} /></div>
      <Loader2 size={18} className="spin" />
      <span>MEMVERIFIKASI SESI SUPERADMIN...</span>
    </div>
  );
}

function Sidebar({ data, tab, onNavigate, onLogout, open, onClose }) {
  const unread = data?.messages?.filter((message) => !message.read).length || 0;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="admin-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <BrandMark logo={data?.settings?.logo} name={data?.settings?.name} size="sm" />
          <div>
            <strong>{data?.settings?.siteName || 'DAFFA.SYS'}</strong>
            <span>SUPERADMIN CONSOLE</span>
          </div>
          <button type="button" className="admin-sidebar__close" onClick={onClose} aria-label="Tutup menu">
            <X size={18} />
          </button>
        </div>

        <div className="admin-sidebar__status">
          <span><i /> SESSION ACTIVE</span>
          <span>12H</span>
        </div>

        <nav className="admin-nav" aria-label="Navigasi panel admin">
          {NAV_GROUPS.map((group) => (
            <div className="admin-nav__group" key={group.label}>
              <span className="admin-nav__label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`admin-nav__item ${active ? 'is-active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    {item.id === 'messages' && unread ? <em>{unread}</em> : null}
                    {active ? <ChevronRight size={13} className="admin-nav__chevron" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__site">
            <ExternalLink size={15} />
            <span>Lihat website</span>
            <ChevronRight size={13} />
          </a>
          <button type="button" className="admin-sidebar__logout" onClick={onLogout}>
            <LogOut size={15} />
            <span>Keluar dari panel</span>
          </button>
          <div className="admin-sidebar__version">
            <span>DAFFA.SYS v2.4</span>
            <span>NODE / SECURE</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState(() => {
    const value = new URLSearchParams(window.location.search).get('tab');
    return Object.keys(TAB_META).includes(value) ? value : 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createRequest, setCreateRequest] = useState(null);
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    applyTheme({ mode: 'dark', accent: '#c8ff5e', accent2: '#5ce1c3', showGrid: true });
  }, []);

  useEffect(() => {
    if (!createRequest) return undefined;
    const timer = window.setTimeout(() => setCreateRequest(null), 450);
    return () => window.clearTimeout(timer);
  }, [createRequest]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const payload = await api.bootstrap();
      setData(payload);
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }
      setLoadError(error.message || 'Gagal memuat data panel.');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (tab === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    setSidebarOpen(false);
  }, [tab]);

  const navigate = (nextTab) => {
    setTab(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createNew = (type) => {
    navigate(type);
    setCreateRequest({ type, id: Date.now() });
  };

  const saveItem = async (collection, item) => {
    const isEdit = Boolean(item.id);
    try {
      const response = isEdit
        ? await api.update(collection, item.id, item)
        : await api.create(collection, item);
      setData((current) => {
        const list = current[collection] || [];
        const nextList = isEdit
          ? list.map((entry) => (entry.id === response.item.id ? response.item : entry))
          : [response.item, ...list];
        return { ...current, [collection]: nextList };
      });
      const labels = { works: 'Karya', apps: 'Aplikasi', certificates: 'Sertifikat' };
      show(`${labels[collection]} berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`);
      return response.item;
    } catch (error) {
      if (error.status === 401) logout();
      show(error.message || 'Gagal menyimpan data.', 'error');
      throw error;
    }
  };

  const deleteItem = async (collection, id) => {
    try {
      await api.remove(collection, id);
      setData((current) => ({
        ...current,
        [collection]: (current[collection] || []).filter((entry) => entry.id !== id),
      }));
      const labels = { works: 'Karya', apps: 'Aplikasi', certificates: 'Sertifikat' };
      show(`${labels[collection]} berhasil dihapus.`);
    } catch (error) {
      if (error.status === 401) logout();
      show(error.message || 'Gagal menghapus data.', 'error');
      throw error;
    }
  };

  const saveSettings = async (settings) => {
    try {
      const response = await api.updateSettings(settings);
      setData((current) => ({ ...current, settings: response.settings, updatedAt: response.updatedAt }));
      show('Pengaturan berhasil disimpan.');
      return response.settings;
    } catch (error) {
      if (error.status === 401) logout();
      show(error.message || 'Gagal menyimpan pengaturan.', 'error');
      throw error;
    }
  };

  const markMessage = async (id, read) => {
    try {
      const response = await api.markMessage(id, read);
      setData((current) => ({
        ...current,
        messages: current.messages.map((message) => (message.id === id ? response.message : message)),
      }));
    } catch (error) {
      show(error.message || 'Gagal memperbarui pesan.', 'error');
      throw error;
    }
  };

  const deleteMessage = async (id) => {
    try {
      await api.removeMessage(id);
      setData((current) => ({ ...current, messages: current.messages.filter((message) => message.id !== id) }));
      show('Pesan berhasil dihapus.');
    } catch (error) {
      show(error.message || 'Gagal menghapus pesan.', 'error');
      throw error;
    }
  };

  const updateAccount = async (payload) => {
    try {
      const response = await api.updateAccount(payload);
      setData((current) => ({ ...current, account: response.account }));
      setUser({ username: response.account.username, role: 'superadmin' });
      show('Akun berhasil diperbarui.');
    } catch (error) {
      if (error.status === 401) logout();
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
  };

  const currentMeta = TAB_META[tab] || TAB_META.overview;
  const unread = data?.messages?.filter((message) => !message.read).length || 0;

  let content = null;
  if (data) {
    if (tab === 'overview') {
      content = <Overview data={data} onNavigate={navigate} onNew={createNew} />;
    } else if (tab === 'identity') {
      content = <IdentityManager settings={data.settings} onSave={saveSettings} />;
    } else if (tab === 'appearance') {
      content = <AppearanceManager settings={data.settings} onSave={saveSettings} />;
    } else if (tab === 'works') {
      content = (
        <WorksManager
          items={data.works}
          onSave={saveItem}
          onDelete={deleteItem}
          createSignal={createRequest?.type === 'works' ? createRequest.id : null}
        />
      );
    } else if (tab === 'apps') {
      content = (
        <AppsManager
          items={data.apps}
          onSave={saveItem}
          onDelete={deleteItem}
          createSignal={createRequest?.type === 'apps' ? createRequest.id : null}
        />
      );
    } else if (tab === 'certificates') {
      content = (
        <CertificatesManager
          items={data.certificates}
          onSave={saveItem}
          onDelete={deleteItem}
          createSignal={createRequest?.type === 'certificates' ? createRequest.id : null}
        />
      );
    } else if (tab === 'messages') {
      content = <MessagesManager items={data.messages} onMarkRead={markMessage} onDelete={deleteMessage} />;
    } else if (tab === 'account') {
      content = <AccountManager account={data.account} onUpdateAccount={updateAccount} />;
    }
  }

  return (
    <div className="admin-shell">
      <Sidebar
        data={data}
        tab={tab}
        onNavigate={navigate}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button type="button" className="admin-topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">
              <Menu size={19} />
            </button>
            <div className="admin-breadcrumb">
              <span>Control Room</span>
              <ChevronRight size={12} />
              <strong>{currentMeta.label}</strong>
            </div>
          </div>

          <div className="admin-topbar__right">
            <span className="admin-topbar__live"><i /> LIVE</span>
            {unread ? <span className="admin-topbar__unread">{unread} pesan baru</span> : null}
            <a href="/" target="_blank" rel="noreferrer" className="admin-topbar__site">
              <ExternalLink size={14} />
              <span>Website</span>
            </a>
            <div className="admin-topbar__user">
              <span>{initials(user?.username || 'SA')}</span>
              <div>
                <strong>{user?.username || 'superadmin'}</strong>
                <small>SUPERADMIN</small>
              </div>
            </div>
            <button type="button" className="admin-icon-btn" onClick={handleLogout} aria-label="Keluar" title="Keluar">
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <main className="admin-content">
          {loading ? (
            <div className="admin-content__loading"><AdminLoading label="Menyiapkan control room..." /></div>
          ) : loadError ? (
            <div className="admin-content__error">
              <span><RefreshCw size={22} /></span>
              <h2>Gagal memuat data</h2>
              <p>{loadError}</p>
              <button type="button" className="admin-btn admin-btn--primary" onClick={load}>
                <RefreshCw size={15} /> Coba lagi
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <Toast toast={toast} onClose={dismiss} />
    </div>
  );
}

export default function AdminApp() {
  const { token, checking } = useAuth();

  if (checking) return <AdminBoot />;
  if (!token) return <Login />;
  return <Dashboard />;
}
