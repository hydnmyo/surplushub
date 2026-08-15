import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          onDark ? "bg-forest-foreground/15 text-forest-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Recycle className="size-5" />
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