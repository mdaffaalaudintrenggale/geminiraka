import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT, 'data');
export const UPLOAD_DIR = path.join(ROOT, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const SCHEMA_FILE = path.join(ROOT, 'supabase', 'schema.sql');
const DATABASE_URL = process.env.DATABASE_URL || '';

export const usingPostgres = Boolean(DATABASE_URL);

let pool = null;
let cache = null;
let saveQueue = Promise.resolve();

const iso = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function defaultSettings() {
  return {
    siteName: 'DAFFA.SYS',
    logo: '',
    photo: '',
    name: 'Daffa',
    fullName: 'Daffa Pratama',
    role: 'Information Systems Student',
    heroLabel: 'Personal Information System',
    headline: 'Membangun sistem digital yang rapi, cepat, dan terasa manusiawi.',
    tagline:
      'Saya bergerak di persimpangan desain, data, dan pengembangan web — merancang sistem informasi yang tidak hanya berjalan, tetapi juga nyaman digunakan.',
    bio:
      'Saya adalah mahasiswa Sistem Informasi yang percaya bahwa teknologi terbaik lahir dari pemahaman terhadap manusia. Fokus saya adalah membangun produk digital yang terstruktur, aksesibel, dan punya detail yang terasa. Selain menulis kode, saya aktif menuangkan gagasan lewat artikel, jurnal, dan karya tulis.',
    location: 'Jakarta, Indonesia',
    email: 'hello@daffa.dev',
    phone: '+62 812 3456 7890',
    university: 'S1 Sistem Informasi',
    availability: 'Terbuka untuk kolaborasi',
    focus: ['Web Development', 'UI Engineering', 'Sistem Informasi', 'Data Visualization'],
    socials: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://linkedin.com/' },
      { label: 'Instagram', url: 'https://instagram.com/' },
    ],
    stats: [
      { label: 'Proyek Selesai', value: '12+' },
      { label: 'Karya Tulis', value: '08' },
      { label: 'Sertifikasi', value: '06' },
      { label: 'Tahun Belajar', value: '03' },
    ],
    accent: '#c8ff5e',
    accent2: '#5ce1c3',
    mode: 'dark',
    showGrid: true,
    footerNote: 'Dirancang & dikembangkan dengan presisi.',
    contactHeadline: 'Punya ide atau peluang? Mari bicarakan.',
    contactText:
      'Saya terbuka untuk kolaborasi proyek, magang, riset, atau sekadar berdiskusi tentang sistem informasi dan desain antarmuka.',
  };
}

function seedDB() {
  const now = iso();
  const database = {
    meta: {
      createdAt: now,
      updatedAt: now,
      jwtSecret: crypto.randomBytes(48).toString('hex'),
    },
    account: {
      id: id(),
      username: process.env.ADMIN_USERNAME || 'superadmin',
      passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'daffa2026', 12),
      updatedAt: now,
    },
    settings: defaultSettings(),
    works: [
      {
        id: id(),
        title: 'Perancangan Sistem Informasi Arsip Digital Berbasis Web',
        type: 'Jurnal',
        category: 'Sistem Informasi',
        year: '2025',
        excerpt:
          'Studi perancangan arsip digital untuk organisasi kecil dengan pendekatan terstruktur: dari pemetaan proses bisnis hingga evaluasi kegunaan.',
        content: `## Latar Belakang

Pengelolaan arsip manual masih menjadi masalah umum pada organisasi kecil. Dokumen mudah tercecer, proses pencarian memakan waktu, dan tidak ada jejak versi yang jelas. Penelitian ini merancang sistem arsip digital berbasis web sebagai jawaban atas masalah tersebut.

## Metodologi

Perancangan menggunakan pendekatan **waterfall yang disederhanakan**:

1. Observasi proses bisnis dan wawancara pengguna.
2. Pemodelan kebutuhan dengan use case dan ERD.
3. Perancangan antarmuka berbasis prinsip *recognition over recall*.
4. Implementasi dan pengujian kegunaan dengan lima responden.

## Hasil

Sistem berhasil memangkas waktu pencarian dokumen dari rata-rata **4 menit menjadi 18 detik**. Seluruh responden menilai navigation dan struktur kategori mudah dipahami.

> Sistem informasi yang baik bukan sekadar memindahkan formulir kertas ke layar, tetapi menyusun ulang alur kerja agar lebih masuk akal.

## Kesimpulan

Arsip digital yang dirancang dengan pemahaman proses bisnis memberikan dampak yang jauh lebih besar dibanding sekadar digitalisasi.`,
        tags: ['Laravel', 'MySQL', 'System Design'],
        link: '',
        cover: '',
        featured: true,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'Mengapa Antarmuka yang Baik adalah Bagian dari Sistem Informasi',
        type: 'Artikel',
        category: 'UI/UX',
        year: '2025',
        excerpt:
          'Sistem yang akurat belum tentu berguna jika sulit dipahami. Tulisan ini membahas hubungan antara kegunaan, kepercayaan, dan kualitas antarmuka.',
        content: `## Antarmuka adalah titik temu

Dalam sistem informasi, antarmuka adalah satu-satunya bagian yang benar-benar dirasakan pengguna. Basis data yang rapi dan logika yang benar tidak akan terlihat jika pengguna tidak mampu menyelesaikan tugasnya.

## Tiga lapisan kegunaan

- **Efektivitas** — pengguna bisa menyelesaikan tujuan.
- **Efisiensi** — pengguna tidak membuang waktu berlebihan.
- **Kepuasan** — pengguna merasa percaya dan nyaman.

Ketiganya saling terkait. Tombol yang terlalu kecil, istilah teknis yang tidak konsisten, atau alur yang berputar-putar dapat menghancurkan kepercayaan terhadap keseluruhan sistem.

## Kesimpulan

Desain antarmuka bukan sentuhan terakhir. Ia adalah bagian dari arsitektur informasi itu sendiri.`,
        tags: ['UI/UX', 'Usability', 'Design Thinking'],
        link: '',
        cover: '',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'Optimasi Pengalaman Pengguna pada Dashboard Akademik',
        type: 'Karya Tulis',
        category: 'Human Computer Interaction',
        year: '2024',
        excerpt:
          'Evaluasi heuristik dan redesain dashboard akademik untuk mengurangi beban kognitif mahasiswa saat mengakses informasi perkuliahan.',
        content: `## Ringkasan

Dashboard akademik sering menampilkan terlalu banyak informasi sekaligus. Evaluasi ini menggunakan sepuluh heuristik Nielsen untuk menemukan titik gesek utama pada sebuah portal akademik kampus.

## Temuan utama

1. Hierarki visual lemah — semua informasi memiliki bobot yang hampir sama.
2. Tidak ada status sistem yang jelas saat data sedang dimuat.
3. Navigasi istilah tidak konsisten antara halaman.
4. Informasi penting seperti jadwal terdekat tenggelam di antara menu sekunder.

## Rekomendasi

Redesain diarahkan pada **progressive disclosure** dan pengelompokan berbasis tugas. Kartu ringkasan ditempatkan di area pertama, sementara fitur administratif dipindahkan ke tingkat kedua.`,
        tags: ['HCI', 'Heuristic Evaluation', 'Dashboard'],
        link: '',
        cover: '',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'Membangun Design System Kecil yang Bertahan Lama',
        type: 'Artikel',
        category: 'Front-End',
        year: '2024',
        excerpt:
          'Design system tidak harus besar. Yang penting adalah konsistensi, dokumentasi, dan kesediaan untuk terus merawatnya.',
        content: `## Mulai dari yang sering dipakai

Design system yang terlalu ambisius sering berhenti di tengah jalan. Mulailah dari komponen yang benar-benar dipakai berulang: tombol, input, kartu, dan tipografi.

## Token sebelum komponen

Gunakan variabel warna, spacing, radius, dan shadow sejak awal. Token membuat perubahan tema menjadi mudah dan menjaga konsistensi antar halaman.

## Dokumentasi ringan

Satu halaman berisi contoh komponen, aturan penggunaan, dan hal yang harus dihindari sudah cukup untuk memulai. Perawatan lebih penting daripada kelengkapan.`,
        tags: ['Design System', 'CSS', 'React'],
        link: '',
        cover: '',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    apps: [
      {
        id: id(),
        title: 'SIPADU',
        description:
          'Sistem informasi pelayanan administrasi desa untuk pengajuan surat, pelacakan status, dan pengarsipan dokumen warga.',
        category: 'Sistem Informasi',
        tech: ['React', 'Express', 'MySQL'],
        link: '',
        repo: '',
        image: '',
        status: 'Live',
        year: '2025',
        featured: true,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'RuangBaca',
        description:
          'Katalog perpustakaan digital dengan pencarian cepat, manajemen koleksi, dan rekomendasi bacaan sederhana.',
        category: 'Web App',
        tech: ['Laravel', 'MySQL', 'Tailwind'],
        link: '',
        repo: '',
        image: '',
        status: 'Live',
        year: '2025',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'NilaiKu',
        description:
          'Dashboard akademik untuk memantau nilai, IPK, dan target studi dengan visualisasi data yang mudah dibaca.',
        category: 'Dashboard',
        tech: ['React', 'Chart.js', 'Supabase'],
        link: '',
        repo: '',
        image: '',
        status: 'Beta',
        year: '2024',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'PresensiQR',
        description:
          'Prototipe presensi berbasis QR untuk kelas kecil, dilengkapi rekap kehadiran dan ekspor data.',
        category: 'Prototype',
        tech: ['Next.js', 'Prisma', 'PostgreSQL'],
        link: '',
        repo: '',
        image: '',
        status: 'Prototype',
        year: '2024',
        featured: false,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    certificates: [
      {
        id: id(),
        title: 'Front-End Web Development',
        issuer: 'Dicoding Academy',
        date: '2025',
        credentialId: 'DCD-FE-2025-001',
        link: '',
        image: '',
        skills: ['React', 'Responsive Design', 'Web Fundamentals'],
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'Junior Web Developer',
        issuer: 'BNSP',
        date: '2024',
        credentialId: 'BNSP-JWD-2024-118',
        link: '',
        image: '',
        skills: ['Web Development', 'Software Testing'],
        published: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: id(),
        title: 'Data Analytics Fundamentals',
        issuer: 'Coursera',
        date: '2024',
        credentialId: 'CRS-DA-2024-882',
        link: '',
        image: '',
        skills: ['Data Analysis', 'Visualization', 'SQL'],
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    messages: [],
  };

  return database;
}

function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: /supabase|sslmode=require/i.test(DATABASE_URL) ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.PG_POOL_MAX) || 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });
    pool.on('error', (error) => {
      console.error('[db] Koneksi PostgreSQL bermasalah:', error.message);
    });
  }
  return pool;
}

async function withClient(callback) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

async function writeSnapshot(client, data) {
  const saveRow = (table, value) =>
    client.query(
      `insert into ${table} (id, data, updated_at) values (1, $1, now())
       on conflict (id) do update set data = excluded.data, updated_at = now()`,
      [JSON.stringify(value)],
    );

  await saveRow('app_meta', data.meta);
  await saveRow('admin_account', data.account);
  await saveRow('site_settings', data.settings);

  const collections = [
    ['works', data.works],
    ['apps', data.apps],
    ['certificates', data.certificates],
    ['messages', data.messages],
  ];

  for (const [table, items] of collections) {
    await client.query(`delete from ${table}`);
    for (const item of items) {
      await client.query(`insert into ${table} (id, data) values ($1, $2)`, [
        item.id,
        JSON.stringify(item),
      ]);
    }
  }
}

async function readPostgres() {
  return withClient(async (client) => {
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    await client.query('begin');
    try {
      await client.query(schema);
      const meta = await client.query('select data from app_meta where id = 1');
      if (!meta.rowCount) {
        const seeded = loadLocalSnapshot() || seedDB();
        await writeSnapshot(client, seeded);
        await client.query('commit');
        return seeded;
      }

      const [account, settings, works, apps, certificates, messages] = await Promise.all([
        client.query('select data from admin_account where id = 1'),
        client.query('select data from site_settings where id = 1'),
        client.query('select data from works'),
        client.query('select data from apps'),
        client.query('select data from certificates'),
        client.query('select data from messages'),
      ]);

      const fallback = seedDB();
      await client.query('commit');
      return {
        meta: meta.rows[0].data,
        account: account.rows[0]?.data || fallback.account,
        settings: settings.rows[0]?.data || fallback.settings,
        works: works.rows.map((row) => row.data),
        apps: apps.rows.map((row) => row.data),
        certificates: certificates.rows.map((row) => row.data),
        messages: messages.rows.map((row) => row.data),
      };
    } catch (error) {
      await client.query('rollback').catch(() => {});
      throw error;
    }
  });
}

function ensureJsonStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function loadLocalSnapshot() {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!parsed?.meta || !parsed?.account || !parsed?.settings || !Array.isArray(parsed.works)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistJson(data) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

export async function initDB() {
  if (cache) return cache;
  if (usingPostgres) {
    cache = await readPostgres();
  } else {
    ensureJsonStore();
    if (!fs.existsSync(DB_FILE)) {
      cache = seedDB();
      persistJson(cache);
    } else {
      cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  }
  return cache;
}

export function getDB() {
  if (!cache) {
    throw new Error('Database belum diinisialisasi. Panggil initDB() terlebih dahulu.');
  }
  return cache;
}

export function saveDB() {
  const data = getDB();
  data.meta.updatedAt = iso();

  if (!usingPostgres) {
    persistJson(data);
    return Promise.resolve();
  }

  const snapshot = structuredClone(data);
  const run = saveQueue.then(() =>
    withClient(async (client) => {
      await client.query('begin');
      try {
        await writeSnapshot(client, snapshot);
        await client.query('commit');
      } catch (error) {
        await client.query('rollback').catch(() => {});
        throw error;
      }
    }),
  );
  saveQueue = run.catch(() => {});
  return run;
}

export async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export function touch(data) {
  data.createdAt = iso();
  data.updatedAt = iso();
  return data;
}

export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export { defaultSettings };
