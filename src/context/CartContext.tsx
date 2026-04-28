import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type Product, type Weight } from "@/lib/api";

const KEY = "masto.cart.v2";

export interface CartItem {
  productId: string;
  slug: string;
  weight: Weight;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (productId: string, slug: string, weight: Weight, qty?: number) => void;
  update: (productId: string, weight: Weight, qty: number) => void;
  remove: (productId: string, weight: Weight) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  productsById: Map<string, Product>;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStored());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const productsById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const add = useCallback((productId: string, slug: string, weight: Weight, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.weight === weight);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productId, slug, weight, qty }];
    });
  }, []);

  const update = useCallback((productId: string, weight: Weight, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.weight === weight ? { ...i, qty } : i)).filter((i) => i.qty > 0)
    );
  }, []);

  const remove = useCallback((productId: string, weight: Weight) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.weight === weight)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const it of items) {
      const p = productsById.get(it.productId);
      if (!p) {
        c += it.qty;
        continue;
      }
      const v = p.variants.find((x) => x.weight === it.weight);
      if (!v) continue;
      c += it.qty;
      s += v.price_npr * it.qty;
    }
    return { count: c, subtotal: s };
  }, [items, productsById]);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear, count, subtotal, productsById, loading: isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
