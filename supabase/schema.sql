-- Skema database DAFFA.SYS untuk PostgreSQL / Supabase.
-- Jalankan file ini di Supabase Dashboard -> SQL Editor,
-- atau cukup nyalakan server dengan DATABASE_URL terisi (skema dibuat otomatis).

create table if not exists app_meta (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_account (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists works (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists apps (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists certificates (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS: server memakai koneksi Postgres langsung (bypass RLS).
-- Kunci publishable hanya boleh membaca konten publik yang sudah dipublikasikan.
alter table app_meta enable row level security;
alter table admin_account enable row level security;
alter table site_settings enable row level security;
alter table works enable row level security;
alter table apps enable row level security;
alter table certificates enable row level security;
alter table messages enable row level security;

-- Izin dasar untuk Data API (publishable/anon key).
-- Tanpa grant ini, RLS policy saja tidak cukup dan REST akan menghasilkan 401.
grant usage on schema public to anon, authenticated;
grant select on site_settings, works, apps, certificates to anon, authenticated;
revoke all on app_meta, admin_account, messages from anon, authenticated;

drop policy if exists "public read site settings" on site_settings;
create policy "public read site settings"
  on site_settings for select
  using (true);

drop policy if exists "public read published works" on works;
create policy "public read published works"
  on works for select
  using (coalesce((data->>'published')::boolean, false));

drop policy if exists "public read published apps" on apps;
create policy "public read published apps"
  on apps for select
  using (coalesce((data->>'published')::boolean, false));

drop policy if exists "public read published certificates" on certificates;
create policy "public read published certificates"
  on certificates for select
  using (coalesce((data->>'published')::boolean, false));
