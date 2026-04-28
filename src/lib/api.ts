import { supabase } from "@/integrations/supabase/client";

export type Weight = "250g" | "500g" | "1kg";
export const WEIGHTS: Weight[] = ["250g", "500g", "1kg"];

export interface ProductVariant {
  id: string;
  product_id: string;
  weight: Weight;
  price_npr: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_note: string | null;
  description: string | null;
  flavor_notes: string[];
  roast: string | null;
  process: string | null;
  brew_recommendations: string[];
  origin: string | null;
  image_url: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  variants: ProductVariant[];
}

export interface Settings {
  brand_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  wholesale_whatsapp: string | null;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  bank_details: string;
  contact_email: string;
  contact_phone: string | null;
  pickup_address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  notification_email: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

// Products
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as any[]).map(normalizeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data as any) : null;
}

function normalizeProduct(row: any): Product {
  const variants = ((row.variants ?? []) as ProductVariant[]).slice().sort((a, b) => {
    const order: Weight[] = ["250g", "500g", "1kg"];
    return order.indexOf(a.weight) - order.indexOf(b.weight);
  });
  return { ...row, variants };
}

export function startingPrice(p: Product): number {
  if (!p.variants.length) return 0;
  return Math.min(...p.variants.map((v) => v.price_npr));
}

// Settings
export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data ?? {
    brand_name: "Masto Artisan Roastery",
    logo_url: null,
    whatsapp_number: "9779800000000",
    wholesale_whatsapp: null,
    shipping_flat_rate: 200,
    free_shipping_threshold: 3000,
    bank_details: "",
    contact_email: "mastoartisanroastry@gmail.com",
    contact_phone: null,
    pickup_address: null,
    instagram_url: null,
    facebook_url: null,
    notification_email: "mastoartisanroastry@gmail.com",
  }) as Settings;
}

// Gallery
export async function fetchGallery(): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as GalleryImage[];
}

// Coupons (public read for validation)
export async function fetchActiveCoupon(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Coupon | null;
}

// Format helpers
export function formatNPR(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
}
