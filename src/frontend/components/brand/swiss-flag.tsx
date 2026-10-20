type SwissFlagProps = {
  className?: string;
};

/**
 * The Swiss flag, never the coat of arms (reserved to the Confederation).
 * Square, white cross with arms one sixth longer than wide, on a 32-unit grid.
 * Decorative: it sits next to the logo.
 */
export function SwissFlag({ className }: SwissFlagProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" fill="#D52B1E" />
      <path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#ffffff" />
    </svg>
  );
}
