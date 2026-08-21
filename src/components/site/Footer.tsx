import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-forest-foreground/70">
            {t("footer.description")}
          </p>
        </div>
        <FooterCol
          title={t("footer.marketplace")}
          links={[
            { to: "/marketplace", label: t("footer.browseMaterials") },
            { to: "/wanted", label: t("nav.wanted") },
            { to: "/businesses", label: t("footer.verifiedBusinesses") },
            { to: "/dashboard", label: t("footer.sellSurplus") },
          ]}
        />
        <FooterCol
          title={t("footer.platform")}
          links={[
            { to: "/how-it-works", label: t("nav.howItWorks") },
            { to: "/trust", label: t("nav.trust") },
            { to: "/about", label: t("footer.aboutBusinessModel") },
          ]}
        />
        <FooterCol
          title={t("footer.access")}
          links={[
            { to: "/dashboard", label: t("account.businessDashboard") },
            { to: "/admin", label: t("account.adminConsole") },
            { to: "/auth", label: t("footer.loginSignUp") },
          ]}
        />
      </div>
      <div className="border-t border-forest-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-forest-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footer.copyright")}</p>
          <p>{t("footer.cities")}</p>
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
