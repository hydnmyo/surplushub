import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const { t } = useLanguage();

  return (
    <Link to="/" className={cn("group flex items-center gap-3", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white transition-transform group-hover:scale-105 sm:size-[52px]">
        <img
          src="/images/surplushub-logo.png"
          alt="SurplusHub logo"
          className="h-full w-full object-cover"
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
          {t("logo.tagline")}
        </span>
      </span>
    </Link>
  );
}
