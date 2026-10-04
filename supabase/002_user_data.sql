-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- Saved cart & favorites for signed-in customers (one row per account).
create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  cart jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "user_data: own row" on public.user_data;
create policy "user_data: own row" on public.user_data
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
