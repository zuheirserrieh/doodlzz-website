-- ONE-TIME UPDATE (7 Oct 2026): paste this whole file into Supabase → SQL Editor → Run.
-- Combines 005 + 006 + 007. Safe to run once; your products and orders are kept.

-- ===== 005_categories_gender_bestselling =====
-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- New categories with subcategories, Boy/Girl, new age groups, and "Best selling" counts.

alter table public.products add column if not exists subcategory text not null default '';
alter table public.products add column if not exists genders text[] not null default '{}';
alter table public.products add column if not exists sold_count integer not null default 0;

-- The old categories become subcategories of "Baby Essentials".
update public.products set subcategory = category, category = 'baby-essentials'
where category in ('strollers', 'car-seats', 'swing-chairs', 'play-mats', 'walkers', 'high-chairs', 'beds');
update public.products set subcategory = 'bath-potty', category = 'baby-essentials'
where category in ('bath-tubs', 'potty');

-- "4+ years" is now split into finer groups; existing products move to "4–6 years".
update public.products set ages = array_replace(ages, '4y-plus', '4-6y') where '4y-plus' = any(ages);

-- Old category photos for these become subcategory photos (same slugs, nothing to do);
-- photos saved for "bath-tubs" / "potty" are dropped.
delete from public.category_images where slug in ('bath-tubs', 'potty');

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

-- ===== 006_badges_related =====
-- Run once in Supabase → SQL Editor (already included in schema.sql for new setups).
-- "Limited quantity" / "Last piece" labels, and related items ("Goes well with") per product.
alter table public.products add column if not exists limited_quantity boolean not null default false;
alter table public.products add column if not exists last_piece boolean not null default false;
alter table public.products add column if not exists related uuid[] not null default '{}';

-- ===== 007_home_media =====
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

