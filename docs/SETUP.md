# Connecting the database (Supabase)

The site works without a database: it shows the sample products, and orders go
straight to WhatsApp. Connect Supabase to get the admin panel, saved orders and
sign-in. This takes about 15 minutes, and you only do it once.

## 1. Create the project
1. Go to <https://supabase.com>, sign up (free) and click **New project**.
2. Name it `doodlzz`, choose a strong database password and save it somewhere safe.
   For **Region**, pick the one closest to Lebanon (e.g. *Frankfurt*).
3. Wait about 2 minutes while the project is created.

## 2. Create the tables
1. In the left menu, open **SQL Editor** and click **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repo, copy **all** of it,
   paste it into the editor and click **Run**. You should see "Success. No rows returned".

This creates the products and orders tables, the photo storage and the security rules.
It also makes **doodlzzlb@gmail.com** the admin.

## 3. Sign-in emails with a code
1. Go to **Authentication → Emails → Templates** and open **Magic Link**.
2. Replace the message body with:
   ```html
   <h2>Your Doodlzz sign-in code</h2>
   <p>Enter this code on the website: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>Or <a href="{{ .ConfirmationURL }}">click here to sign in</a>.</p>
   ```
3. Do the same for the **Confirm signup** template, so first-time sign-ins also get the code.
4. Go to **Authentication → URL Configuration**:
   - **Site URL**: your live site, e.g. `https://doodlzz-website.<name>.workers.dev`
   - **Redirect URLs**: add `https://doodlzz-website.<name>.workers.dev/**` and `http://localhost:3000/**`

> **Customer sign-in needs your own email sender.** Supabase's built-in email only reaches
> the project's own team (so the admin email works), and only a few emails per hour.
> To let customers sign in, go to **Authentication → Emails → SMTP Settings** and add a sender.
> For example, with Gmail: turn on 2-step verification on doodlzzlb@gmail.com, create an
> **App password** (Google Account → Security → App passwords), then use host `smtp.gmail.com`,
> port `465`, username `doodlzzlb@gmail.com`, and the app password.
> Checkout does **not** need sign-in, so orders work either way.

## 4. Connect the website
1. In Supabase, go to **Project Settings → API Keys** and copy the **Project URL** and the
   **anon / publishable** key. *Never* use the `service_role` / secret key.
2. **Cloudflare:** open the `doodlzz-website` Worker → **Settings → Build → Variables and secrets**
   (the *build* variables, not the runtime ones) and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon / publishable key

   Then go to **Deployments** and redeploy the latest version (or push any change).
3. **Your computer** (for `npm run dev`): copy `.env.example` to `.env.local`, fill in the same
   two values, and restart `npm run dev`.

## 5. Use it
- **Admin panel:** go to `/admin` on the site and sign in with doodlzzlb@gmail.com (you get a code
  by email). There you can:
  - **Products**: add, edit, hide or delete products, with photos, prices, sale price,
    category, ages, Best seller and New. On an empty database, *Import 12 sample products* gives
    you something to start from.
  - **Orders**: see every order and change its status (New → Confirmed → Out for delivery →
    Delivered). Each order has WhatsApp and Call buttons to reach the customer.
- **Add another admin:** in the SQL Editor, run
  `insert into public.admins (email) values ('their.email@example.com');`

## How an order works
1. The customer fills the cart and goes to **Checkout**. There they enter their name, phone, city,
   address and notes, and choose **Cash on delivery** or **Whish Money**.
2. **Buy** saves the order in the database (with the real prices from the database), then opens
   WhatsApp with the full order written out, addressed to +961 81 727 746. The customer taps Send.
3. The manager confirms the delivery fee and processes the order on WhatsApp, and updates its status
   in `/admin`. The order shows up in the admin panel even if the customer never presses Send.

No online payment is taken on the site.
