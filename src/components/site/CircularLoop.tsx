import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Business has surplus", desc: "Unused stock, offcuts, excess inventory" },
  { title: "List material", desc: "Photos, quantity, condition, price" },
  { title: "Another business discovers it", desc: "Search, filters, category browsing" },
  { title: "AI matches supply & demand", desc: "EcoMatch AI scores relevance" },
  { title: "Connect & negotiate", desc: "Requests, offers, inspection" },
  { title: "Transaction", desc: "Deal created, QR verified" },
  { title: "Material reused / recycled", desc: "Back into production" },
  { title: "Value created", desc: "Revenue for sellers, savings for buyers" },
];

export function CircularLoop({ onDark = false }: { onDark?: boolean }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li
          key={s.title}
          className={cn(
            "relative rounded-2xl border p-4 transition-transform hover:-translate-y-0.5",
            onDark
              ? "border-forest-foreground/15 bg-forest-foreground/5"
              : "border-border bg-card shadow-[var(--shadow-card)]",
          )}
        >
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lg font-display text-xs font-semibold",
              onDark ? "bg-emerald text-primary-foreground" : "bg-mint text-accent-foreground",
            )}
          >
            {i + 1}
          </span>
          <h3
            className={cn(
              "mt-3 font-display text-sm font-semibold uppercase tracking-wide",
              onDark ? "text-forest-foreground" : "text-foreground",
            )}
          >
            {s.title}
          </h3>
          <p className={cn("mt-1 text-xs", onDark ? "text-forest-foreground/65" : "text-muted-foreground")}>
            {s.desc}
          </p>
          {i < STEPS.length - 1 && (
            <span
              className={cn(
                "absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border-r border-t lg:block",
                onDark ? "border-forest-foreground/25" : "border-border",
                (i + 1) % 4 === 0 && "lg:hidden",
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}