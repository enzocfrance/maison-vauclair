import Link from "next/link";

type SiteFooterProps = {
  demoNotice: string;
  links?: readonly { href: string; label: string }[];
};

/** Shown on every page, printouts included. */
export function SiteFooter({ demoNotice, links = [] }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-line px-5 py-6 text-xs text-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
        <p>{demoNotice}</p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="underline underline-offset-4 hover:text-ink print:hidden"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
