import { languageNames } from "@/frontend/i18n";
import { locales, type Locale } from "@/shared/i18n/locales";

type LanguageSwitchProps = {
  locale: Locale;
  label: string;
  alternates: Record<Locale, string>;
};

export function LanguageSwitch({
  locale,
  label,
  alternates,
}: LanguageSwitchProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex">
        {locales.map((candidate) => {
          const isCurrent = candidate === locale;
          return (
            <li key={candidate}>
              {/* A plain link on purpose: the full page load renders the new <html lang>. */}
              <a
                href={alternates[candidate]}
                hrefLang={candidate}
                lang={candidate}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex size-11 items-center justify-center text-xs tracking-[0.12em] ${
                  isCurrent
                    ? "font-semibold text-ink underline underline-offset-[5px]"
                    : "font-medium text-muted hover:text-ink"
                }`}
              >
                {candidate.toUpperCase()}
                <span className="sr-only"> – {languageNames[candidate]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
