-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- "Limited quantity" / "Last piece" labels, and related items ("Goes well with") per product.
alter table public.products add column if not exists limited_quantity boolean not null default false;
alter table public.products add column if not exists last_piece boolean not null default false;
alter table public.products add column if not exists related uuid[] not null default '{}';
