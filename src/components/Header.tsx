import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/shop", label: "Shop" },
  { to: "/story", label: "Story" },
  { to: "/wholesale", label: "Wholesale" },
  { to: "/#contact", label: "Contact" },
];

export default function Header() {
  const { count } = useCart();
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} className="h-9 w-auto object-contain" />
          ) : (
            <>
              <span className="font-serif text-xl font-semibold tracking-tight text-espresso">Masto</span>
              <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
                Artisan Roastery
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-foreground/75 transition-colors hover:text-foreground",
                  isActive && "text-foreground"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col py-2">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
