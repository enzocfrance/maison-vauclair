import { Fragment } from "react";
import { getDictionary } from "@/frontend/i18n";
import { format } from "@/frontend/i18n/format";
import { welcomeDiscountPercent, type WelcomeCard } from "@/shared/welcome";
import { QrCode } from "./qr-code";

const label =
  "text-[0.625rem] font-semibold tracking-label text-muted uppercase";

/** A6 card slipped into the box, in the recipient's language. */
export function WelcomeCardView({ card }: { card: WelcomeCard }) {
  const dictionary = getDictionary(card.locale);
  const t = dictionary.welcome.card;

  return (
    <article
      lang={card.locale}
      aria-labelledby="welcome-card-title"
      className="mx-auto flex h-[148mm] w-[105mm] flex-col justify-between gap-6 bg-white p-[9mm] shadow-sm print:mx-0 print:shadow-none print:outline-1 print:outline-line print:outline-dashed"
    >
      <div className="flex flex-col gap-6">
        <p className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-ink" />
          <span className="text-[0.6875rem] font-semibold tracking-brand uppercase">
            {dictionary.site.brand}
          </span>
        </p>
        <div className="flex flex-col gap-2.5">
          <p className={label}>{t.eyebrow}</p>
          <h1
            id="welcome-card-title"
            className="text-[1.75rem] leading-[1.1] font-light tracking-[-0.02em]"
          >
            {t.heading}
          </h1>
        </div>
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          {format(t.text, { discount: welcomeDiscountPercent })}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4 border-t border-ink pt-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className={label}>{t.codeLabel}</p>
            <p className="text-2xl font-medium tracking-[0.2em] tabular-nums">
              {card.code}
            </p>
            <p className="mt-2 text-[0.6875rem]">{t.scan}</p>
            <p className="text-[0.625rem] text-muted">
              {/* Lines break after a slash, never inside a word. */}
              {card.displayUrl.split("/").map((part, index, parts) => (
                <Fragment key={index}>
                  {part}
                  {index < parts.length - 1 && (
                    <>
                      /<wbr />
                    </>
                  )}
                </Fragment>
              ))}
            </p>
          </div>
          <QrCode
            matrix={card.qr}
            label={t.qrLabel}
            className="size-[30mm] shrink-0 text-ink"
          />
        </div>
        <p className="text-[0.5625rem] text-muted">
          {dictionary.site.demoNotice}
        </p>
      </div>
    </article>
  );
}
