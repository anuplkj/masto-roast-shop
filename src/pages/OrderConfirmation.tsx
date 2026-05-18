import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { orderToWhatsappText, whatsappLink } from "@/lib/whatsapp";
import OrderSuccessDialog from "@/components/OrderSuccessDialog";

async function fetchOrder(id: string) {
  // Public-facing confirmation reads minimum needed via order_items insert echo.
  // Orders/order_items are admin-read only via RLS, so we read them through a public-safe edge function alternative:
  // For simplicity, we just pull from local data passed to /order/:id route. If access is denied, show generic confirmation.
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  return { order, items: items ?? [] };
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { data } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrder(id!), enabled: !!id });
  const { data: settings } = useSettings();

  const order = data?.order;
  const items = data?.items ?? [];

  const [successOpen, setSuccessOpen] = useState(false);
  useEffect(() => {
    if (params.get("success") === "1") {
      setSuccessOpen(true);
      params.delete("success");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container max-w-2xl py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
          <CheckCircle2 className="h-12 w-12 text-accent" strokeWidth={1.5} />
          <h1 className="mt-4 font-serif text-3xl text-espresso">Thank you — order received</h1>
          <p className="mt-2 text-muted-foreground">
            Order <span className="font-mono text-foreground">{(id ?? "").slice(0, 8).toUpperCase()}</span>. We'll be in touch shortly to confirm details and delivery.
          </p>

          {order && items.length > 0 && (
            <>
              <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
                {items.map((it: any) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{it.product_name} <span className="text-xs">({it.weight}) × {it.qty}</span></span>
                    <span>{formatNPR(it.unit_price * it.qty)}</span>
                  </div>
                ))}
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNPR(order.subtotal)}</dd></div>
                {order.discount > 0 && <div className="flex justify-between text-accent"><dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt><dd>−{formatNPR(order.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatNPR(order.shipping)}</dd></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-medium"><dt>Total</dt><dd>{formatNPR(order.total)}</dd></div>
              </dl>

              <div className="mt-6 grid gap-2 text-sm">
                <div><span className="text-muted-foreground">Delivering to: </span>{order.customer_name}, {order.customer_phone}</div>
                <div className="text-muted-foreground">{order.customer_address}</div>
                <div><span className="text-muted-foreground">Method: </span>{order.delivery === "pickup" ? "Local pickup" : "Home delivery"} · {order.payment === "cod" ? "Cash on Delivery" : "Bank Transfer"}</div>
              </div>

              {order.payment === "bank" && settings?.bank_details && (
                <div className="mt-6 rounded-md bg-secondary p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank transfer instructions</div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{settings.bank_details}</pre>
                  <p className="mt-2 text-xs text-muted-foreground">Please use order ID <strong>{(id ?? "").slice(0, 8).toUpperCase()}</strong> as the reference.</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {settings?.whatsapp_number && (
                  <Button asChild className="bg-espresso text-cream hover:bg-espresso/90">
                    <a href={whatsappLink(orderToWhatsappText({
                      id: (id ?? "").slice(0, 8).toUpperCase(),
                      customer: { name: order.customer_name, phone: order.customer_phone, address: order.customer_address ?? "" },
                      delivery: order.delivery,
                      payment: order.payment,
                      items: items.map((i: any) => ({ name: i.product_name, weight: i.weight, qty: i.qty, unitPrice: i.unit_price })),
                      subtotal: order.subtotal, shipping: order.shipping, discount: order.discount, couponCode: order.coupon_code, total: order.total,
                    }), settings.whatsapp_number)} target="_blank" rel="noopener">
                      <MessageCircle className="mr-2 h-4 w-4" /> Send order via WhatsApp
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline"><Link to="/shop">Continue shopping</Link></Button>
              </div>
            </>
          )}

          {!order && (
            <div className="mt-8">
              <Button asChild variant="outline"><Link to="/shop">Continue shopping</Link></Button>
            </div>
          )}
        </div>
      </section>
      <OrderSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} phone={order?.customer_phone} />
      <Footer />
    </div>
  );
}
