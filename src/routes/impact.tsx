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
    <main className="bg-[#f7f6f3]">
      <section className="overflow-hidden bg-[#003f32] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.18fr_0.82fr] lg:gap-6">
          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-[#a8e063]/60 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_0_18px_rgba(168,224,99,0.12)]">
              Live Marketplace Snapshot
            </div>
            <h1 className="mt-8 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-[3.4rem]">
              Give Materials a Second Life.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/86 sm:text-lg">
              We help businesses exchange surplus and recyclable materials instead of allowing
              usable resources to be unnecessarily discarded.
            </p>
          </div>

          <MyanmarMapGraphic />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {impactStats.map((stat) => (
            <article
              key={stat.label}
              className="min-h-28 rounded-2xl border border-black/5 bg-white px-5 py-6 shadow-[0_8px_22px_rgba(0,0,0,0.07)]"
            >
              <p className="font-display text-3xl font-semibold leading-none tracking-normal text-[#004934]">
                {stat.value}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase leading-5 text-neutral-500">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="mb-4 flex items-center gap-3 text-[#004934]">
          <BarChart3 className="size-6 fill-[#004934]/10 stroke-[2.5]" aria-hidden="true" />
          <h2 className="font-display text-base font-bold uppercase tracking-normal">
            Myanmar Market Context
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {marketContextCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.description}
                className="rounded-2xl border border-black/5 bg-white px-6 py-6 shadow-[0_8px_22px_rgba(0,0,0,0.055)]"
              >
                <div className="flex gap-5">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#00513b] text-white shadow-[inset_0_-10px_18px_rgba(0,0,0,0.16)]">
                    <Icon className="size-8" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[#004934]">
                      <p className="font-display text-3xl font-semibold leading-none tracking-normal">
                        {card.value}
                      </p>
                      {"valueSuffix" in card ? (
                        <p className="text-sm font-semibold text-[#1f3f32]">{card.valueSuffix}</p>
                      ) : null}
                    </div>
                    <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-neutral-900">
                      {card.description}
                    </p>
                    <div className="my-4 border-t border-dashed border-neutral-300" />
                    <p className="text-xs leading-5 text-neutral-500">
                      Market context - not SurplusHub results
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
    <div className="relative mx-auto min-h-[300px] w-full max-w-[560px] sm:min-h-[340px] lg:min-h-[360px]">
      <div
        className="absolute left-[2%] top-1/2 hidden aspect-square w-[72%] -translate-y-1/2 rounded-full border border-[#a8e063]/10 sm:block"
        aria-hidden="true"
      />
      <div
        className="absolute left-[8%] top-1/2 hidden aspect-square w-[58%] -translate-y-1/2 rounded-full border border-[#a8e063]/10 sm:block"
        aria-hidden="true"
      />
      <div
        className="absolute left-[14%] top-1/2 hidden aspect-square w-[44%] -translate-y-1/2 rounded-full border border-[#a8e063]/10 sm:block"
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 560 380"
        role="img"
        aria-label="Myanmar map with Mandalay, Yangon and Bago market markers"
        className="relative h-full min-h-[300px] w-full overflow-visible drop-shadow-[0_20px_28px_rgba(0,0,0,0.25)] sm:min-h-[340px] lg:min-h-[360px]"
      >
        <defs>
          <linearGradient
            id="myanmarFill"
            x1="146"
            x2="314"
            y1="22"
            y2="343"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#497d50" />
            <stop offset="0.45" stopColor="#286342" />
            <stop offset="1" stopColor="#123f34" />
          </linearGradient>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M249 18 267 33 276 58 266 77 278 96 264 119 275 143 254 172 265 190 252 220 268 247 256 269 266 299 252 323 259 358 240 335 235 298 219 274 223 245 208 229 208 205 190 193 199 173 186 154 191 128 177 110 188 88 185 62 204 45 218 21Z"
          fill="url(#myanmarFill)"
          stroke="#7eb86a"
          strokeWidth="2.5"
          filter="url(#softGlow)"
        />
        <path
          d="M199 173 164 189 135 181 113 156 132 137 160 134 186 154Z"
          fill="#245f3d"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path
          d="M208 205 169 217 136 208 117 222 129 245 165 250 199 237 223 245Z"
          fill="#1f5b3d"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path
          d="M191 128 159 116 143 95 160 76 185 62 188 88 177 110Z"
          fill="#2f7044"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path
          d="M254 172 293 164 323 177 312 202 279 208 265 190Z"
          fill="#245f3d"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path
          d="M252 220 291 235 303 262 285 282 266 299 256 269 268 247Z"
          fill="#1a5439"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path d="M249 18 224 7 207 18 218 21Z" fill="#5a8e58" stroke="#7eb86a" strokeWidth="2" />
        <path
          d="M240 335 230 362 236 374 246 356Z"
          fill="#113a31"
          stroke="#6ca966"
          strokeWidth="2"
        />
        <path
          d="M225 55 245 72M212 101 240 112M201 151 235 163M205 205 245 210M224 259 252 248M236 303 260 286"
          stroke="#79b46a"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />

        <LocationConnector x1={236} y1={114} x2={396} y2={72} />
        <LocationConnector x1={233} y1={216} x2={396} y2={170} />
        <LocationConnector x1={241} y1={260} x2={396} y2={252} />

        <Marker x={236} y={114} />
        <Marker x={233} y={216} />
        <Marker x={241} y={260} />
        <Marker x={396} y={72} />
        <Marker x={396} y={170} />
        <Marker x={396} y={252} />

        <MapLabel x={416} y={66} title="Mandalay" description="Industrial and trade hub" />
        <MapLabel
          x={416}
          y={164}
          title="Yangon"
          description="Largest market and collection network"
        />
        <MapLabel x={416} y={246} title="Bago" description="Collection and material aggregation" />
      </svg>
    </div>
  );
}

function LocationConnector({ x1, x2, y1, y2 }: { x1: number; x2: number; y1: number; y2: number }) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke="#d5f1a4"
      strokeDasharray="4 5"
      strokeLinecap="round"
      strokeOpacity="0.78"
      strokeWidth="1.7"
    />
  );
}

function Marker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#softGlow)">
      <path
        d="M0 -23C-7.2 -23 -12.8 -17.4 -12.8 -10.4C-12.8 -1.7 0 9.7 0 9.7S12.8 -1.7 12.8 -10.4C12.8 -17.4 7.2 -23 0 -23Z"
        fill="#a8e063"
        stroke="#a8e063"
        strokeWidth="2"
      />
      <circle r="3.2" fill="#003f32" />
    </g>
  );
}

function MapLabel({
  description,
  title,
  x,
  y,
}: {
  description: string;
  title: string;
  x: number;
  y: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text fill="#a8e063" fontFamily="Manrope, sans-serif" fontSize="17" fontWeight="800">
        {title}
      </text>
      <text
        fill="rgba(255,255,255,0.86)"
        fontFamily="Manrope, sans-serif"
        fontSize="13"
        fontWeight="500"
      >
        {description.split(" and ")[0]}
      </text>
      {description.includes(" and ") ? (
        <text
          y="17"
          fill="rgba(255,255,255,0.86)"
          fontFamily="Manrope, sans-serif"
          fontSize="13"
          fontWeight="500"
        >
          and {description.split(" and ")[1]}
        </text>
      ) : null}
    </g>
  );
}
