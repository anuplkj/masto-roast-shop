import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductImage from "@/components/ProductImage";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatNPR } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";

export default function Cart() {
  const { items, update, remove, subtotal, productsById } = useCart();
  const { data: settings } = useSettings();
  const flat = settings?.shipping_flat_rate ?? 200;
  const threshold = settings?.free_shipping_threshold ?? 3000;
  const shipping = subtotal === 0 ? 0 : subtotal >= threshold ? 0 : flat;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-12">
        <h1 className="font-serif text-4xl text-espresso">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-6"><Link to="/shop">Shop coffee</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => {
                const p = productsById.get(it.productId);
                if (!p) return null;
                const v = p.variants.find((x) => x.weight === it.weight);
                if (!v) return null;
                return (
                  <div key={`${it.productId}-${it.weight}`} className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
                    <ProductImage className="h-24 w-24 shrink-0 rounded-md" src={p.image_url} alt={p.name} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${p.slug}`} className="font-serif text-lg text-espresso hover:text-accent">{p.name}</Link>
                          <div className="text-xs text-muted-foreground">{it.weight}{p.roast ? ` · ${p.roast}` : ""}</div>
                        </div>
                        <button onClick={() => remove(it.productId, it.weight)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button onClick={() => update(it.productId, it.weight, it.qty - 1)} className="px-2 py-1.5 hover:bg-secondary"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center text-sm">{it.qty}</span>
                          <button onClick={() => update(it.productId, it.weight, it.qty + 1)} className="px-2 py-1.5 hover:bg-secondary"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="font-medium">{formatNPR(v.price_npr * it.qty)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-xl text-espresso">Order summary</h2>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNPR(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatNPR(shipping)}</dd></div>
                {subtotal > 0 && shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatNPR(threshold - subtotal)} more for free shipping.
                  </p>
                )}
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-medium">
                  <dt>Total</dt><dd>{formatNPR(total)}</dd>
                </div>
              </dl>
              <Button asChild size="lg" className="mt-6 w-full bg-espresso text-cream hover:bg-espresso/90">
                <Link to="/checkout">Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </aside>
          </div>
        )}
      </section>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
