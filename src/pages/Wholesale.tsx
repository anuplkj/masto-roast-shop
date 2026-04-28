import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  business: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  monthly_demand: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Wholesale() {
  const { data: settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("wholesale_inquiries").insert({
        name: v.name, business: v.business, phone: v.phone,
        monthly_demand: v.monthly_demand, notes: v.notes || null,
      }).select("id").single();
      if (error) throw error;
      supabase.functions.invoke("send-wholesale-notification", { body: { inquiryId: data.id } }).catch(() => {});
      setSubmitted(true);
      reset();
      toast({ title: "Inquiry sent", description: "We'll be in touch within a day." });
    } catch (e: any) {
      toast({ title: "Could not send", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const wa = settings?.wholesale_whatsapp || settings?.whatsapp_number || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-espresso py-16 text-cream md:py-24">
        <div className="container">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Wholesale</div>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">For cafés, restaurants & offices</h1>
          <p className="mt-5 max-w-2xl text-cream/75">
            We supply specialty coffee to partners across Nepal — bespoke blends, barista training, consistent quality, and reliable weekly delivery.
          </p>
          {wa && (
            <Button asChild size="lg" className="mt-8 bg-terracotta text-cream hover:bg-terracotta/90">
              <a href={whatsappLink("Hi Masto, I'd like to discuss a wholesale order.", wa)} target="_blank" rel="noopener">
                <MessageCircle className="mr-2 h-4 w-4" /> Contact on WhatsApp
              </a>
            </Button>
          )}
        </div>
      </section>

      <section className="container grid gap-12 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl text-espresso">What you get</h2>
          <ul className="mt-6 space-y-4 text-foreground/80">
            <li><strong>Fresh roast schedule.</strong> Roasted to your weekly delivery — never sitting on a shelf.</li>
            <li><strong>Bespoke blends.</strong> We can develop a signature espresso for your café.</li>
            <li><strong>Barista training.</strong> Free dial-in support and on-site training for partner cafés.</li>
            <li><strong>Wholesale pricing.</strong> Tiered pricing based on monthly volume.</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl text-espresso">Inquiry form</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Your name</Label>
              <Input {...register("name")} className="mt-1" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Contact number</Label>
              <Input type="tel" {...register("phone")} className="mt-1" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Business name</Label>
              <Input {...register("business")} className="mt-1" />
              {errors.business && <p className="mt-1 text-xs text-destructive">{errors.business.message}</p>}
            </div>
            <div>
              <Label>Estimated monthly demand</Label>
              <Input placeholder="e.g. 10kg / month" {...register("monthly_demand")} className="mt-1" />
              {errors.monthly_demand && <p className="mt-1 text-xs text-destructive">{errors.monthly_demand.message}</p>}
            </div>
          </div>
          <div>
            <Label>Anything else? (optional)</Label>
            <Textarea rows={3} {...register("notes")} className="mt-1" />
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="bg-espresso text-cream hover:bg-espresso/90">
            {submitting ? "Sending…" : "Send inquiry"}
          </Button>
          {submitted && <p className="text-sm text-accent">Thanks — we'll be in touch shortly.</p>}
        </form>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
