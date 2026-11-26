# DAFFA.SYS — Website Profil Sistem Informasi

Website profil pribadi bergaya *information system / control room*: menampilkan identitas, karya tulis, artikel, jurnal, sertifikat, dan aplikasi yang sudah dibuat. Semua konten dan tampilan dapat diatur sendiri lewat panel **superadmin**.

## Fitur

**Halaman publik**
- Hero dengan kartu profil 3D, foto, statistik, dan status ketersediaan.
- Seksi tentang, fokus keahlian, dan sorotan pengalaman.
- Karya & tulisan dengan filter tipe (Artikel / Jurnal / Karya Tulis), pencarian, penanda unggulan, dan pembaca Markdown.
- Galeri aplikasi dengan status (Live / Beta / Prototype / Archived), teknologi, tautan demo & repo.
- Sertifikat dengan modal detail, penerbit, kredensial, dan skill.
- Formulir kontak yang masuk ke kotak pesan admin.
- Mode terang/gelap, palet latar (midnight, graphite, navy, forest, mist, sand), warna aksen, grid background, dan logo kustom.
- Tipografi kustom: pilihan font isi, display, dan mono yang dimuat otomatis dari Google Fonts.
- Animasi halus: **GSAP ScrollTrigger**, **Motion**, dan **Lenis** smooth scroll.
- Responsif untuk desktop, tablet, dan ponsel.

**Panel superadmin (`/admin`)**
- Login aman (bcrypt + JWT 12 jam + pembatasan percobaan login).
- Ringkasan statistik konten dan pesan belum dibaca.
- Identitas & profil: nama, peran, headline, narasi, bio, kontak, fokus, sosial, statistik.
- Tampilan & branding: logo, foto profil, nama situs, warna aksen, palette latar, mode, grid, font isi/display/mono, catatan footer, teks kontak, plus pratinjau langsung.
- CRUD karya tulis, aplikasi, dan sertifikat (termasuk unggulan, status publikasi, cover/gambar).
- Kotak masuk pesan: tandai dibaca, balas lewat email, hapus.
- Akun superadmin: ubah username dan password.
- Upload gambar ke folder `uploads/` (maks. 6 MB, JPG/PNG/WEBP/GIF/AVIF).

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7 |
| Animasi | GSAP + ScrollTrigger, Motion, Lenis |
| Markdown | react-markdown + remark-gfm |
| Backend | Express 5, Multer, JWT, bcryptjs |
| Penyimpanan | PostgreSQL / Supabase, atau JSON lokal untuk pengembangan |

## Menjalankan

Prasyarat: **Node.js 20+** dan npm.

```powershell
# 1. Install dependency
npm install

# 2. Siapkan konfigurasi
Copy-Item .env.example .env
# Opsional: isi DATABASE_URL untuk memakai PostgreSQL/Supabase

# 3. Mode pengembangan (Vite 5173 + API 4000)
npm run dev
```

- Website publik: <http://localhost:5173>
- Panel admin: <http://localhost:5173/admin>
- API: <http://localhost:4000>

### Mode produksi

```powershell
npm run build
npm start
```

Setelah build, seluruh website dan API disajikan oleh Express di <http://localhost:4000> (admin: `/admin`). Jalankan ulang `npm run build` setiap kali kode diubah.

## Akun superadmin

Kredensial awal:

| | |
| --- | --- |
| Username | `superadmin` |
| Password | `daffa2026` |

> **Penting:** kredensial dari `.env` hanya dipakai saat `data/database.json` **pertama kali dibuat**. Jika database sudah ada, mengubah `.env` tidak mengubah akun. Ubah lewat menu **Akun superadmin** di panel, atau jalankan:

```powershell
npm run reset:admin -- superadmin passwordBaruMinimal8
```

## Mengelola konten

1. Buka `/admin` lalu masuk.
2. **Identitas & profil** — nama, peran, headline, tagline, bio, kontak, fokus, sosial, dan statistik.
3. **Tampilan & branding** — unggah logo/foto, pilih aksen, palet latar, mode, dan font isi/display/mono, atur grid, nama situs, catatan footer. Pratinjau langsung memperlihatkan kombinasi warna dan tipografi. Klik **Simpan** untuk menerapkan.
4. **Karya & tulisan** — tambah artikel/jurnal/karya tulis, isi konten Markdown, tag, cover, dan tautan. Gunakan ikon bintang untuk unggulan dan toggle untuk publikasi.
5. **Aplikasi** — data aplikasi, teknologi, status, tautan demo/repo, dan gambar.
6. **Sertifikat** — penerbit, tanggal, ID kredensial, skill, dan gambar.
7. **Kotak masuk** — pesan dari formulir kontak; tandai dibaca atau hapus.
8. **Akun superadmin** — ganti username/password.

Semua teks contoh (identitas, karya, sertifikat, aplikasi) adalah placeholder dan bisa diganti/dihapus dari panel.

## Database: Supabase / PostgreSQL

Aplikasi mendukung dua mode penyimpanan:

- **PostgreSQL / Supabase** — dipakai jika `DATABASE_URL` di `.env` terisi.
- **JSON lokal** — fallback otomatis ke `data/database.json` jika `DATABASE_URL` kosong.

### Menyiapkan Supabase

1. Buka project Supabase, lalu **Project Settings → Database → Connection string**.
2. Pilih **Session pooler**, salin URI-nya (port `5432`).
3. Isi `.env`:

   ```env
   DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
   ```

   Jika password mengandung karakter khusus (`@`, `#`, `:`), URL-encode terlebih dahulu.
4. Jalankan:

   ```powershell
   npm run db:init
   ```

   Perintah ini membuat tabel, mengaktifkan RLS, dan mengisi data awal. Jika `data/database.json` sudah ada, isinya dipindahkan otomatis pada inisialisasi pertama; jika tidak, dipakai konten contoh. Skema juga otomatis dibuat saat `npm start`.

Alternatif: buka **SQL Editor** di Supabase dan tempel isi `supabase/schema.sql`, lalu jalankan server.

> **Publishable key** (`sb_publishable_...`) hanya untuk akses baca dari client. Membuat tabel (DDL) memerlukan connection string database atau Supabase access token.

Tabel yang dibuat: `app_meta`, `admin_account`, `site_settings`, `works`, `apps`, `certificates`, `messages`. RLS hanya mengizinkan pembacaan publik untuk konten yang sudah dipublikasikan; data akun dan pesan tetap tertutup.
## Struktur proyek

```
.
├─ server/
│  ├─ index.js          # API Express, auth, upload, serve frontend produksi
│  ├─ db.js             # PostgreSQL/JSON, seed, baca/tulis data
│  ├─ init-db.js        # buat skema dan isi data awal
│  └─ reset-admin.js    # reset username/password superadmin
├─ src/
│  ├─ components/
│  │  ├─ public/        # halaman publik (hero, karya, aplikasi, sertifikat, kontak)
│  │  └─ admin/         # login & dashboard superadmin
│  ├─ lib/              # API client, animasi, util
│  └─ styles/           # public.css, admin.css, base.css
├─ supabase/schema.sql  # skema PostgreSQL + kebijakan RLS
├─ data/database.json   # fallback JSON (dibuat otomatis, jangan di-commit)
├─ public/              # aset statis
├─ uploads/             # hasil upload gambar (jangan di-commit)
├─ .env                 # konfigurasi lokal (jangan di-commit)
└─ .env.example         # contoh konfigurasi
```

## Konfigurasi `.env`

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `4000` | Port server Express |
| `HOST` | `0.0.0.0` | Alamat bind server |
| `ADMIN_USERNAME` | `superadmin` | Username saat seed pertama |
| `ADMIN_PASSWORD` | `daffa2026` | Password saat seed pertama |
| `JWT_SECRET` | acak dari database | Kunci tanda tangan sesi; isi nilai acak di produksi |
| `DATABASE_URL` | kosong | Connection string PostgreSQL/Supabase; kosong = JSON lokal |
| `SUPABASE_URL` | — | URL project Supabase (untuk referensi/client) |
| `SUPABASE_PUBLISHABLE_KEY` | — | Publishable key untuk akses baca dari client |
| `PG_POOL_MAX` | `5` | Jumlah maksimum koneksi PostgreSQL |

Membuat nilai acak:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Data, upload, dan backup

- Mode Supabase: konten tersimpan di tabel PostgreSQL; mode lokal: `data/database.json`.
- Gambar tetap disimpan di folder `uploads/` (maks. 6 MB per file).
- Backup Supabase: gunakan **Database → Backups** atau `pg_dump` dengan `DATABASE_URL`.
- Backup mode lokal: salin `data/database.json` dan `uploads/`.
- Menghapus seluruh data di database akan memicu seed ulang saat server dijalankan. **Konten lama akan hilang.**
- Untuk hosting serverless (Vercel/Netlify), pindahkan gambar ke Supabase Storage karena filesystem bersifat sementara.

## Catatan produksi

- Jalankan di balik reverse proxy (Nginx/Caddy) dengan HTTPS.
- Ganti `JWT_SECRET` dan password superadmin sebelum online.
- Gunakan **Session pooler** Supabase untuk koneksi `pg` dari server.
- Aktifkan backup berkala untuk database dan `uploads/`.
- Ukuran upload maksimal 6 MB per gambar.
- Login dibatasi 8 percobaan per 10 menit per IP; formulir kontak 8 pesan per 10 menit per IP.


