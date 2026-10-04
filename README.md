# Doodlzz

Mobile-first e-commerce site for Doodlzz, a baby & kids store in Lebanon.
Built with Next.js (App Router), TypeScript and Tailwind CSS v4.

See [docs/BRIEF.md](docs/BRIEF.md) for the project brief and visual style.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /en
npm run build    # production build
npm run lint
```

## What's here

| Route | What it is |
| --- | --- |
| `/en`, `/ar` | Home page (Arabic is fully right-to-left) |
| `/[locale]/shop` | All products; supports `?q=` search, `?age=0-6m`, `?category=strollers`, `?tab=best\|new` |
| `/[locale]/category/[slug]` | Category listing |
| `/[locale]/product/[slug]` | Product page with "Order on WhatsApp" |
| `/[locale]/cart` | Cart; checkout sends the order as a WhatsApp message |
| `/[locale]/favorites` | Saved (hearted) products |

- **Menu drawer** opens from the header (menu and sign-in buttons) with the catalog and the language switch.
- **Cart and favorites** are saved in the browser (`localStorage`). Prices are in US dollars only.
- **Text** for both languages is in `src/lib/i18n.ts`.

## Where to edit content

| What | File |
| --- | --- |
| Products, prices, photos | `src/data/products.ts` (photos go in `public/products/`) |
| Categories, age groups | `src/data/catalog.ts` |
| WhatsApp, phone, email, social links | `src/lib/site.ts` |
| Hero slides, all wording (EN + AR) | `src/lib/i18n.ts` |
| Colors and fonts | `src/app/globals.css` (`@theme`) |

Search the code for `TODO(owner)` to find every placeholder that still needs real content.

## Not built yet

- Accounts / sign-in (favorites are saved in the browser for now)
- Online payment (orders currently go through WhatsApp)
- An admin panel for products. They live in a code file for now, and moving them to Shopify (headless) or a CMS is the planned next step.
- Delivery, exchange policy and "our story" pages
