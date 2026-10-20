"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/frontend/components/icons";
import { getDictionary } from "@/frontend/i18n";
import { format } from "@/frontend/i18n/format";
import { navigateWithTransition } from "@/frontend/navigation/view-transitions";
import type { BoxSizeId } from "@/shared/catalog/box-sizes";
import type { Locale } from "@/shared/i18n/locales";
import { formatChf } from "@/shared/money";
import { boxActions } from "./box-store";
import type { SizeOption } from "./size-picker";

/** Once per page load: coming back to step 1 inside the site keeps it closed. */
let shownInThisDocument = false;

/**
 * A visit starts on the home page: address typed, outside link, QR code or
 * reload. Not when the visitor comes from another page of the site, for
 * instance through the language switch, which reloads the page.
 */
function visitStartsHere(): boolean {
  const [entry] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];
  if (!entry) return true;
  if (new URL(entry.name).pathname !== window.location.pathname) return false;
  if (entry.type === "reload") return true;
  return (
    !document.referrer ||
    new URL(document.referrer).origin !== window.location.origin
  );
}

type StartDialogProps = {
  locale: Locale;
  sizes: readonly SizeOption[];
  /** Christmas deadline or delivery date, written on the server. */
  message: string;
  fillHref: string;
};

/**
 * The call to action shown when a visit starts: a native modal dialog
 * (focus kept inside, Escape closes), choosing a size goes straight to filling.
 */
export function StartDialog({
  locale,
  sizes,
  message,
  fillHref,
}: StartDialogProps) {
  const dictionary = getDictionary(locale);
  const t = dictionary.startDialog;
  const dialog = useRef<HTMLDialogElement>(null);
  const featured = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (shownInThisDocument || !visitStartsHere()) return;
    // Marked when it opens, not before: the development double effect cancels the first timer.
    const timer = window.setTimeout(() => {
      if (!dialog.current || dialog.current.open) return;
      shownInThisDocument = true;
      dialog.current.showModal();
      featured.current?.focus();
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    dialog.current?.close();
  }

  function choose(sizeId: BoxSizeId) {
    boxActions.selectSize(sizeId);
    close();
    navigateWithTransition(() => router.push(fillHref));
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="start-dialog-title"
      // A click on the backdrop lands on the dialog itself: it closes, like Escape.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[34rem] overflow-y-auto border border-ink bg-white p-0 text-ink backdrop:bg-ink/60 open:animate-[dialog-unfold_220ms_cubic-bezier(0.2,0.8,0.2,1)] open:backdrop:animate-[backdrop-in_220ms_ease-out]"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="label-caps text-muted">{t.eyebrow}</p>
          <button
            type="button"
            onClick={close}
            className="-mr-2.5 flex size-11 shrink-0 items-center justify-center"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">{t.close}</span>
          </button>
        </div>

        <h2
          id="start-dialog-title"
          className="text-[2rem] leading-[1.05] font-light tracking-[-0.03em] sm:text-[2.5rem]"
        >
          {t.heading}
        </h2>

        <p className="flex gap-3 border-y border-ink py-3.5 text-sm leading-snug">
          <span
            aria-hidden="true"
            className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
          />
          {message}
        </p>

        <div className="flex flex-col gap-3">
          <p id="start-dialog-choose" className="label-caps text-muted">
            {t.choose}
          </p>
          <div
            role="group"
            aria-labelledby="start-dialog-choose"
            className="grid grid-cols-3 border border-ink"
          >
            {sizes.map((size) => (
              <button
                key={size.id}
                ref={size.featured ? featured : undefined}
                type="button"
                onClick={() => choose(size.id)}
                className="group flex flex-col items-center gap-1 border-r border-ink px-2 py-5 text-center transition-colors last:border-r-0 hover:bg-ink hover:text-white"
              >
                <span className="text-[2.25rem] leading-none font-light tabular-nums">
                  {size.itemCount}
                </span>
                <span className="text-sm font-medium">
                  {dictionary.sizes[size.id]}
                </span>
                <span className="text-xs text-muted tabular-nums group-hover:text-white">
                  {format(t.from, {
                    price: formatChf(size.startingPriceCents),
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          className="link-draw self-center text-sm"
        >
          {t.later}
        </button>
      </div>
    </dialog>
  );
}
