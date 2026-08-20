import { AlertTriangle, Check, CircleDot } from "lucide-react";
import { ORDER_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

type OrderTimelineProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderTimeline({ status, className }: OrderTimelineProps) {
  const currentIndex = ORDER_FLOW.indexOf(status);
  const isException = currentIndex === -1;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ORDER_FLOW.map((step, index) => {
          const isComplete = !isException && index < currentIndex;
          const isCurrent = !isException && index === currentIndex;
          const isUpcoming = isException || index > currentIndex;

          return (
            <div
              key={step}
              className={cn(
                "relative flex min-h-24 flex-col gap-3 rounded-md border p-3",
                isComplete && "border-primary/30 bg-mint/60",
                isCurrent && "border-primary bg-primary/5 shadow-sm",
                isUpcoming && "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  isUpcoming && "border-border bg-background text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <CircleDot className="size-4" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold">{ORDER_STATUS_LABELS[step]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isComplete ? "Done" : isCurrent ? "Current" : "Upcoming"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isException ? (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-semibold text-destructive">{ORDER_STATUS_LABELS[status]}</p>
            <p className="mt-1 text-muted-foreground">
              This order has left the standard fulfillment path.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
