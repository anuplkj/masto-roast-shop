import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { fetchGallery } from "@/lib/api";

export default function Story() {
  const { data: images = [] } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-beige/40 py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our story</div>
          <h1 className="mt-2 font-serif text-4xl text-espresso md:text-5xl">Roasted with Tradition, Crafted for Taste</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Masto Artisan Roastery began as a tiny drum roaster in the back of a Kathmandu workshop. A few friends, a passion for honest coffee, and a belief that Nepal's hills could grow some of the world's most exciting beans.
            </p>
            <p>
              Today we work directly with farmers in Ilam, Gulmi, Kaski and Sindhuli — paying premium prices for premium lots, processing carefully, and roasting in small batches that we taste before they ship.
            </p>
            <p>
              Every bag you buy supports a farmer, a roaster, and a small team that genuinely cares about the cup in front of you.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-serif text-3xl text-espresso">From the roastery</h2>
        <p className="mt-2 text-muted-foreground">A glimpse into our process and people.</p>
        {images.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">Photos coming soon.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Masto roastery"}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                {img.caption && <figcaption className="p-3 text-sm text-muted-foreground">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
