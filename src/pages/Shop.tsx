import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/store";
import { Button } from "@/components/ui/button";

const ROASTS = ["Light", "Medium", "Medium-Dark", "Dark"] as const;
const PROCESSES = ["Washed", "Natural"] as const;

export default function Shop() {
  const all = getProducts().filter((p) => p.active);
  const [roast, setRoast] = useState<string | null>(null);
  const [proc, setProc] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return all.filter((p) =>
      (!roast || p.roast === roast) && (!proc || p.process === proc)
    );
  }, [all, roast, proc]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-12 md:py-16">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Shop</div>
        <h1 className="mt-2 font-serif text-4xl text-espresso md:text-5xl">All Coffee</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Single-origin lots and signature blends — all small-batch and roasted to order.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Roast:</span>
          <FilterChip label="All" active={!roast} onClick={() => setRoast(null)} />
          {ROASTS.map((r) => (
            <FilterChip key={r} label={r} active={roast === r} onClick={() => setRoast(r)} />
          ))}
          <span className="ml-4 text-xs uppercase tracking-wider text-muted-foreground">Process:</span>
          <FilterChip label="All" active={!proc} onClick={() => setProc(null)} />
          {PROCESSES.map((r) => (
            <FilterChip key={r} label={r} active={proc === r} onClick={() => setProc(r)} />
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No coffees match those filters.</p>
        )}
      </section>
      <Footer />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={active ? "bg-espresso text-cream hover:bg-espresso/90" : ""}
    >
      {label}
    </Button>
  );
}
