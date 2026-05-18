# Order Workflow Upgrade: Realtime Admin, Success Popup, Customer Accounts

Three connected improvements to the order flow.

## 1. Realtime Admin Orders

- Enable Supabase Realtime on `public.orders` and `public.order_items` (add to `supabase_realtime` publication, set `REPLICA IDENTITY FULL`).
- In `Admin.tsx > OrdersTab`, subscribe to `postgres_changes` on `orders` (INSERT/UPDATE/DELETE) and invalidate the orders query so new orders appear instantly without refresh. Show a subtle toast when a new order arrives.

## 2. Order Success Popup

- After successful checkout, instead of silently navigating, show an artisan-themed success **modal** (shadcn Dialog) with:
  - Title: "Order Placed Successfully"
  - Message: "We will call you at {phone} within 24 hours to confirm your fresh roast."
  - Buttons: "Back to Home" (→ `/`) and, if logged in, "View My Orders" (→ `/account`).
- Modal lives on the order confirmation page (`/order/:id`) so a refresh-safe URL still exists. Checkout navigates there with a `?success=1` flag that auto-opens the modal once.
- Keep the existing WhatsApp open behavior (only fires once, before navigation).

## 3. Customer Auth + Order History

### Auth
- Add Email/Password signup + login and Google sign-in for customers (separate from admin login).
- New routes: `/login`, `/signup` (shared auth page with tabs). Reuse `useAuth` hook.
- Header gets an "Account" / "Sign in" link.

### Database
- Migration on `orders`: add `user_id uuid` (nullable, references `auth.users(id)` conceptually — store as uuid, no FK to auth schema per guidelines).
- RLS update on `orders` + `order_items`:
  - Remove the current "Anyone can read orders/order_items" public policies (security upgrade) and replace with:
    - Public can read a single order by id only via existing guest flow → keep a permissive SELECT for unauthenticated lookup by id (kept to not break guest order confirmation page).
    - Authenticated users can read their own orders (`user_id = auth.uid()`).
  - Admin policies unchanged.

### Checkout integration
- If `user` is logged in, set `user_id` on insert and prefill name/phone/address from their last order (or a lightweight `customer_profiles` extension — for v1, prefill from most recent order).

### Account page
- New `/account` route (protected, redirects to `/login` if unauthenticated).
- Lists orders: date, items (joined from `order_items`), total NPR, status badge.
- Click row → existing `/order/:id` page.

## Technical Details

Files to create:
- `src/pages/Login.tsx` — email/password + Google, tabs for signup/login.
- `src/pages/Account.tsx` — order history list.
- `src/components/OrderSuccessDialog.tsx` — reusable dialog.

Files to edit:
- `src/App.tsx` — add `/login`, `/account` routes.
- `src/components/Header.tsx` — Account/Sign in link.
- `src/pages/Checkout.tsx` — include `user_id`, prefill from auth, navigate with `?success=1`.
- `src/pages/OrderConfirmation.tsx` — read `?success=1`, open dialog.
- `src/pages/Admin.tsx` (OrdersTab) — realtime subscription + query invalidation.

Migrations:
1. `alter table public.orders add column user_id uuid;` + index.
2. Update RLS policies on `orders` and `order_items` for owner reads.
3. `alter publication supabase_realtime add table public.orders;` + `alter table public.orders replica identity full;` (same for `order_items` if needed for admin detail).

Auth config:
- Call `configure_social_auth` with Google.
- Do NOT enable auto-confirm email; standard email verification flow.

Out of scope:
- Password reset page (can add later if requested).
- Editing saved addresses (prefill is read-only for v1).
