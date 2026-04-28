import { getSettings } from "@/lib/store";
import type { Order } from "@/lib/store";

export function whatsappLink(text: string, numberOverride?: string) {
  const num = numberOverride ?? getSettings().whatsappNumber;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function orderToWhatsappText(order: Order): string {
  const lines: string[] = [];
  lines.push(`*New Order — Masto Roastery*`);
  lines.push(`Order ID: ${order.id}`);
  lines.push("");
  lines.push(`*Customer*`);
  lines.push(`Name: ${order.customer.name}`);
  lines.push(`Phone: ${order.customer.phone}`);
  lines.push(`Address: ${order.customer.address}`);
  lines.push("");
  lines.push(`*Items*`);
  for (const it of order.items) {
    lines.push(`• ${it.name} (${it.variant}) × ${it.qty} — Rs. ${(it.unitPrice * it.qty).toLocaleString("en-IN")}`);
  }
  lines.push("");
  lines.push(`Subtotal: Rs. ${order.subtotal.toLocaleString("en-IN")}`);
  if (order.discount > 0) lines.push(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}: -Rs. ${order.discount.toLocaleString("en-IN")}`);
  lines.push(`Shipping: ${order.shipping === 0 ? "Free" : `Rs. ${order.shipping.toLocaleString("en-IN")}`}`);
  lines.push(`*Total: Rs. ${order.total.toLocaleString("en-IN")}*`);
  lines.push("");
  lines.push(`Delivery: ${order.delivery === "pickup" ? "Local pickup" : "Home delivery"}`);
  lines.push(`Payment: ${order.payment === "cod" ? "Cash on Delivery" : "Bank Transfer"}`);
  return lines.join("\n");
}
