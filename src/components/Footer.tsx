import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function Footer() {
  const { data: s } = useSettings();
  return (
    <footer className="mt-24 border-t border-border/60 bg-beige/40">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl text-espresso">{s?.brand_name ?? "Masto Artisan Roastery"}</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Small-batch specialty coffee, roasted to order in Nepal.
          </p>
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Follow us</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {s?.instagram_url && (
                <a
                  href={s.instagram_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm text-espresso transition-colors hover:border-accent hover:text-accent"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {s?.facebook_url && (
                <a
                  href={s.facebook_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm text-espresso transition-colors hover:border-accent hover:text-accent"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-accent">All coffee</Link></li>
            <li><Link to="/cart" className="hover:text-accent">Cart</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/story" className="hover:text-accent">Our story</Link></li>
            <li><Link to="/wholesale" className="hover:text-accent">Wholesale</Link></li>
            <li><a href="/#contact" className="hover:text-accent">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Get in touch</div>
          <ul className="mt-3 space-y-2 text-sm">
            {s?.contact_phone && <li>{s.contact_phone}</li>}
            {s?.contact_email && <li>{s.contact_email}</li>}
            {s?.pickup_address && <li className="text-muted-foreground">{s.pickup_address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {s?.brand_name ?? "Masto Artisan Roastery"}. Roasted with tradition, crafted for taste.
      </div>
    </footer>
  );
}
