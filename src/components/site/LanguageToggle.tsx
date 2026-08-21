import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Language, useLanguage } from "@/lib/i18n";

const OPTIONS: { value: Language; labelKey: "language.english" | "language.myanmar" }[] = [
  { value: "en", labelKey: "language.english" },
  { value: "my", labelKey: "language.myanmar" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-border bg-background p-1",
        className,
      )}
      role="group"
      aria-label={t("language.label")}
    >
      <Languages className="ml-1 size-4 text-muted-foreground" aria-hidden="true" />
      {OPTIONS.map((option) => {
        const isActive = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            title={
              option.value === "en" ? t("language.switchToEnglish") : t("language.switchToMyanmar")
            }
            onClick={() => setLanguage(option.value)}
            className={cn(
              "h-7 min-w-9 rounded px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
