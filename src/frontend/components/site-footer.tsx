type SiteFooterProps = {
  demoNotice: string;
};

/** Shown on every page, printouts included. */
export function SiteFooter({ demoNotice }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-line px-5 py-6 text-center text-xs text-muted">
      <p>{demoNotice}</p>
    </footer>
  );
}
