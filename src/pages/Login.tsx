import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(redirect);
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}${redirect}` },
      });
      if (error) throw error;
      toast({ title: "Account created", description: "Check your email to confirm your account." });
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}${redirect}` });
    if (result.error) {
      toast({ title: "Google sign in failed", description: String((result.error as any)?.message ?? result.error), variant: "destructive" });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Sign in" description="Sign in to view your Masto coffee order history." canonical="/login" noindex />
      <Header />
      <section className="container max-w-md py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
          <h1 className="font-serif text-3xl text-espresso">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to track your orders.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" autoComplete="email" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-espresso text-cream hover:bg-espresso/90">
                  {loading ? "Please wait…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" autoComplete="email" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-espresso text-cream hover:bg-espresso/90">
                  {loading ? "Please wait…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" onClick={google} disabled={loading} className="w-full">
            Continue with Google
          </Button>

          <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
