export function initials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'DS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function contrastInk(hex) {
  const fallback = '#0a1006';
  if (!/^#([0-9a-f]{6})$/i.test(hex || '')) return fallback;
  const value = hex.slice(1);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  return luminance > 0.42 ? '#0a1006' : '#f7fff0';
}

export function applyTheme(settings = {}) {
  const root = document.documentElement;
  const accent = /^#[0-9a-f]{6}$/i.test(settings.accent || '') ? settings.accent : '#c8ff5e';
  const accent2 = /^#[0-9a-f]{6}$/i.test(settings.accent2 || '') ? settings.accent2 : '#5ce1c3';
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-2', accent2);
  root.style.setProperty('--accent-ink', contrastInk(accent));
  root.style.setProperty('--accent-2-ink', contrastInk(accent2));
  root.dataset.theme = settings.mode === 'light' ? 'light' : 'dark';
  root.dataset.grid = settings.showGrid === false ? 'off' : 'on';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', settings.mode === 'light' ? '#f2efe7' : '#06080a');
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateLong(value) {
  return formatDate(value, { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function splitName(fullName = '', fallback = 'Daffa') {
  const parts = String(fullName || fallback).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: fallback, rest: '' };
  return { first: parts[0], rest: parts.slice(1).join(' ') };
}

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

export function getYouTubeEmbed(url = '') {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

export function isSafeExternal(url = '') {
  return /^https?:\/\//i.test(url);
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
