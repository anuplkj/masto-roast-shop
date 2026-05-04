import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Trash2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchProducts, fetchSettings, fetchGallery, formatNPR, WEIGHTS, type Product, type Settings, type Weight } from "@/lib/api";
import { uploadImage, deleteImage } from "@/lib/upload";
import { toast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-cream">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="font-serif text-2xl text-espresso">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have admin access.</p>
          <Button onClick={() => signOut().then(() => navigate("/admin/login"))} className="mt-6">Sign out</Button>
        </div>
      </div>
    );
  }

  const logout = async () => { await signOut(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-serif text-xl text-espresso">Masto Admin</span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/">View site</Link></Button>
            <Button onClick={logout} variant="outline" size="sm"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <Tabs defaultValue="orders">
          <TabsList className="flex-wrap">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inquiries">Wholesale</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="inquiries" className="mt-6"><InquiriesTab /></TabsContent>
          <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
          <TabsContent value="gallery" className="mt-6"><GalleryTab /></TabsContent>
          <TabsContent value="testimonials" className="mt-6"><TestimonialsTab /></TabsContent>
          <TabsContent value="branding" className="mt-6"><BrandingTab /></TabsContent>
          <TabsContent value="coupons" className="mt-6"><CouponsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============ ORDERS ============
function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "new" | "confirmed" | "fulfilled" | "cancelled") => {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (orders.length === 0) return <p className="text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o: any) => (
        <details key={o.id} className="rounded-lg border border-border bg-background p-4">
          <summary className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <div className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.customer_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatNPR(o.total)}</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{o.status}</span>
            </div>
          </summary>
          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
              <div className="mt-1 text-sm">{o.customer_name}</div>
              <div className="text-sm">{o.customer_phone}</div>
              <div className="text-sm text-muted-foreground">{o.customer_address}</div>
              <div className="mt-3 text-xs text-muted-foreground">
                {o.delivery === "pickup" ? "Local pickup" : "Home delivery"} · {o.payment === "cod" ? "COD" : "Bank transfer"}
              </div>
              {o.notes && <div className="mt-2 text-xs italic text-muted-foreground">"{o.notes}"</div>}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</div>
              <ul className="mt-1 space-y-1 text-sm">
                {(o.items ?? []).map((it: any) => (
                  <li key={it.id} className="flex justify-between gap-2">
                    <span>{it.product_name} ({it.weight}) × {it.qty}</span>
                    <span>{formatNPR(it.unit_price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["new", "confirmed", "fulfilled", "cancelled"] as const).map((s) => (
              <Button key={s} size="sm" variant={o.status === s ? "default" : "outline"} onClick={() => setStatus(o.id, s)}>{s}</Button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

// ============ INQUIRIES ============
function InquiriesTab() {
  const qc = useQueryClient();
  const { data: inquiries = [] } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data } = await supabase.from("wholesale_inquiries").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "new" | "contacted" | "closed") => {
    await supabase.from("wholesale_inquiries").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  if (inquiries.length === 0) return <p className="text-muted-foreground">No wholesale inquiries yet.</p>;

  return (
    <div className="space-y-3">
      {inquiries.map((i: any) => (
        <div key={i.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-serif text-lg">{i.business}</div>
              <div className="text-sm text-muted-foreground">{i.name} · {i.phone}</div>
              <div className="mt-2 text-sm"><span className="text-muted-foreground">Monthly:</span> {i.monthly_demand}</div>
              {i.notes && <div className="mt-2 text-xs italic text-muted-foreground">"{i.notes}"</div>}
              <div className="mt-2 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-2">
              {(["new", "contacted", "closed"] as const).map((s) => (
                <Button key={s} size="sm" variant={i.status === s ? "default" : "outline"} onClick={() => setStatus(i.id, s)}>{s}</Button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ PRODUCTS ============
function ProductsTab() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: fetchProducts });
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} className="bg-espresso text-cream hover:bg-espresso/90">
          <Plus className="mr-2 h-4 w-4" /> Add product
        </Button>
      </div>
      {creating && <NewProductForm onDone={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); }} />}
      <div className="space-y-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onChange={() => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); }} />
        ))}
      </div>
    </div>
  );
}

function NewProductForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortNote, setShortNote] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || !slug) { toast({ title: "Name and slug required" }); return; }
    setSaving(true);
    try {
      const { data: prod, error } = await supabase.from("products").insert({
        name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        short_note: shortNote || null, active: true, featured: false,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("product_variants").insert(WEIGHTS.map((w, idx) => ({
        product_id: prod.id, weight: w, price_npr: 500 * (idx + 1), stock: 0,
      })));
      toast({ title: "Product created" });
      onDone();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-4">
      <h3 className="font-serif text-lg">New product</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div><Label>Name</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} /></div>
        <div><Label>Slug (URL)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Short note</Label><Input value={shortNote} onChange={(e) => setShortNote(e.target.value)} /></div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={save} disabled={saving} className="bg-espresso text-cream hover:bg-espresso/90">Create</Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

function ProductRow({ product, onChange }: { product: Product; onChange: () => void }) {
  const [p, setP] = useState(product);
  useEffect(() => setP(product), [product]);

  const update = (patch: Partial<Product>) => setP({ ...p, ...patch });

  const save = async () => {
    const { error } = await supabase.from("products").update({
      name: p.name, slug: p.slug, short_note: p.short_note, description: p.description,
      flavor_notes: p.flavor_notes, brew_recommendations: p.brew_recommendations,
      roast: p.roast, process: p.process, origin: p.origin,
      active: p.active, featured: p.featured, image_url: p.image_url,
      elevation_m: p.elevation_m, variety: p.variety, harvest_year: p.harvest_year,
      seo_description: p.seo_description,
    } as any).eq("id", p.id);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    for (const v of p.variants) {
      await supabase.from("product_variants").update({ price_npr: v.price_npr, stock: v.stock }).eq("id", v.id);
    }
    toast({ title: "Saved" });
    onChange();
  };

  const remove = async () => {
    if (p.image_url) await deleteImage("product-images", p.image_url).catch(() => {});
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    onChange();
  };

  const onUpload = async (file: File) => {
    try {
      if (p.image_url) await deleteImage("product-images", p.image_url).catch(() => {});
      const url = await uploadImage("product-images", file, p.slug);
      await supabase.from("products").update({ image_url: url }).eq("id", p.id);
      update({ image_url: url });
      toast({ title: "Image uploaded" });
      onChange();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <details className="rounded-lg border border-border bg-background p-4">
      <summary className="flex cursor-pointer items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {p.image_url && <img src={p.image_url} className="h-10 w-10 rounded object-cover" alt="" />}
          <div>
            <div className="font-serif text-lg">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.roast ?? "—"} · {p.process ?? "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Stock: {p.variants.reduce((a, v) => a + v.stock, 0)}</span>
          <span className={`text-xs ${p.active ? "text-accent" : "text-muted-foreground"}`}>{p.active ? "Active" : "Hidden"}</span>
        </div>
      </summary>
      <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Image</Label>
          <div className="mt-1 flex items-center gap-3">
            {p.image_url ? <img src={p.image_url} className="h-20 w-20 rounded object-cover" alt="" /> : <div className="h-20 w-20 rounded bg-secondary" />}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-secondary">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </label>
            {p.image_url && <Button size="sm" variant="ghost" onClick={async () => { await deleteImage("product-images", p.image_url!).catch(() => {}); await supabase.from("products").update({ image_url: null }).eq("id", p.id); update({ image_url: null }); onChange(); }}>Remove</Button>}
          </div>
        </div>
        <div><Label>Name</Label><Input value={p.name} onChange={(e) => update({ name: e.target.value })} className="mt-1" /></div>
        <div><Label>Slug</Label><Input value={p.slug} onChange={(e) => update({ slug: e.target.value })} className="mt-1" /></div>
        <div><Label>Roast</Label><Input value={p.roast ?? ""} onChange={(e) => update({ roast: e.target.value })} className="mt-1" /></div>
        <div><Label>Process</Label><Input value={p.process ?? ""} onChange={(e) => update({ process: e.target.value })} className="mt-1" /></div>
        <div><Label>Origin</Label><Input value={p.origin ?? ""} onChange={(e) => update({ origin: e.target.value })} className="mt-1" /></div>
        <div><Label>Short note</Label><Input value={p.short_note ?? ""} onChange={(e) => update({ short_note: e.target.value })} className="mt-1" /></div>
        <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={p.description ?? ""} onChange={(e) => update({ description: e.target.value })} className="mt-1" /></div>
        <div className="md:col-span-2"><Label>SEO description (meta tag, ~155 chars)</Label><Textarea rows={2} maxLength={200} value={p.seo_description ?? ""} onChange={(e) => update({ seo_description: e.target.value })} className="mt-1" /></div>
        <div><Label>Elevation (m)</Label><Input type="number" value={p.elevation_m ?? ""} onChange={(e) => update({ elevation_m: e.target.value ? Number(e.target.value) : null })} className="mt-1" /></div>
        <div><Label>Variety</Label><Input placeholder="e.g. Caturra, SL28" value={p.variety ?? ""} onChange={(e) => update({ variety: e.target.value })} className="mt-1" /></div>
        <div><Label>Harvest year</Label><Input type="number" value={p.harvest_year ?? ""} onChange={(e) => update({ harvest_year: e.target.value ? Number(e.target.value) : null })} className="mt-1" /></div>
        <div className="md:col-span-2"><Label>Flavor notes (comma separated)</Label><Input value={p.flavor_notes.join(", ")} onChange={(e) => update({ flavor_notes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1" /></div>
        <div className="md:col-span-2"><Label>Brew recommendations (comma separated)</Label><Input value={p.brew_recommendations.join(", ")} onChange={(e) => update({ brew_recommendations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1" /></div>
        {WEIGHTS.map((w) => {
          const v = p.variants.find((x) => x.weight === w);
          if (!v) return null;
          return (
            <div key={w} className="grid grid-cols-2 gap-3">
              <div><Label>{w} price (Rs.)</Label><Input type="number" value={v.price_npr} onChange={(e) => update({ variants: p.variants.map((x) => x.weight === w ? { ...x, price_npr: Number(e.target.value) || 0 } : x) })} className="mt-1" /></div>
              <div><Label>{w} stock</Label><Input type="number" value={v.stock} onChange={(e) => update({ variants: p.variants.map((x) => x.weight === w ? { ...x, stock: Number(e.target.value) || 0 } : x) })} className="mt-1" /></div>
            </div>
          );
        })}
        <div className="flex items-center gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.active} onChange={(e) => update({ active: e.target.checked })} className="accent-espresso" /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.featured} onChange={(e) => update({ featured: e.target.checked })} className="accent-espresso" /> Featured</label>
        </div>
        <div className="flex justify-between gap-2 md:col-span-2">
          <Button onClick={save} className="bg-espresso text-cream hover:bg-espresso/90">Save changes</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete {p.name}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the product and its variants.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </details>
  );
}

// ============ GALLERY ============
function GalleryTab() {
  const qc = useQueryClient();
  const { data: images = [] } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchGallery });
  const [uploading, setUploading] = useState(false);

  const onUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const url = await uploadImage("gallery", f);
        await supabase.from("gallery_images").insert({ image_url: url });
      }
      toast({ title: "Uploaded" });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const remove = async (id: string, url: string) => {
    await deleteImage("gallery", url).catch(() => {});
    await supabase.from("gallery_images").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-espresso px-4 py-2 text-sm text-cream hover:bg-espresso/90">
        <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photos"}
        <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files && onUpload(e.target.files)} />
      </label>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border bg-background">
            <img src={img.image_url} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <button onClick={() => remove(img.id, img.image_url)} className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-destructive opacity-0 transition-opacity group-hover:opacity-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No photos yet.</p>}
      </div>
    </div>
  );
}

// ============ BRANDING ============
function BrandingTab() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });
  const [name, setName] = useState("");
  useEffect(() => { if (settings) setName(settings.brand_name); }, [settings]);

  if (!settings) return null;

  const onUpload = async (file: File) => {
    try {
      if (settings.logo_url) await deleteImage("branding", settings.logo_url).catch(() => {});
      const url = await uploadImage("branding", file, "logo");
      await supabase.from("settings").update({ logo_url: url }).eq("id", 1);
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Logo updated" });
    } catch (e: any) { toast({ title: "Upload failed", description: e?.message, variant: "destructive" }); }
  };

  const removeLogo = async () => {
    if (settings.logo_url) await deleteImage("branding", settings.logo_url).catch(() => {});
    await supabase.from("settings").update({ logo_url: null }).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const saveName = async () => {
    await supabase.from("settings").update({ brand_name: name }).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
    toast({ title: "Brand name saved" });
  };

  return (
    <div className="grid max-w-2xl gap-6 rounded-lg border border-border bg-background p-6">
      <div>
        <Label>Brand name</Label>
        <div className="mt-1 flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={saveName}>Save</Button></div>
      </div>
      <div>
        <Label>Logo</Label>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-20 w-40 items-center justify-center rounded-md border border-border bg-cream">
            {settings.logo_url ? <img src={settings.logo_url} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground">No logo</span>}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </label>
          {settings.logo_url && <Button variant="outline" onClick={removeLogo}>Remove</Button>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">PNG with transparent background works best. Max 2MB.</p>
      </div>
    </div>
  );
}

// ============ COUPONS ============
function CouponsTab() {
  const qc = useQueryClient();
  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("code")).data ?? [],
  });
  const [draft, setDraft] = useState({ code: "", type: "percent" as "percent" | "flat", value: 10, active: true });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  const add = async () => {
    if (!draft.code.trim()) return;
    await supabase.from("coupons").upsert({ ...draft, code: draft.code.trim().toUpperCase() });
    setDraft({ code: "", type: "percent", value: 10, active: true });
    refresh();
  };
  const remove = async (code: string) => { await supabase.from("coupons").delete().eq("code", code); refresh(); };
  const toggle = async (c: any) => { await supabase.from("coupons").update({ active: !c.active }).eq("code", c.code); refresh(); };

  return (
    <div>
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="font-serif text-lg">New coupon</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Input placeholder="CODE" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as any })} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (Rs.)</option>
          </select>
          <Input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) || 0 })} />
          <Button onClick={add} className="bg-espresso text-cream hover:bg-espresso/90">Add</Button>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {coupons.map((c: any) => (
          <div key={c.code} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
            <div>
              <div className="font-mono font-medium">{c.code}</div>
              <div className="text-xs text-muted-foreground">{c.type === "percent" ? `${c.value}% off` : `Rs. ${c.value} off`}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={c.active ? "default" : "outline"} onClick={() => toggle(c)}>{c.active ? "Active" : "Inactive"}</Button>
              <Button size="sm" variant="outline" onClick={() => remove(c.code)}>Delete</Button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-muted-foreground">No coupons yet.</p>}
      </div>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => { if (data) setS(data); }, [data]);
  if (!s) return null;

  const save = async () => {
    const { error } = await supabase.from("settings").update({
      whatsapp_number: s.whatsapp_number, wholesale_whatsapp: s.wholesale_whatsapp,
      shipping_flat_rate: s.shipping_flat_rate, free_shipping_threshold: s.free_shipping_threshold,
      bank_details: s.bank_details, contact_email: s.contact_email, contact_phone: s.contact_phone,
      pickup_address: s.pickup_address, instagram_url: s.instagram_url, facebook_url: s.facebook_url,
      notification_email: s.notification_email,
    }).eq("id", 1);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
    toast({ title: "Settings saved" });
  };

  return (
    <div className="grid max-w-3xl gap-4 rounded-lg border border-border bg-background p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>WhatsApp number (digits, with country code)</Label><Input value={s.whatsapp_number} onChange={(e) => setS({ ...s, whatsapp_number: e.target.value.replace(/\D/g, "") })} className="mt-1" /></div>
        <div><Label>Wholesale WhatsApp (optional)</Label><Input value={s.wholesale_whatsapp ?? ""} onChange={(e) => setS({ ...s, wholesale_whatsapp: e.target.value.replace(/\D/g, "") || null })} className="mt-1" /></div>
        <div><Label>Flat shipping rate (Rs.)</Label><Input type="number" value={s.shipping_flat_rate} onChange={(e) => setS({ ...s, shipping_flat_rate: Number(e.target.value) || 0 })} className="mt-1" /></div>
        <div><Label>Free shipping threshold (Rs.)</Label><Input type="number" value={s.free_shipping_threshold} onChange={(e) => setS({ ...s, free_shipping_threshold: Number(e.target.value) || 0 })} className="mt-1" /></div>
        <div><Label>Contact phone</Label><Input value={s.contact_phone ?? ""} onChange={(e) => setS({ ...s, contact_phone: e.target.value })} className="mt-1" /></div>
        <div><Label>Contact email</Label><Input value={s.contact_email} onChange={(e) => setS({ ...s, contact_email: e.target.value })} className="mt-1" /></div>
        <div><Label>Notification email (orders/inquiries)</Label><Input value={s.notification_email} onChange={(e) => setS({ ...s, notification_email: e.target.value })} className="mt-1" /></div>
        <div><Label>Pickup address</Label><Input value={s.pickup_address ?? ""} onChange={(e) => setS({ ...s, pickup_address: e.target.value })} className="mt-1" /></div>
        <div><Label>Instagram URL</Label><Input value={s.instagram_url ?? ""} onChange={(e) => setS({ ...s, instagram_url: e.target.value })} className="mt-1" /></div>
        <div><Label>Facebook URL</Label><Input value={s.facebook_url ?? ""} onChange={(e) => setS({ ...s, facebook_url: e.target.value })} className="mt-1" /></div>
      </div>
      <div><Label>Bank transfer details</Label><Textarea value={s.bank_details} rows={5} onChange={(e) => setS({ ...s, bank_details: e.target.value })} className="mt-1 font-mono text-xs" /></div>
      <Button onClick={save} className="bg-espresso text-cream hover:bg-espresso/90">Save settings</Button>
    </div>
  );
}

// ============ TESTIMONIALS ============
function TestimonialsTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("testimonials").select("*").order("sort_order").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<any>({ kind: "testimonial", author: "", role: "", quote: "", logo_url: "", sort_order: 0, active: true });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); };

  const create = async () => {
    const payload: any = { ...draft };
    if (!payload.author) payload.author = null;
    if (!payload.role) payload.role = null;
    if (!payload.quote) payload.quote = null;
    if (!payload.logo_url) payload.logo_url = null;
    const { error } = await (supabase as any).from("testimonials").insert(payload);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setCreating(false);
    setDraft({ kind: "testimonial", author: "", role: "", quote: "", logo_url: "", sort_order: 0, active: true });
    refresh();
  };

  const onLogoUpload = async (file: File, id?: string) => {
    try {
      const url = await uploadImage("branding", file, `testimonial-${Date.now()}`);
      if (id) {
        await (supabase as any).from("testimonials").update({ logo_url: url }).eq("id", id);
      } else {
        setDraft({ ...draft, logo_url: url });
      }
      refresh();
      toast({ title: "Logo uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    await (supabase as any).from("testimonials").delete().eq("id", id);
    refresh();
  };
  const toggleActive = async (id: string, active: boolean) => {
    await (supabase as any).from("testimonials").update({ active }).eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} className="bg-espresso text-cream hover:bg-espresso/90">
          <Plus className="mr-2 h-4 w-4" /> Add testimonial / logo
        </Button>
      </div>
      {creating && (
        <div className="rounded-lg border border-dashed border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="testimonial">Customer testimonial</option>
                <option value="logo">Cafe / partner logo</option>
              </select>
            </div>
            <div><Label>Sort order</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} className="mt-1" /></div>
            {draft.kind === "testimonial" ? (
              <>
                <div><Label>Author</Label><Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} className="mt-1" /></div>
                <div><Label>Role / location</Label><Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Quote</Label><Textarea rows={3} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} className="mt-1" /></div>
              </>
            ) : (
              <>
                <div className="sm:col-span-2"><Label>Cafe / partner name</Label><Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} className="mt-1" /></div>
                <div className="sm:col-span-2">
                  <Label>Logo</Label>
                  <div className="mt-1 flex items-center gap-3">
                    {draft.logo_url && <img src={draft.logo_url} alt="" className="h-12 w-auto object-contain" />}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-secondary">
                      <Upload className="h-4 w-4" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onLogoUpload(e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={create} className="bg-espresso text-cream hover:bg-espresso/90">Create</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {items.length === 0 && !creating && <p className="text-muted-foreground">No testimonials yet.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((t: any) => (
          <div key={t.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.kind}</div>
                {t.kind === "testimonial" ? (
                  <>
                    <p className="mt-1 italic">"{t.quote}"</p>
                    <p className="mt-2 text-sm">— {t.author}{t.role ? `, ${t.role}` : ""}</p>
                  </>
                ) : (
                  <div className="mt-2 flex items-center gap-3">
                    {t.logo_url && <img src={t.logo_url} alt={t.author ?? ""} className="h-10 w-auto object-contain" />}
                    <span className="text-sm">{t.author}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant={t.active ? "default" : "outline"} onClick={() => toggleActive(t.id, !t.active)}>
                  {t.active ? "Active" : "Hidden"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
