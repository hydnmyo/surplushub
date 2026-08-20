import { useOrders } from "@/components/orders/OrderProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryName, formatMMK, type CategoryId } from "@/lib/data";

type RevenueTotals = {
  orderCount: number;
  sellerFees: number;
  buyerFees: number;
};

const EMPTY_TOTALS: RevenueTotals = { orderCount: 0, sellerFees: 0, buyerFees: 0 };

const grossRevenue = ({ sellerFees, buyerFees }: RevenueTotals) => sellerFees + buyerFees;

export function RevenueSummary() {
  const { orders } = useOrders();
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");

  const totals = completedOrders.reduce<RevenueTotals>(
    (summary, order) => ({
      orderCount: summary.orderCount + 1,
      sellerFees: summary.sellerFees + order.totals.sellerFee,
      buyerFees: summary.buyerFees + order.totals.buyerFee,
    }),
    EMPTY_TOTALS,
  );

  const byCategory = Object.entries(
    completedOrders.reduce<Partial<Record<CategoryId, RevenueTotals>>>((summary, order) => {
      const current = summary[order.category] ?? EMPTY_TOTALS;
      summary[order.category] = {
        orderCount: current.orderCount + 1,
        sellerFees: current.sellerFees + order.totals.sellerFee,
        buyerFees: current.buyerFees + order.totals.buyerFee,
      };
      return summary;
    }, {}),
  )
    .map(([category, categoryTotals]) => ({
      category: category as CategoryId,
      totals: categoryTotals,
    }))
    .sort((left, right) => grossRevenue(right.totals) - grossRevenue(left.totals));

  const summaryCards = [
    { label: "Seller success fees", value: totals.sellerFees },
    { label: "Buyer service fees", value: totals.buyerFees },
    { label: "Gross platform revenue", value: grossRevenue(totals) },
  ];

  return (
    <section aria-labelledby="revenue-summary-heading">
      <div>
        <h2 id="revenue-summary-heading" className="font-display text-2xl font-semibold">
          Revenue summary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recognized fees from {totals.orderCount} completed{" "}
          {totals.orderCount === 1 ? "order" : "orders"}.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="surface-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-primary">
              {formatMMK(card.value)}
            </p>
          </article>
        ))}
      </div>

      <div className="surface-card mt-5 overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-lg font-semibold">Revenue by material category</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Gross revenue is always the sum of seller and buyer fees.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Category</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Seller fees</TableHead>
              <TableHead className="text-right">Buyer fees</TableHead>
              <TableHead className="pr-5 text-right">Gross revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byCategory.length > 0 ? (
              byCategory.map(({ category, totals: categoryTotals }) => (
                <TableRow key={category}>
                  <TableCell className="pl-5 font-medium">{categoryName(category)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {categoryTotals.orderCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMMK(categoryTotals.sellerFees)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMMK(categoryTotals.buyerFees)}
                  </TableCell>
                  <TableCell className="pr-5 text-right font-semibold tabular-nums">
                    {formatMMK(grossRevenue(categoryTotals))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Revenue appears after the first order is completed.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
