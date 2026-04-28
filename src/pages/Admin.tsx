import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_PASSWORD, isAdminAuthed, setAdminAuthed,
  getOrders, updateOrderStatus, type OrderStatus,
  getProducts, saveProducts,
  getCoupons, saveCoupons, type Coupon,
  getSettings, saveSettings, type Settings,
  formatNPR,
} from "@/lib/store";
import type { Product, Variant } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const VARIANTS: Variant[] = ["250g", "500g", "1kg"];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => { setAuthed(isAdminAuthed()); }, []);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAuthed(true);
    } else {
      toast({ title: "Wrong password", variant: "destructive" });
    }
  };

  const logout = () => { setAdminAuthed(false); setAuthed(false); setPw(""); };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <form onSubmit={tryLogin} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="font-serif text-2xl text-espresso">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the admin password to continue.</p>
          <Label className="mt-6 block">Password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1" />
          <Button type="submit" className="mt-4 w-full bg-espresso text-cream hover:bg-espresso/90">Sign in</Button>
          <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-espresso">Masto Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/">View site</Link></Button>
            <Button onClick={logout} variant="outline" size="sm"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
          <TabsContent value="coupons" className="mt-6"><CouponsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState(() => getOrders());
  const refresh = () => setOrders(getOrders());

  const setStatus = (id: string, s: OrderStatus) => {
    updateOrderStatus(id, s); refresh();
  };

  if (orders.length === 0) {
    return <p className="text-muted-foreground">No orders yet. Orders placed in this browser will show here.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <details key={o.id} className="rounded-lg border border-border bg-background p-4">
          <summary className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <div className="font-mono text-sm">{o.id}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()} · {o.customer.name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatNPR(o.total)}</span>
              <StatusBadge status={o.status} />
            </div>
          </summary>
          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
              <div className="mt-1 text-sm">{o.customer.name}</div>
              <div className="text-sm">{o.customer.phone}</div>
              <div className="text-sm text-muted-foreground">{o.customer.address}</div>
              <div className="mt-3 text-xs text-muted-foreground">
                {o.delivery === "pickup" ? "Local pickup" : "Home delivery"} · {o.payment === "cod" ? "COD" : "Bank transfer"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</div>
              <ul className="mt-1 space-y-1 text-sm">
                {o.items.map((it) => (
                  <li key={`${it.slug}-${it.variant}`} className="flex justify-between gap-2">
                    <span>{it.name} ({it.variant}) × {it.qty}</span>
                    <span>{formatNPR(it.unitPrice * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["new", "confirmed", "fulfilled", "cancelled"] as OrderStatus[]).map((s) => (
              <Button key={s} size="sm" variant={o.status === s ? "default" : "outline"} onClick={() => setStatus(o.id, s)}>
                {s}
              </Button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    new: "bg-accent/15 text-accent",
    confirmed: "bg-secondary text-secondary-foreground",
    fulfilled: "bg-espresso text-cream",
    cancelled: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(() => getProducts());

  const update = (slug: string, patch: Partial<Product>) => {
    const next = products.map((p) => (p.slug === slug ? { ...p, ...patch } : p));
    setProducts(next); saveProducts(next);
  };

  return (
    <div className="space-y-3">
      {products.map((p) => (
        <details key={p.slug} className="rounded-lg border border-border bg-background p-4">
          <summary className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <div className="font-serif text-lg">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.roast} · {p.process}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Stock: {Object.values(p.stock).reduce((a, b) => a + b, 0)}</span>
              <span className={`text-xs ${p.active ? "text-accent" : "text-muted-foreground"}`}>{p.active ? "Active" : "Hidden"}</span>
            </div>
          </summary>
          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={p.name} onChange={(e) => update(p.slug, { name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Short note</Label>
              <Input value={p.shortNote} onChange={(e) => update(p.slug, { shortNote: e.target.value })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={p.description} rows={2} onChange={(e) => update(p.slug, { description: e.target.value })} className="mt-1" />
            </div>
            {VARIANTS.map((v) => (
              <div key={v} className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{v} price</Label>
                  <Input type="number" value={p.prices[v]} onChange={(e) => update(p.slug, { prices: { ...p.prices, [v]: Number(e.target.value) || 0 } })} className="mt-1" />
                </div>
                <div>
                  <Label>{v} stock</Label>
                  <Input type="number" value={p.stock[v]} onChange={(e) => update(p.slug, { stock: { ...p.stock, [v]: Number(e.target.value) || 0 } })} className="mt-1" />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.active} onChange={(e) => update(p.slug, { active: e.target.checked })} className="accent-espresso" />
                Active (visible on site)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.featured} onChange={(e) => update(p.slug, { featured: e.target.checked })} className="accent-espresso" />
                Featured on homepage
              </label>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => getCoupons());
  const [draft, setDraft] = useState<Coupon>({ code: "", type: "percent", value: 10, active: true });

  const persist = (next: Coupon[]) => { setCoupons(next); saveCoupons(next); };
  const add = () => {
    if (!draft.code.trim()) return;
    persist([...coupons.filter((c) => c.code.toLowerCase() !== draft.code.toLowerCase()), { ...draft, code: draft.code.trim().toUpperCase() }]);
    setDraft({ code: "", type: "percent", value: 10, active: true });
  };
  const remove = (code: string) => persist(coupons.filter((c) => c.code !== code));
  const toggle = (code: string) => persist(coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));

  return (
    <div>
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="font-serif text-lg">New coupon</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Input placeholder="CODE" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (Rs.)</option>
          </select>
          <Input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) || 0 })} />
          <Button onClick={add} className="bg-espresso text-cream hover:bg-espresso/90">Add</Button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {coupons.map((c) => (
          <div key={c.code} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
            <div>
              <div className="font-mono font-medium">{c.code}</div>
              <div className="text-xs text-muted-foreground">{c.type === "percent" ? `${c.value}% off` : `Rs. ${c.value} off`}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={c.active ? "default" : "outline"} onClick={() => toggle(c.code)}>
                {c.active ? "Active" : "Inactive"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(c.code)}>Delete</Button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-muted-foreground">No coupons yet.</p>}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [s, setS] = useState<Settings>(() => getSettings());
  const save = () => { saveSettings(s); toast({ title: "Settings saved" }); };

  return (
    <div className="grid max-w-2xl gap-4 rounded-lg border border-border bg-background p-6">
      <div>
        <Label>WhatsApp number (digits only, with country code)</Label>
        <Input value={s.whatsappNumber} onChange={(e) => setS({ ...s, whatsappNumber: e.target.value.replace(/\D/g, "") })} className="mt-1" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Flat shipping rate (Rs.)</Label>
          <Input type="number" value={s.shippingFlatRate} onChange={(e) => setS({ ...s, shippingFlatRate: Number(e.target.value) || 0 })} className="mt-1" />
        </div>
        <div>
          <Label>Free shipping threshold (Rs.)</Label>
          <Input type="number" value={s.freeShippingThreshold} onChange={(e) => setS({ ...s, freeShippingThreshold: Number(e.target.value) || 0 })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Contact phone</Label>
        <Input value={s.contactPhone} onChange={(e) => setS({ ...s, contactPhone: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label>Contact email</Label>
        <Input value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label>Pickup address</Label>
        <Input value={s.pickupAddress} onChange={(e) => setS({ ...s, pickupAddress: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label>Bank transfer details</Label>
        <Textarea value={s.bankDetails} rows={5} onChange={(e) => setS({ ...s, bankDetails: e.target.value })} className="mt-1 font-mono text-xs" />
      </div>
      <Button onClick={save} className="bg-espresso text-cream hover:bg-espresso/90">Save settings</Button>
    </div>
  );
}
