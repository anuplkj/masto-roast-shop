import { Link } from "react-router-dom";
import { getSettings } from "@/lib/store";

export default function Footer() {
  const s = getSettings();
  return (
    <footer className="mt-24 border-t border-border/60 bg-beige/40">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl text-espresso">Masto</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Small-batch specialty coffee, roasted to order in Nepal.
          </p>
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
            <li><a href="/#wholesale" className="hover:text-accent">Wholesale</a></li>
            <li><a href="/#contact" className="hover:text-accent">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Get in touch</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{s.contactPhone}</li>
            <li>{s.contactEmail}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Masto Artisan Roastery. Roasted with tradition, crafted for taste.
      </div>
    </footer>
  );
}
