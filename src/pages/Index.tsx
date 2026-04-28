import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Coffee, Flame, Leaf, Phone, MessageCircle, MapPin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { fetchProducts } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";
import { whatsappLink } from "@/lib/whatsapp";

export default function Index() {
  const { data: settings } = useSettings();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const featured = products.filter((p) => p.featured && p.active).slice(0, 6);
  const wa = settings?.whatsapp_number ?? "";

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
              {settings?.brand_name ?? "Masto Artisan Roastery"}
            </h1>
            <p className="mt-5 max-w-md text-lg text-cream/75">
              Roasted with tradition, crafted for taste. Small-batch specialty coffee from the highlands of Nepal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cream text-espresso hover:bg-cream/90">
                <Link to="/shop">Shop Coffee <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                <Link to="/story">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-full bg-gradient-to-br from-terracotta/30 to-espresso/40 p-12 backdrop-blur">
              <div className="flex h-full w-full items-center justify-center rounded-full border border-cream/15">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt={settings.brand_name} className="max-h-3/4 max-w-3/4 object-contain" />
                ) : (
                  <Coffee className="h-32 w-32 text-cream/40" strokeWidth={0.8} />
                )}
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
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Story snippet */}
      <section className="bg-beige/40 py-20">
        <div className="container grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our story</div>
            <h2 className="mt-2 font-serif text-4xl text-espresso">Roasted slowly, the old way</h2>
            <p className="mt-5 text-foreground/75">
              We're a tiny roastery in Kathmandu Valley, working directly with farmers in the hills of Ilam, Gulmi and Sindhuli. Every batch is roasted in small drums, cupped the same week it's roasted, and shipped within days.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/story">Read our story <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-espresso to-[hsl(22_45%_14%)]">
            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="flex h-full items-center justify-center">
              <Flame className="h-24 w-24 text-terracotta/60" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* Freshness */}
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

      {/* Wholesale CTA */}
      <section className="bg-espresso py-20 text-cream">
        <div className="container grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Wholesale</div>
            <h2 className="mt-2 font-serif text-4xl">For cafés & restaurants</h2>
            <p className="mt-5 text-cream/75">
              Looking for a reliable roaster for your shop? We supply specialty coffee to cafés across Nepal — bespoke blends, training, and steady weekly delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg" className="bg-terracotta text-cream hover:bg-terracotta/90">
              <Link to="/wholesale">Wholesale inquiries <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            {wa && (
              <Button asChild size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                <a href={whatsappLink("Hi Masto, I'd like to inquire about wholesale.", settings?.wholesale_whatsapp || wa)} target="_blank" rel="noopener">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp us
                </a>
              </Button>
            )}
          </div>
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
            {settings?.contact_phone && (
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
                <Phone className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                  <div className="font-medium">{settings.contact_phone}</div>
                </div>
              </a>
            )}
            {wa && (
              <a href={whatsappLink("Hi Masto, I have a question.", wa)} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
                <MessageCircle className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</div>
                  <div className="font-medium">Chat with us</div>
                </div>
              </a>
            )}
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 hover:shadow-card">
                <Mail className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                  <div className="font-medium">{settings.contact_email}</div>
                </div>
              </a>
            )}
            {settings?.pickup_address && (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4">
                <MapPin className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Roastery</div>
                  <div className="font-medium">{settings.pickup_address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
