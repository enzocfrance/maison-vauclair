import { afterEach, describe, expect, it, vi } from "vitest";
import { checkTeamAccess } from "./team-access";

const basic = (credentials: string) =>
  `Basic ${Buffer.from(credentials).toString("base64")}`;

describe("checkTeamAccess", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays closed in production when no password is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TEAM_PASSWORD", "");
    expect(checkTeamAccess(basic("equipe:nimportequoi"))).toBe("closed");
  });

  it("stays open in development when no password is configured", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TEAM_PASSWORD", "");
    expect(checkTeamAccess(null)).toBe("granted");
  });

  it("asks for the password, then checks it", () => {
    vi.stubEnv("TEAM_PASSWORD", "gruyere-18");
    expect(checkTeamAccess(null)).toBe("denied");
    expect(checkTeamAccess(basic("equipe:vacherin"))).toBe("denied");
    expect(checkTeamAccess(basic("equipe:gruyere-18"))).toBe("granted");
  });

  it("accepts any user name and passwords containing a colon", () => {
    vi.stubEnv("TEAM_PASSWORD", "a:b");
    expect(checkTeamAccess(basic("logistique:a:b"))).toBe("granted");
  });
});
