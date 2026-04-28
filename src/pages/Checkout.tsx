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
import { useSettings } from "@/hooks/useSettings";
import { fetchActiveCoupon, formatNPR } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { orderToWhatsappText, whatsappLink } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Required").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  address: z.string().trim().min(5, "Required").max(300),
  delivery: z.enum(["delivery", "pickup"]),
  payment: z.enum(["cod", "bank"]),
  coupon: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Checkout() {
  const { items, subtotal, clear, productsById } = useCart();
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | undefined>();
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "delivery", payment: "cod" },
  });

  const delivery = watch("delivery");
  const payment = watch("payment");
  const couponCode = watch("coupon");

  const flat = settings?.shipping_flat_rate ?? 200;
  const threshold = settings?.free_shipping_threshold ?? 3000;

  const shipping = useMemo(() => {
    if (delivery === "pickup" || subtotal === 0) return 0;
    return (subtotal - discount) >= threshold ? 0 : flat;
  }, [delivery, subtotal, discount, threshold, flat]);

  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async () => {
    setCouponMsg(null);
    if (!couponCode?.trim()) {
      setDiscount(0);
      setAppliedCode(undefined);
      return;
    }
    const c = await fetchActiveCoupon(couponCode);
    if (!c) {
      setDiscount(0);
      setAppliedCode(undefined);
      setCouponMsg("That coupon isn't valid.");
      return;
    }
    const d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
    setDiscount(d);
    setAppliedCode(c.code);
  };

  const onSubmit = async (v: FormValues) => {
    if (items.length === 0) {
      toast({ title: "Your cart is empty" });
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map((it) => {
        const p = productsById.get(it.productId);
        const variant = p?.variants.find((x) => x.weight === it.weight);
        return {
          product_id: it.productId,
          product_name: p?.name ?? "Unknown",
          weight: it.weight,
          qty: it.qty,
          unit_price: variant?.price_npr ?? 0,
        };
      });

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: v.name,
          customer_phone: v.phone,
          customer_address: v.address,
          delivery: v.delivery,
          payment: v.payment,
          notes: v.notes || null,
          subtotal,
          shipping,
          discount,
          coupon_code: appliedCode ?? null,
          total,
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;
      const orderId = orderRow.id;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        orderItems.map((i) => ({ ...i, order_id: orderId }))
      );
      if (itemsErr) throw itemsErr;

      // Fire-and-forget email notification
      supabase.functions.invoke("send-order-notification", { body: { orderId } }).catch(() => {});

      // Open WhatsApp with summary
      if (settings?.whatsapp_number) {
        const text = orderToWhatsappText({
          id: orderId.slice(0, 8).toUpperCase(),
          customer: { name: v.name, phone: v.phone, address: v.address },
          delivery: v.delivery,
          payment: v.payment,
          items: orderItems.map((i) => ({ name: i.product_name, weight: i.weight, qty: i.qty, unitPrice: i.unit_price })),
          subtotal, shipping, discount, couponCode: appliedCode, total,
        });
        window.open(whatsappLink(text, settings.whatsapp_number), "_blank", "noopener");
      }

      clear();
      navigate(`/order/${orderId}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Could not place order", description: e?.message ?? "Please try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
                <Radio label="Home delivery" sub={`${formatNPR(flat)} · free over ${formatNPR(threshold)}`} {...register("delivery")} value="delivery" />
                <Radio label="Local pickup" sub={settings?.pickup_address ?? "Roastery pickup"} {...register("delivery")} value="pickup" />
              </div>
            </Card>

            <Card title="Payment">
              <div className="grid gap-3 sm:grid-cols-2">
                <Radio label="Cash on Delivery" sub="Pay when your order arrives" {...register("payment")} value="cod" />
                <Radio label="Bank Transfer" sub="Manual transfer instructions" {...register("payment")} value="bank" />
              </div>
              {payment === "bank" && settings?.bank_details && (
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-secondary p-4 text-xs text-secondary-foreground">{settings.bank_details}</pre>
              )}
            </Card>

            <Card title="Coupon (optional)">
              <div className="flex gap-2">
                <Input placeholder="e.g. WELCOME10" {...register("coupon")} />
                <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
              {appliedCode && <p className="mt-2 text-xs text-accent">Applied: {appliedCode} (−{formatNPR(discount)})</p>}
              {couponMsg && !appliedCode && <p className="mt-2 text-xs text-destructive">{couponMsg}</p>}
            </Card>

            <Card title="Order notes (optional)">
              <Textarea rows={2} {...register("notes")} placeholder="Anything we should know?" />
            </Card>
          </div>

          <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-xl text-espresso">Summary</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((it) => {
                const p = productsById.get(it.productId);
                const variant = p?.variants.find((x) => x.weight === it.weight);
                if (!p || !variant) return null;
                return (
                  <li key={`${it.productId}-${it.weight}`} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{p.name} <span className="text-xs">({it.weight}) × {it.qty}</span></span>
                    <span>{formatNPR(variant.price_npr * it.qty)}</span>
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
            <Button type="submit" size="lg" className="mt-6 w-full bg-espresso text-cream hover:bg-espresso/90" disabled={submitting || items.length === 0}>
              <MessageCircle className="mr-2 h-4 w-4" /> {submitting ? "Placing…" : "Place order"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">We'll open WhatsApp to confirm your order.</p>
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
