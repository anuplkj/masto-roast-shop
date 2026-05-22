import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function useRequireAdmin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/admin/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      toast({ title: "Admin access only", variant: "destructive" });
      navigate("/", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  return { ready: !loading && !!user && isAdmin, loading };
}
