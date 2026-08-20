import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/favicon.png";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 items-center justify-center bg-transparent transition-transform group-hover:scale-105">
        <img
          src={LOGO_SRC}
          alt="SurplusHub logo"
          className="h-8 w-8 bg-transparent object-contain"
        />
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
