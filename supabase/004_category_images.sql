-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- Photo for each category tile on the home page (set in /admin → Categories).
create table if not exists public.category_images (
  slug text primary key,
  image text not null,
  updated_at timestamptz not null default now()
);

alter table public.category_images enable row level security;

drop policy if exists "category images: public read" on public.category_images;
create policy "category images: public read" on public.category_images
  for select using (true);

drop policy if exists "category images: admin writes" on public.category_images;
create policy "category images: admin writes" on public.category_images
  for all using (public.is_admin()) with check (public.is_admin());
