# Doodlzz

Mobile-first e-commerce site for Doodlzz, a baby & kids store in Lebanon.
Built with Next.js (App Router), TypeScript and Tailwind CSS v4, exported as a static site
and hosted on Cloudflare. Products, orders and sign-in use [Supabase](https://supabase.com).

- [docs/BRIEF.md](docs/BRIEF.md): project brief and visual style
- [docs/SETUP.md](docs/SETUP.md): connecting the database, the admin panel, and how orders work

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase URL and key (optional, see SETUP.md)
npm run dev                  # open http://localhost:3000/en
npm run build                # static site in out/
npm run lint
```

Without the Supabase values the site still runs on the sample products in `src/data/products.ts`.

## What's here

| Route | What it is |
| --- | --- |
| `/en`, `/ar` | Home page (Arabic is fully right-to-left) |
| `/[locale]/shop` | All products; supports `?q=` search, `?age=0-6m`, `?category=strollers`, `?tab=best\|new` |
| `/[locale]/category/[slug]` | Category listing |
| `/[locale]/product?slug=…` | Product page (a query string, so new products need no rebuild) |
| `/[locale]/cart` → `/[locale]/checkout` | Delivery details, Cash on delivery or Whish Money. **Buy** saves the order and opens WhatsApp |
| `/[locale]/account` | Customer sign-in (email code) and their orders |
| `/[locale]/favorites` | Saved (hearted) products |
| `/admin` | Admin panel: products (with photo upload) and orders. Admin email only |

- **Products** are loaded in the browser from Supabase and cached, so the pages stay static.
- **Orders** go through the `place_order` database function, which uses the database prices.
- **Security** comes from the row-level security rules in `supabase/schema.sql`. Admins are listed in the `admins` table.
- **Cart, favorites and checkout details** are saved in the browser (`localStorage`). Prices are in US dollars only.

## Where to edit content

| What | Where |
| --- | --- |
| Products, prices, photos | `/admin` → Products |
| Categories, age groups | `src/data/catalog.ts` |
| WhatsApp, phone, email, social links | `src/lib/site.ts` |
| Hero slides, all wording (EN + AR) | `src/lib/i18n.ts` |
| Colors and fonts | `src/app/globals.css` (`@theme`) |

Search the code for `TODO(owner)` to find every placeholder that still needs real content.

## Not built yet

- Online payment (by design: orders are confirmed and paid on delivery or via Whish over WhatsApp)
- Delivery, exchange policy and "our story" pages
- Managing categories from the admin panel (they're in code for now)
