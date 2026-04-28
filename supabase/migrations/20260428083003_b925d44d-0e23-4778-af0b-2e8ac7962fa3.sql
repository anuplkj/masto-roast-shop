-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.weight_option as enum ('250g', '500g', '1kg');
create type public.order_status as enum ('new', 'confirmed', 'fulfilled', 'cancelled');
create type public.payment_method as enum ('cod', 'bank');
create type public.delivery_method as enum ('delivery', 'pickup');
create type public.inquiry_status as enum ('new', 'contacted', 'closed');
create type public.coupon_type as enum ('percent', 'flat');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid());

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Users can read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- Auto-create profile + auto-promote first user to admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  select count(*) into user_count from auth.users;
  if user_count = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_note text,
  description text,
  flavor_notes text[] not null default '{}',
  roast text,
  process text,
  brew_recommendations text[] not null default '{}',
  origin text,
  image_url text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
alter table public.products enable row level security;
create policy "Anyone can read products" on public.products for select using (true);
create policy "Admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Variants
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  weight weight_option not null,
  price_npr int not null,
  stock int not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, weight)
);
alter table public.product_variants enable row level security;
create policy "Anyone can read variants" on public.product_variants for select using (true);
create policy "Admins manage variants" on public.product_variants for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  delivery delivery_method not null default 'delivery',
  payment payment_method not null default 'cod',
  notes text,
  subtotal int not null,
  shipping int not null default 0,
  discount int not null default 0,
  coupon_code text,
  total int not null,
  status order_status not null default 'new'
);
alter table public.orders enable row level security;
create policy "Anyone can create orders" on public.orders for insert with check (true);
create policy "Admins read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  weight weight_option not null,
  qty int not null,
  unit_price int not null
);
alter table public.order_items enable row level security;
create policy "Anyone can create order items" on public.order_items for insert with check (true);
create policy "Admins read order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Wholesale inquiries
create table public.wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  business text not null,
  phone text not null,
  monthly_demand text not null,
  notes text,
  status inquiry_status not null default 'new'
);
alter table public.wholesale_inquiries enable row level security;
create policy "Anyone can submit inquiry" on public.wholesale_inquiries for insert with check (true);
create policy "Admins read inquiries" on public.wholesale_inquiries for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update inquiries" on public.wholesale_inquiries for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Gallery
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_images enable row level security;
create policy "Anyone can read gallery" on public.gallery_images for select using (true);
create policy "Admins manage gallery" on public.gallery_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Coupons
create table public.coupons (
  code text primary key,
  type coupon_type not null,
  value int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "Anyone can read coupons" on public.coupons for select using (true);
create policy "Admins manage coupons" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Settings (singleton)
create table public.settings (
  id int primary key default 1,
  brand_name text not null default 'Masto Artisan Roastery',
  logo_url text,
  whatsapp_number text not null default '9779800000000',
  wholesale_whatsapp text,
  shipping_flat_rate int not null default 200,
  free_shipping_threshold int not null default 3000,
  bank_details text not null default 'Bank: NIC Asia | A/C: 0123456789 | Name: Masto Artisan Roastery',
  contact_email text not null default 'mastoartisanroastry@gmail.com',
  contact_phone text,
  pickup_address text,
  instagram_url text,
  facebook_url text,
  notification_email text not null default 'mastoartisanroastry@gmail.com',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();
alter table public.settings enable row level security;
create policy "Anyone can read settings" on public.settings for select using (true);
create policy "Admins update settings" on public.settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert settings" on public.settings for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

insert into public.settings (id) values (1) on conflict do nothing;

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/jpg']),
  ('gallery', 'gallery', true, 5242880, array['image/jpeg','image/png','image/webp','image/jpg']),
  ('branding', 'branding', true, 2097152, array['image/jpeg','image/png','image/webp','image/jpg','image/svg+xml'])
on conflict (id) do nothing;

create policy "Public read product-images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins write product-images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update product-images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete product-images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Public read gallery" on storage.objects for select using (bucket_id = 'gallery');
create policy "Admins write gallery" on storage.objects for insert to authenticated with check (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update gallery" on storage.objects for update to authenticated using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete gallery" on storage.objects for delete to authenticated using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Public read branding" on storage.objects for select using (bucket_id = 'branding');
create policy "Admins write branding" on storage.objects for insert to authenticated with check (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update branding" on storage.objects for update to authenticated using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete branding" on storage.objects for delete to authenticated using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));