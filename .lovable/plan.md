## Scope

Three logic updates: defer cart clearing until user dismisses the success popup, let the admin toggle Bank Transfer visibility, and tighten the customer/admin separation around `/admin`.

---

### 1. Checkout state cleanup

Today `Checkout.tsx` calls `clear()` immediately before navigating to `/order/:id?success=1`. Move the cart wipe so it only runs when the user dismisses the success modal.

- Remove the `clear()` call from `Checkout.tsx`'s `onSubmit`.
- Stash the just-placed order's `id` in `sessionStorage` (`masto.pendingOrderClear`) before navigating, so a refresh of the confirmation page still triggers the wipe once.
- In `OrderConfirmation.tsx`, when `?success=1` is present, open the dialog (already wired) and pass an `onConfirm` callback to `OrderSuccessDialog`.
- In `OrderSuccessDialog.tsx`, rename the primary CTA to "Return to Shop", point it to `/shop`, and call the provided `onConfirm` before navigation. `onConfirm` calls `clear()` from `useCart` and removes the sessionStorage flag.
- "View my orders" (logged-in users) also triggers `onConfirm` so the cart is empty either way.

### 2. Admin-controlled Bank Transfer toggle

The project already has a single-row `public.settings` table consumed via `useSettings()`. Re-use it instead of a parallel `site_settings` table to avoid two sources of truth.

- Migration: `ALTER TABLE public.settings ADD COLUMN bank_transfer_enabled boolean NOT NULL DEFAULT true;` (Supabase types regenerate automatically).
- `Checkout.tsx`: when rendering the Payment card, only render the Bank Transfer `<Radio>` if `settings?.bank_transfer_enabled !== false`. If the current form value is `bank` but the option is disabled (e.g. toggled off after load), force-reset `payment` to `cod`.
- `Admin.tsx > SettingsTab`: add a labelled `<Switch>` "Allow Bank Transfer at checkout". On change, `update` the `settings` row and invalidate the `settings` query so the public site reflects it.

If you specifically want a brand-new `site_settings` table instead, say so and I'll branch the plan.

### 3. Customer / admin separation

The project already follows the recommended pattern: roles live in `public.user_roles` (separate from `profiles`) and are checked via the `has_role(uid, role)` security-definer function. All admin RLS policies on `orders`, `order_items`, `products`, `coupons`, `settings`, etc. already use `has_role(auth.uid(), 'admin')`. Adding a duplicate `role` column to `profiles` would create a second source of truth and is a known privilege-escalation footgun, so I'm keeping the existing structure and just hardening the routing/signup flow.

- Confirm `handle_new_user()` trigger (already present) assigns `'user'` to every new signup except the very first account → keeps "Shop-side signup = customer" behavior.
- New `src/hooks/useRequireAdmin.ts`: waits for `useAuth()` `loading` to settle, then:
  - if no `user` → `navigate("/admin/login", { replace: true })`
  - if `user && !isAdmin` → `navigate("/", { replace: true })` and toast "Admin access only".
- `Admin.tsx`: replace the current inline guard with `useRequireAdmin()` and render nothing (or a spinner) until cleared. `AdminLogin.tsx` remains the login surface for admins.
- `Login.tsx` / signup flow stays customer-only and lands users on `/account`. No UI hint that `/admin` exists.
- RLS audit pass: re-run the linter after the migration and confirm every admin-only policy still uses `has_role(auth.uid(), 'admin')`. No new policies needed since data tables already gate on it.
- Document in security memory: roles live in `user_roles`, never in `profiles`; admin routes are guarded both client-side (`useRequireAdmin`) and server-side (RLS via `has_role`).

---

### Files

**Create**
- `src/hooks/useRequireAdmin.ts`

**Edit**
- `src/pages/Checkout.tsx` — drop early `clear()`, set sessionStorage flag, hide Bank Transfer when disabled.
- `src/pages/OrderConfirmation.tsx` — pass `onConfirm` to dialog.
- `src/components/OrderSuccessDialog.tsx` — "Return to Shop" CTA, calls `onConfirm` (clears cart) before navigating.
- `src/pages/Admin.tsx` — use `useRequireAdmin`; add Bank Transfer switch to `SettingsTab`.

**Migration**
- Add `bank_transfer_enabled boolean NOT NULL DEFAULT true` to `public.settings`.

### Out of scope
- Creating a separate `site_settings` table (using existing `settings` instead — confirm if you'd rather have a new table).
- Adding `role` to `profiles` (would conflict with the existing secure `user_roles` design).
- Password reset / email change flows.