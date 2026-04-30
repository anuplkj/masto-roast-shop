## Migrating from Lovable Cloud to your own Supabase project

You currently run on Lovable Cloud (a managed Supabase). We'll move everything — schema, data, auth users, storage files, and edge functions — to your own Supabase project, then re-point the app.

Important caveat: Lovable Cloud cannot be turned off on this project. After migration it will sit idle and unused; the app will talk only to your Supabase.

---

### Step 1 — Get your Supabase credentials (you do this)

In your Supabase dashboard:

1. Open your project → **Project Settings → API**.
2. Copy these three values and have them ready:
   - **Project URL** (e.g. `https://abcdxyz.supabase.co`)
   - **anon public key** (long JWT starting `eyJ…`, role `anon`)
   - **service_role key** (long JWT starting `eyJ…`, role `service_role`) — keep this secret, it bypasses RLS. We use it only during the one-time migration.
3. Open **Project Settings → Database → Connection string** and copy the **URI** (postgres connection string with the password). Needed for data dump/restore.

When you're ready, I'll prompt you to paste them via secure secret inputs (never stored in code).

---

### Step 2 — Recreate the schema in your Supabase

Run a single SQL migration in your Supabase SQL editor that creates:

- Enums: `app_role`, `order_status`, `payment_method`, `delivery_method`, `inquiry_status`, `weight`, `coupon_type`
- Tables: `profiles`, `user_roles`, `products`, `product_variants`, `orders`, `order_items`, `wholesale_inquiries`, `gallery_images`, `coupons`, `settings`
- Functions: `has_role()`, `handle_new_user()`, `set_updated_at()` (all `SECURITY DEFINER` with locked `search_path`)
- Trigger: `on_auth_user_created` on `auth.users` → `handle_new_user()`
- All RLS policies (matching what you have today)
- Storage buckets: `product-images`, `gallery`, `branding` (public) + storage RLS

I'll generate this SQL file and give it to you (or run it via the service-role connection string with `psql`).

---

### Step 3 — Copy the data

Using your service-role connection string, dump from Lovable Cloud and restore into your Supabase, in this order to respect references:

```text
settings → coupons → products → product_variants
gallery_images → wholesale_inquiries → orders → order_items
```

Method: `pg_dump --data-only --table=public.<t>` from source, then `psql` into target. Your IDs (UUIDs) are preserved so order history stays intact.

---

### Step 4 — Migrate auth users

For each user in Lovable Cloud's `auth.users`:

1. Export via Supabase Admin API (`GET /auth/v1/admin/users`) using the source service-role key.
2. Re-create in your Supabase via `POST /auth/v1/admin/users` with `email_confirm: true` and the original `id` so foreign keys (`profiles.id`, `user_roles.user_id`) keep working.
3. Copy `profiles` and `user_roles` rows for those user IDs.

Caveat: **Password hashes cannot be migrated** between Supabase projects via the public Admin API. Each existing user (just you, the admin, today) will need to use **"Forgot password"** on first login to set a new password. I'll wire up a reset-password page if you don't have one. If you only have one admin account, easiest path is: re-create that admin in your new Supabase via signup, then grant the `admin` role.

---

### Step 5 — Migrate storage files

For each bucket (`product-images`, `gallery`, `branding`):

1. List objects via Lovable Cloud Storage API.
2. Download each file.
3. Upload to your Supabase under the same path so existing `image_url` values keep resolving (the URL host changes; we'll rewrite `products.image_url`, `gallery_images.image_url`, `settings.logo_url` to the new project URL).

---

### Step 6 — Re-deploy edge functions

Currently no custom edge functions exist in this project. If any get added before migration, we'll redeploy them via the Supabase CLI to your project. Nothing to do for now.

---

### Step 7 — Re-point the app

Update the Vite env to your Supabase:

```text
VITE_SUPABASE_URL          = https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = <your anon key>
VITE_SUPABASE_PROJECT_ID   = <your-ref>
```

Replace `src/integrations/supabase/client.ts` with a hand-maintained client (since Lovable's auto-generated one targets the Cloud project). Also regenerate `src/integrations/supabase/types.ts` from your Supabase using `npx supabase gen types typescript --project-id <your-ref>` so types match.

Quick smoke test after switch:

- `/shop` loads products
- Add to cart → `/checkout` → places an order in your Supabase
- `/admin/login` → sign in (or reset password) → orders/inquiries/products visible
- Image uploads write to your Supabase storage

---

### Technical details

- Source project ref: `pqnsdjammeockgnyapas` (Lovable Cloud)
- Migration script will be a single Node/TS file in `/tmp` using both projects' service-role keys; it does data + storage + auth in one run with progress logs and is idempotent (uses `ON CONFLICT (id) DO NOTHING`).
- No production user is interrupted: we copy data, then flip the env vars, then redeploy. There's a brief window where new orders could land in the old DB; safest to do this during low traffic.
- `LOVABLE_API_KEY` is unrelated to Supabase — it stays as-is for Lovable AI calls (if any).

---

### What I'll need from you to start

1. The 3 values from Step 1 (URL, anon key, service_role key) for **your Supabase**.
2. The Postgres connection URI from your Supabase (Step 1, item 3).
3. Confirmation you accept the password-reset caveat for migrated auth users.

Once you approve this plan and provide the credentials via the secret prompts, I'll generate the schema SQL, run the migration script, swap the env, and verify end-to-end.
