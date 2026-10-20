import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoHorizontal, SwissFlag } from "@/frontend/components/brand";
import { SiteFooter } from "@/frontend/components/site-footer";
import { getDictionary } from "@/frontend/i18n";
import { teamTexts } from "@/frontend/team/team-texts";
import { teamPath } from "@/shared/i18n/routes";

export const metadata: Metadata = {
  title: {
    default: teamTexts.space,
    template: `%s · ${teamTexts.space} · Maison Vauclair`,
  },
};

export default function TeamLayout({ children }: { children: ReactNode }) {
  const { site } = getDictionary("fr");

  return (
    <div className="flex min-h-dvh flex-col bg-surface print:bg-white">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:text-white"
      >
        {teamTexts.skipToContent}
      </a>
      <header className="border-b border-line bg-white print:hidden">
        <div className="mx-auto flex min-h-11 w-full max-w-6xl items-center justify-between px-5">
          <Link
            href={teamPath("orders")}
            className="flex min-h-11 items-center py-2.5"
          >
            <LogoHorizontal className="h-10 w-auto" />
            <SwissFlag className="ml-3 size-3.5 shrink-0" />
          </Link>
          <p className="label-caps text-muted">{teamTexts.space}</p>
        </div>
      </header>
      {children}
      {/* The printed sheet carries its own demo notice. */}
      <div className="bg-white print:hidden">
        <SiteFooter demoNotice={site.demoNotice} />
      </div>
    </div>
  );
}
