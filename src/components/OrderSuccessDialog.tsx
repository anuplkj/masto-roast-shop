import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  phone?: string | null;
  onConfirm?: () => void;
}

export default function OrderSuccessDialog({ open, onOpenChange, phone, onConfirm }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const go = (to: string) => {
    onConfirm?.();
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onConfirm?.(); onOpenChange(v); }}>
      <DialogContent className="border-border/60 bg-card" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-8 w-8 text-accent" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-center font-serif text-2xl text-espresso">
            Order Placed Successfully
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            We will call you{phone ? <> at <span className="font-medium text-foreground">{phone}</span></> : ""} within 24 hours to confirm your fresh roast.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row sm:justify-center">
          {user && (
            <Button variant="outline" onClick={() => go("/account")}>
              View my orders
            </Button>
          )}
          <Button className="bg-espresso text-cream hover:bg-espresso/90" onClick={() => go("/shop")}>
            Return to Shop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
