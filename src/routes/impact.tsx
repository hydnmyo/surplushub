import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Building2, Factory, Users } from "lucide-react";
import { BUSINESSES, CATEGORIES, LISTINGS, TRANSACTIONS } from "@/lib/data";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Circular Impact - Give Materials a Second Life | SurplusHub" },
      {
        name: "description",
        content:
          "Current marketplace metrics showing active surplus listings, participating businesses, completed transactions and recovered value.",
      },
      { property: "og:title", content: "Circular Impact - SurplusHub" },
      {
        property: "og:description",
        content: "Give materials a second life instead of discarding usable resources.",
      },
    ],
  }),
  component: Impact,
});

const marketContextCards = [
  {
    icon: Users,
    value: "47,210",
    description: "Registered private industrial enterprises",
  },
  {
    icon: Building2,
    value: "8,541",
    valueSuffix: "Yangon  •  7,137 Mandalay",
    description: "Registered industrial enterprises in the two main markets",
  },
  {
    icon: Factory,
    value: "1,577",
    description: "Registered rubber & plastic product enterprises",
  },
] as const;

function Impact() {
  const activeListings = LISTINGS.filter((listing) => listing.status === "Active");
  const completedTransactions = TRANSACTIONS.filter(
    (transaction) => transaction.status === "Completed",
  );
  const completedValue = completedTransactions.reduce(
    (total, transaction) => total + transaction.value,
    0,
  );

  const impactStats = [
    { value: String(CATEGORIES.length), label: "Material categories" },
    { value: String(BUSINESSES.length), label: "Businesses connected" },
    { value: String(completedTransactions.length), label: "Completed transactions" },
    { value: `${(completedValue / 1_000_000).toFixed(2)}M MMK`, label: "Surplus value recovered" },
    { value: String(activeListings.length), label: "Active listings" },
  ];

  return (
    <main className="bg-[#f5f2ef]">
      <section className="overflow-hidden bg-[#003f32] text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-8 sm:px-8 md:px-12 lg:min-h-[330px] lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] lg:gap-12 lg:px-14 xl:px-16">
          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-[#a8e063]/60 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium leading-none text-white shadow-[inset_0_0_18px_rgba(168,224,99,0.12)] sm:text-sm">
              Live Marketplace Snapshot
            </div>
            <h1 className="mt-7 max-w-[620px] font-display text-[clamp(1.75rem,3.5vw,2.375rem)] font-semibold leading-[1.14] tracking-normal text-white">
              Give Materials a Second Life.
            </h1>
            <p className="mt-4 max-w-[620px] text-[clamp(0.875rem,1.15vw,1rem)] leading-[1.6] text-white/86">
              We help businesses exchange surplus and recyclable materials instead of allowing
              usable resources to be unnecessarily discarded.
            </p>
          </div>

          <MyanmarMapGraphic />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-7 pt-6 sm:px-8 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {impactStats.map((stat) => (
            <article
              key={stat.label}
              className="min-h-[108px] rounded-[12px] border border-black/5 bg-white px-4 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
            >
              <p className="font-display text-[clamp(1.5rem,2vw,1.75rem)] font-semibold leading-none tracking-normal text-[#004934]">
                {stat.value}
              </p>
              <p className="mt-3.5 text-[10px] font-semibold uppercase leading-5 text-neutral-500 xl:whitespace-nowrap">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-14 sm:px-8 md:px-12 lg:px-14 xl:px-16">
        <div className="mb-4 flex items-center gap-3 text-[#004934]">
          <BarChart3 className="size-5 fill-[#004934]/10 stroke-[2.6]" aria-hidden="true" />
          <h2 className="font-display text-sm font-bold uppercase tracking-normal">
            Myanmar Market Context
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {marketContextCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.description}
                className="rounded-[12px] border border-black/5 bg-white px-5 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.07)]"
              >
                <div className="flex gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#00513b] text-white shadow-[inset_0_-10px_18px_rgba(0,0,0,0.16)] lg:size-[58px]">
                    <Icon className="size-6 lg:size-7" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[#004934]">
                      <p className="font-display text-[clamp(1.25rem,1.8vw,1.5rem)] font-semibold leading-none tracking-normal">
                        {card.value}
                      </p>
                      {"valueSuffix" in card ? (
                        <p className="text-xs font-semibold text-[#1f3f32]">
                          {card.valueSuffix.replace("\u00e2\u20ac\u00a2", "\u2022")}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-1.5 max-w-xs text-xs font-semibold leading-5 text-neutral-900">
                      {card.description}
                    </p>
                    <div className="my-4 border-t border-dashed border-neutral-300" />
                    <p className="text-xs leading-5 text-neutral-500">
                      Market context — not SurplusHub results
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function MyanmarMapGraphic() {
  return (
    <div className="relative mx-auto flex min-h-[240px] w-full max-w-[430px] items-center justify-center sm:min-h-[280px] lg:min-h-[300px]">
      <img
        src="/images/myanmar-impact-map.png"
        alt="Detailed Myanmar circular market map"
        className="h-auto w-full max-w-[420px] object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}
