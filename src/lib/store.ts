import { seedProducts, type Product, type Variant } from "@/data/products";

const KEYS = {
  products: "masto.products.v1",
  cart: "masto.cart.v1",
  orders: "masto.orders.v1",
  coupons: "masto.coupons.v1",
  settings: "masto.settings.v1",
  adminSession: "masto.admin.session",
};

export interface CartItem {
  slug: string;
  variant: Variant;
  qty: number;
}

export type OrderStatus = "new" | "confirmed" | "fulfilled" | "cancelled";

export interface Order {
  id: string;
  createdAt: number;
  customer: { name: string; phone: string; address: string };
  delivery: "delivery" | "pickup";
  payment: "cod" | "bank";
  items: Array<{
    slug: string;
    name: string;
    variant: Variant;
    qty: number;
    unitPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  active: boolean;
}

export interface Settings {
  whatsappNumber: string; // digits only, country code, no +
  shippingFlatRate: number;
  freeShippingThreshold: number;
  bankDetails: string;
  contactEmail: string;
  contactPhone: string;
  pickupAddress: string;
}

export const defaultSettings: Settings = {
  whatsappNumber: "9779800000000",
  shippingFlatRate: 150,
  freeShippingThreshold: 3000,
  bankDetails:
    "Bank: Nepal Investment Bank\nAccount Name: Masto Artisan Roastery\nAccount No: 0123456789\nBranch: Kathmandu",
  contactEmail: "hello@mastoroastery.com",
  contactPhone: "+977 980-0000000",
  pickupAddress: "Masto Roastery, Patan, Lalitpur, Nepal",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Products
export function getProducts(): Product[] {
  const stored = read<Product[] | null>(KEYS.products, null);
  if (!stored || stored.length === 0) {
    write(KEYS.products, seedProducts);
    return seedProducts;
  }
  return stored;
}
export function saveProducts(products: Product[]) {
  write(KEYS.products, products);
}
export function getProduct(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

// Cart
export function getCart(): CartItem[] {
  return read<CartItem[]>(KEYS.cart, []);
}
export function saveCart(items: CartItem[]) {
  write(KEYS.cart, items);
}

// Orders
export function getOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []);
}
export function saveOrder(order: Order) {
  const all = getOrders();
  all.unshift(order);
  write(KEYS.orders, all);
}
export function updateOrderStatus(id: string, status: OrderStatus) {
  const all = getOrders().map((o) => (o.id === id ? { ...o, status } : o));
  write(KEYS.orders, all);
}
export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

// Coupons
export function getCoupons(): Coupon[] {
  return read<Coupon[]>(KEYS.coupons, [
    { code: "WELCOME10", type: "percent", value: 10, active: true },
  ]);
}
export function saveCoupons(coupons: Coupon[]) {
  write(KEYS.coupons, coupons);
}

// Settings
export function getSettings(): Settings {
  return { ...defaultSettings, ...read<Partial<Settings>>(KEYS.settings, {}) };
}
export function saveSettings(settings: Settings) {
  write(KEYS.settings, settings);
}

// Admin session
export const ADMIN_PASSWORD = "masto2025";
export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEYS.adminSession) === "1";
}
export function setAdminAuthed(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) sessionStorage.setItem(KEYS.adminSession, "1");
  else sessionStorage.removeItem(KEYS.adminSession);
}

// Helpers
export function formatNPR(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export function startingPrice(p: Product): number {
  return Math.min(...Object.values(p.prices));
}
