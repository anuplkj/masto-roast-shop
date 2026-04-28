import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coffee, Flame, Leaf, Phone, MessageCircle, MapPin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, getSettings } from "@/lib/store";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";

const wholesaleSchema = z.object({
  name: z.string().trim().min(2, "Required").max(80),
  business: z.string().trim().min(2, "Required").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  monthly: z.string().trim().min(1, "Required").max(60),
  notes: z.string().trim().max(500).optional(),
});
type WholesaleForm = z.infer<typeof wholesaleSchema>;

export default function Index() {
  const settings = getSettings();
  const featured = getProducts().filter((p) => p.featured && p.active).slice(0, 6);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WholesaleForm>({
    resolver: zodResolver(wholesaleSchema),
  });
  const [submitted, setSubmitted] = useState(false);

  const onWholesale = (data: WholesaleForm) => {
    const text =
      `*Wholesale Inquiry — Masto Roastery*\n` +
      `Name: ${data.name}\nBusiness: ${data.business}\nPhone: ${data.phone}\n` +
      `Monthly requirement: ${data.monthly}\n` +
      (data.notes ? `Notes: ${data.notes}` : "");
    window.open(whatsappLink(text), "_blank", "noopener");
    setSubmitted(true);
    reset();
    toast({ title: "Inquiry ready to send", description: "WhatsApp opened in a new tab." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-cream">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="container relative grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cream/80">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" /> Roasted in Nepal
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-cream md:text-6xl lg:text-7xl">
              Masto Artisan<br />Roastery
            </h1>
            <p className="mt-5 max-w-md text-lg text-cream/75">
              Roasted with tradition, crafted for taste. Small-batch specialty coffee from the highlands of Nepal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cream text-espresso hover:bg-cream/90">
                <Link to="/shop">Shop Coffee <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                <a href="#story">Our story</a>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-full bg-gradient-to-br from-terracotta/30 to-espresso/40 p-12 backdrop-blur">
              <div className="flex h-full w-full items-center justify-center rounded-full border border-cream/15">
                <Coffee className="h-32 w-32 text-cream/40" strokeWidth={0.8} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Featured</div>
            <h2 className="mt-2 font-serif text-4xl text-espresso">This week's roast</h2>
          </div>
          <Link to="/shop" className="hidden text-sm font-medium text-foreground/75 hover:text-accent md:inline">
            View all coffee →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-beige/40 py-20">
        <div className="container grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our story</div>
            <h2 className="mt-2 font-serif text-4xl text-espresso">Roasted slowly, the old way</h2>
            <p className="mt-5 text-foreground/75">
              We're a tiny roastery in Kathmandu Valley, working directly with farmers in the hills of Ilam, Gulmi and Sindhuli. Every batch is roasted in small drums, cupped the same week it's roasted, and shipped within days.
            </p>
            <p className="mt-4 text-foreground/75">
              No shortcuts. No old beans. Just careful work, honest sourcing, and a cup we'd be proud to drink ourselves.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-espresso to-[hsl(22_45%_14%)]">
            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="flex h-full items-center justify-center">
              <Flame className="h-24 w-24 text-terracotta/60" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* Freshness callout */}
      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Flame, title: "Roasted to order", body: "We roast after you order, never before. Coffee leaves our roastery within 48 hours." },
            { icon: Leaf, title: "Single-origin sourcing", body: "Direct relationships with Nepali farmers — traceable lots, fair prices, premium quality." },
            { icon: Coffee, title: "Cupped & approved", body: "Every batch is tasted by our team before it ships. If we wouldn't drink it, you won't either." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border/60 bg-card p-7 shadow-card">
              <Icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 font-serif text-xl text-espresso">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wholesale */}
      <section id="wholesale" className="bg-espresso py-20 text-cream">
        <div className="container grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Wholesale</div>
            <h2 className="mt-2 font-serif text-4xl">For cafés & restaurants</h2>
            <p className="mt-5 text-cream/75">
              Looking for a reliable roaster for your shop? We supply specialty coffee to cafés across Nepal — bespoke blends, training, and steady weekly delivery.
            </p>
            <p className="mt-4 text-cream/75">Tell us a bit about your business and we'll be in touch within a day.</p>
          </div>
          <form onSubmit={handleSubmit(onWholesale)} className="md:col-span-3 grid gap-4 rounded-xl border border-cream/15 bg-cream/5 p-6 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="ws-name" className="text-cream/85">Your name</Label>
                <Input id="ws-name" {...register("name")} className="mt-1 border-cream/20 bg-cream/5 text-cream placeholder:text-cream/40" />
                {errors.name && <p className="mt-1 text-xs text-terracotta">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="ws-business" className="text-cream/85">Business name</Label>
                <Input id="ws-business" {...register("business")} className="mt-1 border-cream/20 bg-cream/5 text-cream placeholder:text-cream/40" />
                {errors.business && <p className="mt-1 text-xs text-terracotta">{errors.business.message}</p>}
              </div>
              <div>
                <Label htmlFor="ws-phone" className="text-cream/85">Phone</Label>
                <Input id="ws-phone" {...register("phone")} className="mt-1 border-cream/20 bg-cream/5 text-cream placeholder:text-cream/40" />
                {errors.phone && <p className="mt-1 text-xs text-terracotta">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="ws-monthly" className="text-cream/85">Monthly requirement</Label>
                <Input id="ws-monthly" placeholder="e.g. 10kg" {...register("monthly")} className="mt-1 border-cream/20 bg-cream/5 text-cream placeholder:text-cream/40" />
                {errors.monthly && <p className="mt-1 text-xs text-terracotta">{errors.monthly.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="ws-notes" className="text-cream/85">Anything else? (optional)</Label>
              <Textarea id="ws-notes" rows={3} {...register("notes")} className="mt-1 border-cream/20 bg-cream/5 text-cream placeholder:text-cream/40" />
            </div>
            <Button type="submit" size="lg" className="bg-terracotta text-cream hover:bg-terracotta/90">
              <MessageCircle className="mr-2 h-4 w-4" /> Send via WhatsApp
            </Button>
            {submitted && <p className="text-sm text-cream/70">Thanks — we'll be in touch soon.</p>}
          </form>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</div>
            <h2 className="mt-2 font-serif text-4xl text-espresso">Come say hello</h2>
            <p className="mt-4 max-w-md text-foreground/75">
              Questions about a coffee, a brew method, or your order? Reach out — a real human will reply.
            </p>
          </div>
          <div className="grid gap-3">
            <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
              <Phone className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                <div className="font-medium">{settings.contactPhone}</div>
              </div>
            </a>
            <a href={whatsappLink("Hi Masto, I have a question.")} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
              <MessageCircle className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</div>
                <div className="font-medium">Chat with us</div>
              </div>
            </a>
            <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-medium">{settings.contactEmail}</div>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4">
              <MapPin className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Roastery</div>
                <div className="font-medium">{settings.pickupAddress}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
