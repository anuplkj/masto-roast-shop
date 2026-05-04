# Masto Roastery — Master Prompt Alignment Plan

The site already covers most of the brief: brand styling, Shop/Product/Cart/Checkout, Wholesale form + WhatsApp, Story + Gallery, Admin dashboard (orders, inquiries, products, gallery, branding, coupons, settings), COD + bank transfer, NPR currency, Instagram/Facebook in footer, lazy-loaded images. This plan only addresses the **real gaps**.

## Gaps vs. master prompt

| Area | Current | Gap |
|---|---|---|
| Per-page SEO (title/description/canonical/OG) | Only static `index.html` | None per route |
| Structured data (JSON-LD) | None | Organization, Product, Breadcrumb |
| Sitemap & robots | `robots.txt` exists, no sitemap | Missing `sitemap.xml` |
| Homepage conversion sections | Hero + featured + 3 freshness cards | No "Ethical Sourcing / Small-Batch / Roasted in Kathmandu" value-prop trio with the prompt's wording, no testimonials / "as served in" logos |
| Product page specs | roast/process/origin/flavor/brew | No Elevation / Variety / Harvest year |
| Product page cross-sell | None | "You may also like…" |
| Product SEO field | description only | No dedicated SEO/meta description in admin |
| Email notifications | UI calls `send-wholesale-notification` but **function does not exist**; no order email either | Build both edge functions |
| H1 hierarchy | Mostly fine | Audit for one H1 per page |

## What I'll build

### 1. SEO foundation
- Add `react-helmet-async` and an `<HelmetProvider>` in `App.tsx`.
- New `src/components/SEO.tsx` — props: `title`, `description`, `canonical`, `image`, `jsonLd?`. Sets `<title>`, meta description, canonical, OG, Twitter, optional JSON-LD `<script>`.
- Wire SEO into: `Index`, `Shop`, `ProductPage` (dynamic from product), `Story`, `Wholesale`, `Cart`, `Checkout`, `NotFound`. Each gets keyword-rich title + description from the prompt's vocabulary ("Artisan Coffee Roastery in Nepal", "Specialty Himalayan Coffee", "High-altitude Nepali beans", "Ethically sourced specialty coffee", etc.).
- JSON-LD: `Organization` + `LocalBusiness` on home; `Product` (name, image, description, offers in NPR with variant prices, brand) on product pages; `BreadcrumbList` on Shop/Product/Story.
- Tighten `index.html` defaults (locale, og:site_name, theme-color).

### 2. Sitemap
- `public/sitemap.xml` listing `/`, `/shop`, `/story`, `/wholesale`. Product URLs are dynamic, so add a small build-time generator script (`scripts/generate-sitemap.ts`) that queries Supabase for active product slugs and writes `public/sitemap.xml`. Run manually or via `npm run sitemap`.
- Update `public/robots.txt` to reference the sitemap.

### 3. Homepage conversion polish
- Rename/rewrite the freshness trio to match the prompt: **Ethical Direct Sourcing**, **Small-Batch Artisan Roasting**, **Freshly Roasted in Kathmandu**.
- Update featured-product CTA copy to "Experience the Roast".
- Add a **Social Proof** section (testimonials / "As served in" cafe logos). Backed by a new `testimonials` table managed in Admin so it's editable, not hard-coded. Renders only if rows exist (no empty section).

### 4. Product page enhancements
- Add DB columns: `elevation_m int`, `variety text`, `harvest_year int`, `seo_description text` on `products`.
- Surface Elevation / Variety / Harvest in the existing detail grid.
- Add "You may also like" section (3 random other active products).
- Use `seo_description` (fallback to `description`) for the meta description.
- Admin Products tab: add inputs for the four new fields.

### 5. Email notifications (currently broken)
- Create `supabase/functions/send-wholesale-notification/index.ts` and `supabase/functions/send-order-notification/index.ts`.
- Use Lovable's built-in transactional email infrastructure (`email_domain--setup_email_infra` + `scaffold_transactional_email`) so no API key is required. Templates: "New wholesale inquiry" and "New order received", both sent to `settings.notification_email` (defaults to `mastoartisanroastry@gmail.com`).
- Wire `Checkout` to invoke `send-order-notification` after order insert (Wholesale already invokes the wholesale one).
- **Prerequisite for the user:** an email sending domain must be configured in Lovable Cloud. If none is set up, I'll prompt you to add one before deployment.

### 6. Small a11y / semantic pass
- Ensure each page has exactly one `<h1>`.
- Add descriptive alt text patterns for gallery uploads (already supported via caption).

## Out of scope (explicitly)
- Backlink building, Google Search Console submission, paid SEO.
- Replacing the current visual design — the prompt's brand palette already matches.
- Auth changes, payment gateway integration (manual bank + COD remain).

## Tech notes
- New dependency: `react-helmet-async`.
- Migrations: add columns to `products`; new `testimonials` table with admin RLS + public read.
- Edge functions deploy automatically.
- No changes to `src/integrations/supabase/client.ts` or `types.ts`.

## Files touched (approx.)
- `src/App.tsx` (HelmetProvider)
- `src/components/SEO.tsx` (new)
- `src/pages/*.tsx` (SEO + small content tweaks)
- `src/pages/Index.tsx` (value props rename, social-proof section)
- `src/pages/ProductPage.tsx` (specs, cross-sell)
- `src/pages/Admin.tsx` (new product fields, testimonials tab)
- `index.html` (meta polish)
- `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-sitemap.ts` (new)
- `supabase/functions/send-order-notification/`, `send-wholesale-notification/` (new)
- DB migration: `products` columns + `testimonials` table

Approve and I'll implement in this order: DB migration → SEO component + per-page wiring → product page specs/cross-sell → homepage sections → email functions → sitemap.
