-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- Home page content managed in /admin → Home page:
--   moment = "Real Moments" customer photo + review
--   brand  = "Brands we carry" logo
--   social = photo in the "Join Doodlzz Family" grid
create table if not exists public.home_media (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('moment', 'brand', 'social')),
  image text not null,
  title text not null default '',     -- review line / brand name
  subtitle text not null default '',  -- customer name · product
  rating integer not null default 5 check (rating between 1 and 5),
  link text not null default '',      -- optional: Instagram post, brand page…
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.home_media enable row level security;

drop policy if exists "home media: public reads active" on public.home_media;
create policy "home media: public reads active" on public.home_media
  for select using (active or public.is_admin());

drop policy if exists "home media: admin writes" on public.home_media;
create policy "home media: admin writes" on public.home_media
  for all using (public.is_admin()) with check (public.is_admin());
