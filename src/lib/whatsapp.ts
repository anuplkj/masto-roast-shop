export function whatsappLink(text: string, number: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export interface WhatsAppOrderInput {
  id: string;
  customer: { name: string; phone: string; address: string };
  delivery: "delivery" | "pickup";
  payment: "cod" | "bank";
  items: { name: string; weight: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string | null;
  total: number;
}

export function orderToWhatsappText(order: WhatsAppOrderInput): string {
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
    lines.push(`• ${it.name} (${it.weight}) × ${it.qty} — Rs. ${(it.unitPrice * it.qty).toLocaleString("en-IN")}`);
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
