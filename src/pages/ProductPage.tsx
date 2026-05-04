import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { fetchProductBySlug, fetchProducts, formatNPR, type Weight } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { add } = useCart();
  const [weight, setWeight] = useState<Weight>("250g");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product?.variants.length) {
      const inStock = product.variants.find((v) => v.stock > 0);
      setWeight((inStock ?? product.variants[0]).weight);
    }
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.active && p.id !== product.id).slice(0, 3);
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <h1 className="font-serif text-3xl">Coffee not found</h1>
          <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const variant = product.variants.find((v) => v.weight === weight) ?? product.variants[0];
  const stock = variant?.stock ?? 0;
  const price = variant?.price_npr ?? 0;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    if (!variant) return;
    add(product.id, product.slug, variant.weight, qty);
    toast({ title: "Added to cart", description: `${product.name} (${variant.weight}) × ${qty}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All coffee
        </Link>
      </div>

      <section className="container grid gap-10 pb-16 md:grid-cols-2">
        <ProductImage className="aspect-square rounded-2xl" label={product.process ?? undefined} src={product.image_url} alt={product.name} />

        <div>
          {product.origin && <div className="text-xs uppercase tracking-[0.2em] text-accent">{product.origin}</div>}
          <h1 className="mt-2 font-serif text-4xl leading-tight text-espresso md:text-5xl">{product.name}</h1>
          {product.short_note && <p className="mt-3 text-lg text-muted-foreground">{product.short_note}</p>}

          <div className="mt-6 text-3xl font-medium">{formatNPR(price)}</div>
          {outOfStock ? (
            <div className="mt-1 text-sm text-destructive">Out of stock</div>
          ) : stock <= 5 ? (
            <div className="mt-1 text-sm text-accent">Only {stock} left</div>
          ) : null}

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</div>
            <div className="mt-2 flex gap-2">
              {product.variants.map((v) => {
                const isOOS = v.stock <= 0;
                return (
                  <button
                    key={v.weight}
                    onClick={() => { setWeight(v.weight); setQty(1); }}
                    disabled={isOOS}
                    className={`relative rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                      weight === v.weight ? "border-espresso bg-espresso text-cream" : "border-border hover:border-espresso/50"
                    }`}
                  >
                    {v.weight}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</div>
            <div className="mt-2 inline-flex items-center rounded-md border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock || 99, q + 1))} className="px-3 py-2 hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <Button size="lg" className="mt-6 w-full bg-espresso text-cream hover:bg-espresso/90" onClick={handleAdd} disabled={outOfStock}>
            <ShoppingBag className="mr-2 h-4 w-4" /> {outOfStock ? "Out of stock" : `Add to cart — ${formatNPR(price * qty)}`}
          </Button>

          <div className="mt-10 grid gap-6 border-t border-border/60 pt-8 sm:grid-cols-2">
            {product.roast && <DetailBlock title="Roast">{product.roast}</DetailBlock>}
            {product.process && <DetailBlock title="Process">{product.process}</DetailBlock>}
            {product.flavor_notes.length > 0 && <DetailBlock title="Flavor notes">{product.flavor_notes.join(" · ")}</DetailBlock>}
            {product.brew_recommendations.length > 0 && <DetailBlock title="Brew recommendations">{product.brew_recommendations.join(", ")}</DetailBlock>}
          </div>

          {product.description && <p className="mt-8 text-foreground/75">{product.description}</p>}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
