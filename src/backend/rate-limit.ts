/**
 * At most `limit` actions per key in each window. Kept in memory: enough for
 * one container, and it resets on restart, which is acceptable for a v1.
 */
export class FixedWindowRateLimiter {
  private readonly windows = new Map<
    string,
    { count: number; endsAt: number }
  >();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  allow(key: string, now: number = Date.now()): boolean {
    const current = this.windows.get(key);
    if (!current || current.endsAt <= now) {
      this.forgetExpired(now);
      this.windows.set(key, { count: 1, endsAt: now + this.windowMs });
      return true;
    }
    if (current.count >= this.limit) return false;
    current.count += 1;
    return true;
  }

  private forgetExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.endsAt <= now) this.windows.delete(key);
    }
  }
}

/** The visitor's address behind Cloudflare and the Dokploy proxy. */
export function clientAddress(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
