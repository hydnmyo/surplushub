import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-forest-foreground/70">
            A circular B2B marketplace connecting businesses that have materials with businesses
            that need them. Built for Myanmar industry.
          </p>
        </div>
        <FooterCol
          title="Marketplace"
          links={[
            { to: "/marketplace", label: "Browse Materials" },
            { to: "/wanted", label: "Material Wanted" },
            { to: "/businesses", label: "Verified Businesses" },
            { to: "/dashboard", label: "Sell Surplus" },
          ]}
        />
        <FooterCol
          title="Platform"
          links={[
            { to: "/how-it-works", label: "How It Works" },
            { to: "/trust", label: "Trust & Safety" },
            { to: "/about", label: "About & Business Model" },
          ]}
        />
        <FooterCol
          title="Access"
          links={[
            { to: "/dashboard", label: "Business Dashboard" },
            { to: "/admin", label: "Admin Console" },
            { to: "/auth", label: "Login / Sign Up" },
          ]}
        />
      </div>
      <div className="border-t border-forest-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-forest-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 SurplusHub Myanmar.</p>
          <p>Yangon · Mandalay · Bago</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-forest-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-forest-foreground/70 transition-colors hover:text-forest-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
