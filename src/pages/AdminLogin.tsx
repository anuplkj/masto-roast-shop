import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "You are now signed in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate("/admin");
    } catch (e: any) {
      toast({ title: "Authentication failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-soft">
        <h1 className="font-serif text-2xl text-espresso">Admin {mode === "signup" ? "signup" : "sign in"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create the first admin account. The first signup automatically becomes admin."
            : "Sign in to manage products, orders and inquiries."}
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" autoComplete="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="mt-5 w-full bg-espresso text-cream hover:bg-espresso/90">
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "First time? Create the admin account →" : "Already have an account? Sign in →"}
        </button>

        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
      </form>
    </div>
  );
}
