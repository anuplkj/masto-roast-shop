import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { whatsappLink } from "@/lib/whatsapp";

export default function WhatsAppFloat() {
  const { data: s } = useSettings();
  if (!s?.whatsapp_number) return null;
  const href = whatsappLink("Hi Masto, I have a question about your coffee.", s.whatsapp_number);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
