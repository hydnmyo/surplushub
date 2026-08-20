import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/surplushub-logo.jpg.asset.json";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white transition-transform group-hover:scale-105">
        <img src={logoAsset.url} alt="SurplusHub logo" className="size-9 object-contain" />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-semibold tracking-tight",
            onDark ? "text-forest-foreground" : "text-foreground",
          )}
        >
          SurplusHub
        </span>
        <span
          className={cn(
            "block text-[10px] font-medium uppercase tracking-[0.16em]",
            onDark ? "text-forest-foreground/60" : "text-muted-foreground",
          )}
        >
          Circular B2B
        </span>
      </span>
    </Link>
  );
}