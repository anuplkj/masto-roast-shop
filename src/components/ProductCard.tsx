import { Link } from "react-router-dom";
import { formatNPR, startingPrice, type Product } from "@/lib/api";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:shadow-card"
    >
      <ProductImage className="aspect-square" label={product.process ?? undefined} src={product.image_url} alt={product.name} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-espresso group-hover:text-accent">
            {product.name}
          </h3>
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-medium">{formatNPR(startingPrice(product))}</div>
          </div>
        </div>
        {product.short_note && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.short_note}</p>}
        <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {product.roast && <span>{product.roast}</span>}
          {product.roast && product.origin && <span>•</span>}
          {product.origin && <span>{product.origin}</span>}
        </div>
      </div>
    </Link>
  );
}
