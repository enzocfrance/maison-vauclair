"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Resolves the transition in progress once the new page is on screen. */
let finishPending: (() => void) | null = null;

/** Never leave the page frozen if a navigation does not happen. */
const safetyDelay = 1000;

function canAnimate(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Runs a client-side navigation inside a view transition: the browser keeps
 * the old page on screen, then reveals the new one (see globals.css).
 */
export function navigateWithTransition(navigate: () => void): void {
  if (!canAnimate()) {
    navigate();
    return;
  }
  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        finishPending?.();
        finishPending = resolve;
        window.setTimeout(() => {
          if (finishPending !== resolve) return;
          finishPending = null;
          resolve();
        }, safetyDelay);
        navigate();
      }),
  );
}

/**
 * Mounted once in the root layout: turns clicks on same-site links into
 * transitions, and ends each transition when the new route has rendered.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    finishPending?.();
    finishPending = null;
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !canAnimate()
      ) {
        return;
      }
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      // Language links reload on purpose (new <html lang>); new tabs and downloads are left alone.
      if (
        anchor.hasAttribute("hreflang") ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      event.preventDefault();
      navigateWithTransition(() =>
        router.push(`${url.pathname}${url.search}${url.hash}`),
      );
    }

    // Capture phase: runs before Next's <Link>, which then sees the click handled.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
