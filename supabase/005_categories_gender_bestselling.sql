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
