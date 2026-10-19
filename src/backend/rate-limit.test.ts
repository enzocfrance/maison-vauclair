import { describe, expect, it } from "vitest";
import { clientAddress, FixedWindowRateLimiter } from "./rate-limit";

describe("FixedWindowRateLimiter", () => {
  it("allows the limit, then refuses until the window ends", () => {
    const limiter = new FixedWindowRateLimiter(2, 60_000);
    expect(limiter.allow("1.2.3.4", 0)).toBe(true);
    expect(limiter.allow("1.2.3.4", 1_000)).toBe(true);
    expect(limiter.allow("1.2.3.4", 2_000)).toBe(false);
    expect(limiter.allow("1.2.3.4", 60_000)).toBe(true);
  });

  it("counts each visitor separately", () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000);
    expect(limiter.allow("1.2.3.4", 0)).toBe(true);
    expect(limiter.allow("5.6.7.8", 0)).toBe(true);
    expect(limiter.allow("1.2.3.4", 0)).toBe(false);
  });
});

describe("clientAddress", () => {
  it("prefers the address given by Cloudflare, then the proxy chain", () => {
    expect(
      clientAddress(
        new Headers({
          "cf-connecting-ip": "1.2.3.4",
          "x-forwarded-for": "9.9.9.9",
        }),
      ),
    ).toBe("1.2.3.4");
    expect(
      clientAddress(new Headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" })),
    ).toBe("5.6.7.8");
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});
