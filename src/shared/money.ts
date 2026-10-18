const noBreakSpace = " ";
const thousandsSeparator = "’";

/**
 * Swiss price notation, identical in French and German:
 * `CHF 79.–` for whole francs, `CHF 14.50` otherwise, `CHF 1’250.–` above a thousand.
 */
export function formatChf(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Invalid amount in cents: ${cents}`);
  }
  const francs = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  const rest = cents % 100;
  const decimals = rest === 0 ? "–" : rest.toString().padStart(2, "0");
  return `CHF${noBreakSpace}${francs}.${decimals}`;
}
