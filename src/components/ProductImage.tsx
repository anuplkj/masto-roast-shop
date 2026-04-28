import { Coffee } from "lucide-react";

interface Props {
  className?: string;
  label?: string;
  src?: string | null;
  alt?: string;
}

export default function ProductImage({ className = "", label, src, alt }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-secondary ${className}`}>
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
        {label && (
          <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-espresso backdrop-blur">
            {label}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-beige to-secondary ${className}`}>
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(hsl(var(--espresso)/0.25)_1px,transparent_1px)] [background-size:14px_14px]" />
      <Coffee className="relative h-1/3 w-1/3 text-espresso/60" strokeWidth={1.25} />
      {label && (
        <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-espresso backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}
