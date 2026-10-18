import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveToday } from "./clock";

const now = new Date("2026-10-21T08:00:00Z");

describe("resolveToday", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses today's date in Zurich by default", () => {
    expect(resolveToday(undefined, now)).toEqual({
      date: "2026-10-21",
      simulated: false,
    });
  });

  it("ignores a simulated date when demo mode is off", () => {
    vi.stubEnv("DEMO_MODE", "false");
    expect(resolveToday("2026-12-23", now).simulated).toBe(false);
  });

  it("accepts a simulated date in demo mode", () => {
    vi.stubEnv("DEMO_MODE", "true");
    expect(resolveToday("2026-12-23", now)).toEqual({
      date: "2026-12-23",
      simulated: true,
    });
  });

  it("ignores an invalid simulated date, even in demo mode", () => {
    vi.stubEnv("DEMO_MODE", "true");
    expect(resolveToday("2026-02-30", now).date).toBe("2026-10-21");
    expect(resolveToday("demain", now).simulated).toBe(false);
  });
});
