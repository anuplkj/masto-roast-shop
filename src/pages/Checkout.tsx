import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import {
  formatNPR, getCoupons, getProduct, getSettings, saveOrder, saveProducts, getProducts, type Order,
} from "@/lib/store";
import { orderToWhatsappText, whatsappLink } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Required").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  address: z.string().trim().min(5, "Required").max(300),
  delivery: z.enum(["delivery", "pickup"]),
  payment: z.enum(["cod", "bank"]),
  coupon: z.string().trim().max(40).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const settings = getSettings();
  const navigate = useNavigate();
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "delivery", payment: "cod" },
  });

  const delivery = watch("delivery");
  const payment = watch("payment");
  const couponCode = watch("coupon");

  const { discount, appliedCode } = useMemo(() => {
    if (!couponCode) return { discount: 0, appliedCode: undefined as string | undefined };
    const c = getCoupons().find((x) => x.active && x.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (!c) return { discount: 0, appliedCode: undefined };
    const d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
    return { discount: d, appliedCode: c.code };
  }, [couponCode, subtotal]);

  const shipping = delivery === "pickup" || subtotal === 0
    ? 0
    : (subtotal - discount) >= settings.freeShippingThreshold ? 0 : settings.shippingFlatRate;
  const total = Math.max(0, subtotal - discount + shipping);

  const onSubmit = (v: FormValues) => {
    if (items.length === 0) {
      toast({ title: "Your cart is empty" });
      return;
    }
    if (couponCode && !appliedCode) {
      setCouponMsg("That coupon isn't valid.");
      return;
    }

    const id = `MAS-${Date.now().toString(36).toUpperCase()}`;
    const orderItems = items.map((it) => {
      const p = getProduct(it.slug)!;
      return { slug: it.slug, name: p.name, variant: it.variant, qty: it.qty, unitPrice: p.prices[it.variant] };
    });

    const order: Order = {
      id, createdAt: Date.now(),
      customer: { name: v.name, phone: v.phone, address: v.address },
      delivery: v.delivery, payment: v.payment,
      items: orderItems,
      subtotal, shipping, discount,
      couponCode: appliedCode,
      total, status: "new",
    };
    saveOrder(order);

    // decrement local stock
    const updated = getProducts().map((p) => {
      const next = { ...p, stock: { ...p.stock } };
      for (const it of items) if (it.slug === p.slug) next.stock[it.variant] = Math.max(0, next.stock[it.variant] - it.qty);
      return next;
    });
    saveProducts(updated);

    // open whatsapp
    window.open(whatsappLink(orderToWhatsappText(order)), "_blank", "noopener");
    clear();
    navigate(`/order/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-12">
        <h1 className="font-serif text-4xl text-espresso">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card title="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name?.message}>
                  <Input {...register("name")} />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <Input type="tel" {...register("phone")} />
                </Field>
              </div>
              <Field label="Address" error={errors.address?.message}>
                <Textarea rows={3} {...register("address")} placeholder="Street, area, city" />
              </Field>
            </Card>

            <Card title="Delivery">
              <div className="grid gap-3 sm:grid-cols-2">
                <Radio label="Home delivery" sub={`${formatNPR(settings.shippingFlatRate)} · free over ${formatNPR(settings.freeShippingThreshold)}`} {...register("delivery")} value="delivery" />
                <Radio label="Local pickup" sub={settings.pickupAddress} {...register("delivery")} value="pickup" />
              </div>
            </Card>

            <Card title="Payment">
              <div className="grid gap-3 sm:grid-cols-2">
                <Radio label="Cash on Delivery" sub="Pay when your order arrives" {...register("payment")} value="cod" />
                <Radio label="Bank Transfer" sub="Manual transfer instructions" {...register("payment")} value="bank" />
              </div>
              {payment === "bank" && (
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-secondary p-4 text-xs text-secondary-foreground">{settings.bankDetails}</pre>
              )}
            </Card>

            <Card title="Coupon (optional)">
              <Input placeholder="e.g. WELCOME10" {...register("coupon")} />
              {appliedCode && <p className="mt-2 text-xs text-accent">Applied: {appliedCode} (−{formatNPR(discount)})</p>}
              {couponMsg && !appliedCode && <p className="mt-2 text-xs text-destructive">{couponMsg}</p>}
            </Card>
          </div>

          <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-xl text-espresso">Summary</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <li key={`${it.slug}-${it.variant}`} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{p.name} <span className="text-xs">({it.variant}) × {it.qty}</span></span>
                    <span>{formatNPR(p.prices[it.variant] * it.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNPR(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-accent"><dt>Discount</dt><dd>−{formatNPR(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatNPR(shipping)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium"><dt>Total</dt><dd>{formatNPR(total)}</dd></div>
            </dl>
            <Button type="submit" size="lg" className="mt-6 w-full bg-espresso text-cream hover:bg-espresso/90" disabled={isSubmitting || items.length === 0}>
              <MessageCircle className="mr-2 h-4 w-4" /> Place order
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">We'll open WhatsApp with your order to confirm.</p>
          </aside>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="font-serif text-xl text-espresso">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-foreground/85">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const Radio = ({ label, sub, value, ...rest }: any) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 has-[:checked]:border-espresso has-[:checked]:bg-secondary/40">
    <input type="radio" value={value} {...rest} className="mt-1 accent-espresso" />
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  </label>
);
