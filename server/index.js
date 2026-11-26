import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import {
  ROOT,
  UPLOAD_DIR,
  getDB,
  saveDB,
  initDB,
  closeDB,
  usingPostgres,
  slugify,
} from './db.js';
import { scheduleGithubSync, githubSyncStatus } from './github-sync.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function commitChanges() {
  await saveDB();
  scheduleGithubSync(getDB());
}

try {
  await initDB();
} catch (error) {
  console.error('\n[db] Gagal menyiapkan database:', error.message);
  console.error('     Periksa DATABASE_URL / schema.sql lalu coba lagi.\n');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function str(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function bool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function stringArray(value, maxItems = 20, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => str(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function safeUrl(value, max = 500) {
  const url = str(value, max);
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
  return '';
}

function safeAsset(value) {
  return safeUrl(value, 500);
}

function sanitizeSocials(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      label: str(item?.label, 40),
      url: safeUrl(item?.url, 300),
    }))
    .filter((item) => item.label && item.url)
    .slice(0, 8);
}

function sanitizeStats(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      label: str(item?.label, 50),
      value: str(item?.value, 12),
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 6);
}

const SETTING_STRINGS = {
  siteName: 60,
  logo: 500,
  photo: 500,
  name: 80,
  fullName: 120,
  role: 120,
  heroLabel: 80,
  headline: 260,
  tagline: 500,
  bio: 4000,
  location: 120,
  email: 160,
  phone: 50,
  university: 140,
  availability: 90,
  footerNote: 240,
  contactHeadline: 200,
  contactText: 1000,
};

const FONT_CHOICES = {
  fontBody: [
    'space-grotesk',
    'inter',
    'plus-jakarta',
    'manrope',
    'sora',
    'dm-sans',
    'ibm-plex-sans',
    'system-sans',
  ],
  fontDisplay: [
    'instrument-serif',
    'playfair',
    'fraunces',
    'cormorant',
    'dm-serif',
    'lora',
    'georgia',
  ],
  fontMono: ['jetbrains-mono', 'ibm-plex-mono', 'space-mono', 'fira-code', 'system-mono'],
};

const TONE_CHOICES = {
  dark: ['default', 'graphite', 'navy', 'forest'],
  light: ['default', 'mist', 'sand'],
};

function cleanSettings(input = {}, base = {}) {
  const next = { ...base };
  for (const [key, max] of Object.entries(SETTING_STRINGS)) {
    next[key] = str(input[key] ?? base[key], max);
  }
  if (!next.siteName) next.siteName = 'DAFFA.SYS';
  if (!next.name) next.name = 'Daffa';
  if (!next.fullName) next.fullName = next.name;
  next.logo = safeAsset(input.logo ?? base.logo);
  next.photo = safeAsset(input.photo ?? base.photo);
  next.focus = stringArray(input.focus ?? base.focus, 12, 60);
  next.socials = sanitizeSocials(input.socials ?? base.socials);
  next.stats = sanitizeStats(input.stats ?? base.stats);
  const accent = str(input.accent ?? base.accent, 7);
  const accent2 = str(input.accent2 ?? base.accent2, 7);
  next.accent = /^#[0-9a-f]{6}$/i.test(accent) ? accent : base.accent || '#c8ff5e';
  next.accent2 = /^#[0-9a-f]{6}$/i.test(accent2) ? accent2 : base.accent2 || '#5ce1c3';
  next.mode = ['dark', 'light'].includes(input.mode) ? input.mode : base.mode || 'dark';
  for (const [key, allowed] of Object.entries(FONT_CHOICES)) {
    const value = str(input[key] ?? base[key], 40);
    next[key] = allowed.includes(value) ? value : base[key] || allowed[0];
  }
  const tone = str(input.tone ?? base.tone, 24);
  next.tone = TONE_CHOICES[next.mode].includes(tone) ? tone : 'default';
  next.showGrid = bool(input.showGrid, base.showGrid ?? true);
  return next;
}

const WORK_TYPES = ['Artikel', 'Jurnal', 'Karya Tulis'];
const APP_STATUSES = ['Live', 'Beta', 'Prototype', 'Archived'];

function cleanWork(input = {}, base = {}) {
  const title = str(input.title ?? base.title, 180);
  if (!title) throw httpError(400, 'Judul karya wajib diisi.');
  return {
    ...base,
    title,
    type: WORK_TYPES.includes(input.type) ? input.type : base.type || 'Artikel',
    category: str(input.category ?? base.category, 90),
    year: str(input.year ?? base.year, 20),
    excerpt: str(input.excerpt ?? base.excerpt, 500),
    content: str(input.content ?? base.content, 60000),
    tags: stringArray(input.tags ?? base.tags, 12, 40),
    link: safeUrl(input.link ?? base.link),
    cover: safeAsset(input.cover ?? base.cover),
    featured: bool(input.featured, base.featured ?? false),
    published: bool(input.published, base.published ?? true),
    slug: slugify(title) || base.slug || `karya-${Date.now()}`,
  };
}

function cleanApp(input = {}, base = {}) {
  const title = str(input.title ?? base.title, 120);
  if (!title) throw httpError(400, 'Nama aplikasi wajib diisi.');
  return {
    ...base,
    title,
    description: str(input.description ?? base.description, 1200),
    category: str(input.category ?? base.category, 90),
    tech: stringArray(input.tech ?? base.tech, 12, 40),
    link: safeUrl(input.link ?? base.link),
    repo: safeUrl(input.repo ?? base.repo),
    image: safeAsset(input.image ?? base.image),
    status: APP_STATUSES.includes(input.status) ? input.status : base.status || 'Live',
    year: str(input.year ?? base.year, 20),
    featured: bool(input.featured, base.featured ?? false),
    published: bool(input.published, base.published ?? true),
    slug: slugify(title) || base.slug || `aplikasi-${Date.now()}`,
  };
}

function cleanCertificate(input = {}, base = {}) {
  const title = str(input.title ?? base.title, 180);
  if (!title) throw httpError(400, 'Nama sertifikat wajib diisi.');
  return {
    ...base,
    title,
    issuer: str(input.issuer ?? base.issuer, 120),
    date: str(input.date ?? base.date, 30),
    credentialId: str(input.credentialId ?? base.credentialId, 80),
    link: safeUrl(input.link ?? base.link),
    image: safeAsset(input.image ?? base.image),
    skills: stringArray(input.skills ?? base.skills, 12, 50),
    published: bool(input.published, base.published ?? true),
  };
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
    const year = String(b.year || b.date || '').localeCompare(String(a.year || a.date || ''));
    if (year) return year;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

function jwtSecret() {
  return process.env.JWT_SECRET || getDB().meta.jwtSecret;
}

function createToken(account) {
  return jwt.sign(
    { sub: account.id, username: account.username, role: 'superadmin' },
    jwtSecret(),
    { expiresIn: '12h', issuer: 'daffa-profile' },
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan masuk kembali.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), jwtSecret(), { issuer: 'daffa-profile' });
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesi sudah berakhir. Silakan masuk kembali.' });
  }
}

const loginAttempts = new Map();
const contactAttempts = new Map();

function limited(map, key, max, windowMs) {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now - entry.first > windowMs) {
    map.set(key, { first: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

// ---------- Public API ----------

app.get('/api/health', (req, res) => {
  const db = getDB();
  res.json({
    ok: true,
    updatedAt: db.meta.updatedAt,
    service: 'daffa-profile-system',
    database: usingPostgres ? 'postgres' : 'json',
  });
});

app.get('/api/public', (req, res) => {
  const db = getDB();
  res.json({
    settings: db.settings,
    works: sortItems(db.works.filter((item) => item.published)),
    apps: sortItems(db.apps.filter((item) => item.published)),
    certificates: sortItems(db.certificates.filter((item) => item.published)),
    updatedAt: db.meta.updatedAt,
  });
});

app.post('/api/contact', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (limited(contactAttempts, ip, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Terlalu banyak pesan. Coba lagi beberapa saat lagi.' });
  }
  const name = str(req.body?.name, 100);
  const email = str(req.body?.email, 160);
  const subject = str(req.body?.subject, 160);
  const message = str(req.body?.message, 4000);
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nama, email, dan pesan wajib diisi.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid.' });
  }
  const db = getDB();
  const now = new Date().toISOString();
  db.messages.push({
    id: crypto.randomUUID(),
    name,
    email,
    subject: subject || 'Tanpa subjek',
    message,
    read: false,
    createdAt: now,
  });
  await commitChanges();
  res.status(201).json({ ok: true, message: 'Pesan berhasil dikirim.' });
});

// ---------- Auth ----------

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (limited(loginAttempts, ip, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 10 menit.' });
  }
  const username = str(req.body?.username, 80);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const db = getDB();
  if (username !== db.account.username || !bcrypt.compareSync(password, db.account.passwordHash)) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }
  loginAttempts.delete(ip);
  res.json({
    token: createToken(db.account),
    user: { username: db.account.username, role: 'superadmin' },
  });
});

app.get('/api/auth/me', auth, (req, res) => {
  const db = getDB();
  res.json({ user: { username: db.account.username, role: 'superadmin' } });
});

// ---------- Admin ----------

app.get('/api/admin/bootstrap', auth, (req, res) => {
  const db = getDB();
  res.json({
    settings: db.settings,
    works: sortItems(db.works),
    apps: sortItems(db.apps),
    certificates: sortItems(db.certificates),
    messages: [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    account: { username: db.account.username, updatedAt: db.account.updatedAt },
    updatedAt: db.meta.updatedAt,
  });
});

app.get('/api/admin/github-sync', auth, (req, res) => {
  res.json(githubSyncStatus());
});

app.put('/api/admin/settings', auth, async (req, res) => {
  const db = getDB();
  db.settings = cleanSettings(req.body, db.settings);
  await commitChanges();
  res.json({ ok: true, settings: db.settings, updatedAt: db.meta.updatedAt });
});

function registerCollection(route, collection, sanitizer) {
  app.get(`/api/admin/${route}`, auth, (req, res) => {
    res.json({ items: sortItems(getDB()[collection]) });
  });

  app.post(`/api/admin/${route}`, auth, async (req, res) => {
    const db = getDB();
    const now = new Date().toISOString();
    const item = {
      ...sanitizer(req.body, {}),
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    db[collection].push(item);
    await commitChanges();
    res.status(201).json({ ok: true, item });
  });

  app.put(`/api/admin/${route}/:id`, auth, async (req, res) => {
    const db = getDB();
    const index = db[collection].findIndex((entry) => entry.id === req.params.id);
    if (index === -1) throw httpError(404, 'Data tidak ditemukan.');
    const base = db[collection][index];
    const item = {
      ...sanitizer(req.body, base),
      id: base.id,
      createdAt: base.createdAt,
      updatedAt: new Date().toISOString(),
    };
    db[collection][index] = item;
    await commitChanges();
    res.json({ ok: true, item });
  });

  app.delete(`/api/admin/${route}/:id`, auth, async (req, res) => {
    const db = getDB();
    const index = db[collection].findIndex((entry) => entry.id === req.params.id);
    if (index === -1) throw httpError(404, 'Data tidak ditemukan.');
    const [removed] = db[collection].splice(index, 1);
    await commitChanges();
    res.json({ ok: true, removed: removed.id });
  });
}

registerCollection('works', 'works', cleanWork);
registerCollection('apps', 'apps', cleanApp);
registerCollection('certificates', 'certificates', cleanCertificate);

app.patch('/api/admin/messages/:id', auth, async (req, res) => {
  const db = getDB();
  const message = db.messages.find((item) => item.id === req.params.id);
  if (!message) throw httpError(404, 'Pesan tidak ditemukan.');
  message.read = bool(req.body?.read, true);
  await commitChanges();
  res.json({ ok: true, message });
});

app.delete('/api/admin/messages/:id', auth, async (req, res) => {
  const db = getDB();
  const index = db.messages.findIndex((item) => item.id === req.params.id);
  if (index === -1) throw httpError(404, 'Pesan tidak ditemukan.');
  db.messages.splice(index, 1);
  await commitChanges();
  res.json({ ok: true });
});

app.put('/api/admin/account', auth, async (req, res) => {
  const db = getDB();
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  if (!bcrypt.compareSync(currentPassword, db.account.passwordHash)) {
    throw httpError(400, 'Password saat ini tidak sesuai.');
  }
  const username = str(req.body?.username, 60);
  if (username) {
    if (!/^[a-zA-Z0-9_.-]{3,60}$/.test(username)) {
      throw httpError(400, 'Username minimal 3 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.');
    }
    db.account.username = username;
  }
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (newPassword) {
    if (newPassword.length < 8) throw httpError(400, 'Password baru minimal 8 karakter.');
    db.account.passwordHash = bcrypt.hashSync(newPassword, 12);
  }
  db.account.updatedAt = new Date().toISOString();
  await commitChanges();
  res.json({ ok: true, account: { username: db.account.username, updatedAt: db.account.updatedAt } });
});

// ---------- Uploads ----------

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, UPLOAD_DIR),
  filename: (req, file, callback) => {
    const ext = MIME_EXT[file.mimetype] || '.bin';
    callback(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!MIME_EXT[file.mimetype]) {
      return callback(httpError(400, 'Format gambar harus JPG, PNG, WEBP, GIF, atau AVIF.'));
    }
    return callback(null, true);
  },
});

app.post('/api/admin/upload', auth, (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) return next(error);
    if (!req.file) return res.status(400).json({ error: 'File gambar tidak ditemukan.' });
    return res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));

// ---------- Frontend ----------

const distDir = path.join(ROOT, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1h', index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.type('text/plain').send('Daffa Profile API is running. Start the Vite client with "npm run dev".');
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 6 MB.' : 'Upload gambar gagal.';
    return res.status(400).json({ error: message });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({ error: error.message || 'Terjadi kesalahan pada server.' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`\n  Daffa Profile System`);
  console.log(`  Database    →  ${usingPostgres ? 'PostgreSQL / Supabase' : 'JSON lokal (data/database.json)'}`);
  console.log(`  API & site  →  http://localhost:${PORT}`);
  console.log(`  Admin       →  http://localhost:${PORT}/admin\n`);
  scheduleGithubSync(getDB());
});

async function shutdown() {
  await closeDB().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
