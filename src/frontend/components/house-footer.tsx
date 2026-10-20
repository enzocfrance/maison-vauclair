import Link from "next/link";
import { LogoVertical } from "@/frontend/components/brand";
import { getDictionary } from "@/frontend/i18n";
import type { Locale } from "@/shared/i18n/locales";
import { localizedPath } from "@/shared/i18n/routes";

type HouseFooterProps = {
  locale: Locale;
};

/** The house footer: both shops (invented, and labelled so), the useful links, the demo notice. */
export function HouseFooter({ locale }: HouseFooterProps) {
  const dictionary = getDictionary(locale);
  const f = dictionary.footer;
  const links = [
    { href: localizedPath(locale, "privacy"), label: dictionary.privacy.link },
    {
      href: localizedPath(locale, "photoCredits"),
      label: dictionary.credits.link,
    },
  ];

  return (
    <footer className="mt-auto border-t border-ink">
      <div className="mx-auto w-full max-w-6xl px-5 pt-12">
        <LogoVertical className="h-16 w-auto" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pt-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_14rem] lg:gap-16">
        <h2 className="sr-only">{f.shopsLabel}</h2>
        {f.shops.map((shop) => (
          <section key={shop.name} className="flex flex-col gap-3">
            <h3 className="text-lg font-light">{shop.name}</h3>
            <address className="text-sm leading-relaxed not-italic">
              {shop.street}
              <br />
              {shop.city}
            </address>
            <p className="text-sm leading-relaxed text-muted">
              {shop.hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="text-[0.625rem] font-semibold tracking-label text-muted uppercase">
              {f.fictional}
            </p>
          </section>
        ))}
        <nav aria-label={f.linksLabel} className="flex flex-col gap-3">
          <p className="label-caps text-muted">{f.linksLabel}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-draw">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-muted">
          {dictionary.site.demoNotice}
        </p>
      </div>
    </footer>
  );
}
