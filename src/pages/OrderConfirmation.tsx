import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { formatNPR, getOrder, getSettings } from "@/lib/store";
import { orderToWhatsappText, whatsappLink } from "@/lib/whatsapp";

export default function OrderConfirmation() {
  const { id } = useParams();
  const order = id ? getOrder(id) : undefined;
  const settings = getSettings();

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <h1 className="font-serif text-3xl">Order not found</h1>
          <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container max-w-2xl py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
          <CheckCircle2 className="h-12 w-12 text-accent" strokeWidth={1.5} />
          <h1 className="mt-4 font-serif text-3xl text-espresso">Thank you — order received</h1>
          <p className="mt-2 text-muted-foreground">
            Order <span className="font-mono text-foreground">{order.id}</span>. We'll call you shortly to confirm details and delivery.
          </p>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
            {order.items.map((it) => (
              <div key={`${it.slug}-${it.variant}`} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{it.name} <span className="text-xs">({it.variant}) × {it.qty}</span></span>
                <span>{formatNPR(it.unitPrice * it.qty)}</span>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNPR(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-accent"><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>−{formatNPR(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatNPR(order.shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium"><dt>Total</dt><dd>{formatNPR(order.total)}</dd></div>
          </dl>

          <div className="mt-6 grid gap-2 text-sm">
            <div><span className="text-muted-foreground">Delivering to: </span>{order.customer.name}, {order.customer.phone}</div>
            <div className="text-muted-foreground">{order.customer.address}</div>
            <div><span className="text-muted-foreground">Method: </span>{order.delivery === "pickup" ? "Local pickup" : "Home delivery"} · {order.payment === "cod" ? "Cash on Delivery" : "Bank Transfer"}</div>
          </div>

          {order.payment === "bank" && (
            <div className="mt-6 rounded-md bg-secondary p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank transfer instructions</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{settings.bankDetails}</pre>
              <p className="mt-2 text-xs text-muted-foreground">Please use order ID <strong>{order.id}</strong> as the reference.</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-espresso text-cream hover:bg-espresso/90">
              <a href={whatsappLink(orderToWhatsappText(order))} target="_blank" rel="noopener">
                <MessageCircle className="mr-2 h-4 w-4" /> Send order via WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline"><Link to="/shop">Continue shopping</Link></Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
