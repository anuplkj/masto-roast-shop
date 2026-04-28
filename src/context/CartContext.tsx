import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCart, getProduct, saveCart, type CartItem } from "@/lib/store";
import type { Variant } from "@/data/products";

interface CartContextValue {
  items: CartItem[];
  add: (slug: string, variant: Variant, qty?: number) => void;
  update: (slug: string, variant: Variant, qty: number) => void;
  remove: (slug: string, variant: Variant) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const add = useCallback((slug: string, variant: Variant, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.slug === slug && i.variant === variant);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { slug, variant, qty }];
    });
  }, []);

  const update = useCallback((slug: string, variant: Variant, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug && i.variant === variant ? { ...i, qty } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const remove = useCallback((slug: string, variant: Variant) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variant === variant)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const it of items) {
      const p = getProduct(it.slug);
      if (!p) continue;
      c += it.qty;
      s += (p.prices[it.variant] ?? 0) * it.qty;
    }
    return { count: c, subtotal: s };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
