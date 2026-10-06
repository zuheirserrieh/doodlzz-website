-- Doodlzz database. Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to re-run: it only creates what is missing and replaces functions/policies.

-- ─────────────────────────────────────────────────────────────
-- Admins: who can manage products and see all orders.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

insert into public.admins (email) values ('doodlzzlb@gmail.com')
on conflict do nothing;

alter table public.admins enable row level security;
-- No policies: the table is only readable through is_admin() below.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null,
  name_ar text not null default '',
  description_en text not null default '',
  description_ar text not null default '',
  category text not null,
  ages text[] not null default '{}',
  price_usd numeric(10, 2) not null check (price_usd >= 0),
  compare_at_usd numeric(10, 2) check (compare_at_usd is null or compare_at_usd >= 0),
  images text[] not null default '{}',
  best_seller boolean not null default false,
  is_new boolean not null default false,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists subcategory text not null default '';
alter table public.products add column if not exists genders text[] not null default '{}';
alter table public.products add column if not exists sold_count integer not null default 0;
alter table public.products add column if not exists limited_quantity boolean not null default false;
alter table public.products add column if not exists last_piece boolean not null default false;
alter table public.products add column if not exists related uuid[] not null default '{}';

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

drop policy if exists "products: public reads active" on public.products;
create policy "products: public reads active" on public.products
  for select using (active or public.is_admin());

drop policy if exists "products: admin writes" on public.products;
create policy "products: admin writes" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Orders (delivery only; paid cash on delivery or by Whish Money)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id bigint generated always as identity (start with 1001) primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  notes text not null default '',
  payment_method text not null check (payment_method in ('cash', 'whish')),
  items jsonb not null,
  total_usd numeric(10, 2) not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  locale text not null default 'en'
);

alter table public.orders add column if not exists delivery_option text not null default 'standard'
  check (delivery_option in ('standard', 'express', 'sameday'));

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_idx on public.orders (user_id);

alter table public.orders enable row level security;

drop policy if exists "orders: customer reads own, admin reads all" on public.orders;
create policy "orders: customer reads own, admin reads all" on public.orders
  for select using (public.is_admin() or (auth.uid() is not null and user_id = auth.uid()));

drop policy if exists "orders: admin updates" on public.orders;
create policy "orders: admin updates" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders: admin deletes" on public.orders;
create policy "orders: admin deletes" on public.orders
  for delete using (public.is_admin());

-- Customers never insert into orders directly. place_order() looks up the real
-- prices in the database, so a tampered cart can't change what is charged.
create or replace function public.place_order(customer jsonb, cart jsonb, order_locale text default 'en')
returns table (order_id bigint, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  line jsonb;
  p public.products;
  qty integer;
  lines jsonb := '[]'::jsonb;
  sum_usd numeric(10, 2) := 0;
  new_id bigint;
begin
  if jsonb_typeof(cart) <> 'array' or jsonb_array_length(cart) = 0 then
    raise exception 'Cart is empty';
  end if;
  if jsonb_array_length(cart) > 50 then
    raise exception 'Too many items';
  end if;
  if coalesce(trim(customer ->> 'name'), '') = '' or coalesce(trim(customer ->> 'phone'), '') = ''
     or coalesce(trim(customer ->> 'city'), '') = '' or coalesce(trim(customer ->> 'address'), '') = '' then
    raise exception 'Missing delivery details';
  end if;
  if customer ->> 'payment' not in ('cash', 'whish') then
    raise exception 'Invalid payment method';
  end if;

  for line in select * from jsonb_array_elements(cart) loop
    qty := (line ->> 'qty')::integer;
    if qty is null or qty < 1 or qty > 20 then
      raise exception 'Invalid quantity';
    end if;
    select * into p from public.products where id = (line ->> 'id')::uuid and active;
    if not found then
      raise exception 'A product in the cart is no longer available';
    end if;
    lines := lines || jsonb_build_object(
      'id', p.id, 'slug', p.slug, 'name', p.name_en, 'name_ar', p.name_ar,
      'price', p.price_usd, 'qty', qty
    );
    sum_usd := sum_usd + p.price_usd * qty;
    -- Counted for the "Best selling" sort.
    update public.products set sold_count = sold_count + qty where id = p.id;
  end loop;

  insert into public.orders (user_id, customer_name, phone, city, address, notes, payment_method, delivery_option, items, total_usd, locale)
  values (
    auth.uid(),
    left(trim(customer ->> 'name'), 120),
    left(trim(customer ->> 'phone'), 40),
    left(trim(customer ->> 'city'), 80),
    left(trim(customer ->> 'address'), 400),
    left(coalesce(trim(customer ->> 'notes'), ''), 600),
    customer ->> 'payment',
    case when customer ->> 'delivery' in ('express', 'sameday') then customer ->> 'delivery' else 'standard' end,
    lines,
    sum_usd,
    case when order_locale = 'ar' then 'ar' else 'en' end
  )
  returning id into new_id;

  return query select new_id, sum_usd;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Product photos: public bucket, only admins can upload/delete.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images: admin upload" on storage.objects;
create policy "product images: admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin update" on storage.objects;
create policy "product images: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin delete" on storage.objects;
create policy "product images: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Saved cart & favorites for signed-in customers (one row per account).
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- Photo for each category tile on the home page (set in /admin → Categories).
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- Home page content managed in /admin → Home page:
--   moment = "Real Moments" customer photo + review
--   brand  = "Brands we carry" logo
-- ─────────────────────────────────────────────────────────────
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
