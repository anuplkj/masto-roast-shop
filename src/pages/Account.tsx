import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatNPR } from "@/lib/api";

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/account");
  }, [user, loading, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-background">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My account" description="Your Masto coffee order history." canonical="/account" noindex />
      <Header />
      <section className="container max-w-4xl py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-espresso">My orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && orders.length === 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              <Button asChild className="mt-4 bg-espresso text-cream hover:bg-espresso/90">
                <Link to="/shop">Browse coffee</Link>
              </Button>
            </div>
          )}
          {orders.map((o: any) => (
            <Link
              key={o.id}
              to={`/order/${o.id}`}
              className="block rounded-xl border border-border/60 bg-card p-5 transition hover:border-espresso/40 hover:shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <ul className="mt-2 text-sm">
                    {(o.items ?? []).map((it: any) => (
                      <li key={it.id} className="text-foreground/85">
                        {it.product_name} <span className="text-muted-foreground">({it.weight}) × {it.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-serif text-xl text-espresso">{formatNPR(o.total)}</div>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                    {o.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
