import Link from "next/link";
import type { Dictionary } from "@/frontend/i18n";
import type { Locale } from "@/shared/i18n/locales";
import { localizedPath } from "@/shared/i18n/routes";
import { LanguageSwitch } from "./language-switch";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
  /** The current page in every language. */
  alternates: Record<Locale, string>;
};

export function SiteHeader({
  locale,
  dictionary,
  alternates,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <Link
          href={localizedPath(locale, "home")}
          className="flex min-h-11 items-center gap-2.5"
        >
          <span aria-hidden="true" className="size-3 rounded-full bg-ink" />
          <span className="text-[0.8125rem] font-semibold tracking-brand uppercase">
            {dictionary.site.brand}
          </span>
        </Link>
        <LanguageSwitch
          locale={locale}
          label={dictionary.site.languageNav}
          alternates={alternates}
        />
      </div>
    </header>
  );
}
