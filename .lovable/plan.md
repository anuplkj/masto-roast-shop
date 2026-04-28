# Masto Artisan Roastery — Webstore Plan

A clean, warm, mobile-first coffee e-commerce site. Frontend-only (no backend yet): products live in code, cart lives in browser storage, orders are sent to you via WhatsApp, and a password-gated admin manages products/stock locally.

## Brand & Design System

- **Palette:** warm earthy tones — deep coffee brown, espresso, beige, cream/off-white, muted terracotta accent
- **Typography:** serif for headings (artisan feel), clean sans-serif for body
- **Feel:** generous whitespace, soft shadows, rounded-but-restrained corners, premium yet approachable
- **Tagline:** "Roasted with Tradition, Crafted for Taste"
- All tokens defined in `index.css` + `tailwind.config.ts` (HSL variables, semantic classes — no hardcoded colors in components)

## Pages & Structure

### 1. Homepage (`/`)
- Sticky minimal header: logo, nav (Shop, Story, Wholesale, Contact), cart icon with count
- **Hero:** brand name, tagline, "Shop Coffee" CTA, soft coffee-tone background
- **Featured products:** 3–6 cards with name, starting price, flavor note
- **Brand story:** short paragraph — Nepal-based artisan roasting
- **Freshness & sourcing callout:** two-up section (e.g. "Roasted to order" / "Single-origin sourcing")
- **Wholesale inquiry form:** name, business name, phone, monthly requirement → submits via WhatsApp link
- **Contact:** phone + WhatsApp button, email, location
- Footer

### 2. Shop (`/shop`)
- Responsive product grid (1 col mobile → 2 → 3 desktop)
- Optional filters: roast level, process (washed/natural)
- Card: image placeholder, name, "from Rs. X", short flavor note

### 3. Product detail (`/product/:slug`)
- Image, name, flavor notes, roast level, process, brew recommendations
- **Variant selector:** 250g / 500g / 1kg — price updates live
- Quantity selector
- Add to cart (toast confirmation)
- Per-variant stock awareness ("Only 3 left", "Out of stock" disables button)

### 4. Cart (`/cart`)
- Line items with variant, qty +/-, remove
- Subtotal, shipping (flat rate, free above threshold), total
- "Checkout" CTA

### 5. Checkout (`/checkout`)
- Fields: name, phone, address (zod validation)
- Delivery method: Delivery (flat rate / free above threshold) or Local Pickup (free)
- Payment method: Cash on Delivery or Bank Transfer (shows manual bank details)
- Optional coupon code field
- "Place Order" → generates order ID, saves order locally, opens WhatsApp with pre-filled order details (items, totals, customer info, payment method)

### 6. Order Confirmation (`/order/:id`)
- Order summary
- "We'll call you shortly to confirm" message
- Bank transfer instructions (if selected)
- "Send order again via WhatsApp" button

### 7. Admin (`/admin`)
- Password gate (password stored in code, session kept in sessionStorage)
- **Orders tab:** list of locally saved orders, status (new / confirmed / fulfilled), detail view
- **Products tab:** edit name, description, flavor notes, prices per variant, stock per variant, active/inactive
- **Coupons tab:** create simple % or flat discount codes
- **Settings tab:** WhatsApp number, flat shipping rate, free-shipping threshold, bank details
- All admin data persists to `localStorage`

## Functional Behavior

- **Cart:** React Context + localStorage, persists across reloads
- **Inventory:** decremented locally on order placement, per variant
- **Coupons:** validated at checkout, applied to subtotal
- **Shipping logic:** flat rate; free above configurable threshold; pickup = free
- **WhatsApp send:** formatted text message with order summary opens in new tab via `wa.me/<number>?text=...`
- **Form validation:** zod + react-hook-form on all inputs (length limits, phone format, required fields)

## Key Limitations of Frontend-Only Mode

So you go in eyes-open:
- Orders are **only saved on the device that placed them** — admin on a different phone/browser won't see them. WhatsApp message is the real source of truth.
- Inventory counts are **per-browser**, not global — two customers can technically buy the last bag.
- Admin password lives in the JS bundle — anyone determined can read it. Fine as a casual gate, not real security.
- Email notifications aren't included (you chose WhatsApp-only).

When ready, this can be upgraded to Lovable Cloud to fix all of the above without rebuilding the UI.

## Technical Notes

- React + Vite + Tailwind + shadcn/ui (already set up)
- Routes added in `App.tsx`
- Cart context in `src/context/CartContext.tsx`
- Product/order/settings stores in `src/lib/store.ts` (localStorage-backed)
- Seed catalog (~6 coffees) in `src/data/products.ts` with neutral placeholder imagery
- All copy in warm, confident, non-technical tone emphasizing freshness & craft
