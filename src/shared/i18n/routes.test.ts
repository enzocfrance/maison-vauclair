import { describe, expect, it } from "vitest";
import { locales } from "./locales";
import {
  alternatePaths,
  localizedPath,
  localizedRoutes,
  matchLocalizedPath,
  publicPathForInternal,
  isTeamPath,
  matchTeamPath,
  publicTeamPathForInternal,
  teamPath,
  type RouteKey,
} from "./routes";

const routeKeys = Object.keys(localizedRoutes) as RouteKey[];

describe("localizedPath", () => {
  it("builds translated paths", () => {
    expect(localizedPath("fr", "home")).toBe("/fr");
    expect(localizedPath("fr", "boxFill")).toBe("/fr/coffret/composer");
    expect(localizedPath("de", "boxFill")).toBe(
      "/de/geschenkbox/zusammenstellen",
    );
    expect(localizedPath("de", "privacy")).toBe("/de/datenschutz");
  });

  it("fills and encodes parameters", () => {
    expect(
      localizedPath("de", "boxConfirmation", { orderId: "VC-2026-0142" }),
    ).toBe("/de/geschenkbox/bestaetigung/VC-2026-0142");
    expect(localizedPath("fr", "boxConfirmation", { orderId: "a/b" })).toBe(
      "/fr/coffret/confirmation/a%2Fb",
    );
  });
});

describe("alternatePaths", () => {
  it("gives the same page in every language", () => {
    expect(alternatePaths("boxDelivery")).toEqual({
      fr: "/fr/coffret/livraison",
      de: "/de/geschenkbox/lieferung",
    });
  });
});

describe("matchLocalizedPath", () => {
  it("resolves a translated path to its internal route", () => {
    expect(
      matchLocalizedPath("/de/geschenkbox/bestaetigung/VC-2026-0142"),
    ).toEqual({
      locale: "de",
      key: "boxConfirmation",
      params: { orderId: "VC-2026-0142" },
      internalPath: "/de/box/confirmation/VC-2026-0142",
    });
  });

  it("resolves the home page, with or without a trailing slash", () => {
    expect(matchLocalizedPath("/fr")?.internalPath).toBe("/fr");
    expect(matchLocalizedPath("/de/")?.key).toBe("home");
  });

  it("rejects unknown languages and paths of the other language", () => {
    expect(matchLocalizedPath("/en/coffret/composer")).toBeNull();
    expect(matchLocalizedPath("/fr/geschenkbox/lieferung")).toBeNull();
    expect(matchLocalizedPath("/fr/coffret/inconnu")).toBeNull();
  });

  it("round-trips every page in every language", () => {
    for (const locale of locales) {
      for (const key of routeKeys) {
        const path =
          key === "boxConfirmation"
            ? localizedPath(locale, key, { orderId: "VC-2026-0001" })
            : localizedPath(
                locale,
                key as Exclude<RouteKey, "boxConfirmation">,
              );
        expect(matchLocalizedPath(path)?.key).toBe(key);
      }
    }
  });
});

describe("publicPathForInternal", () => {
  it("translates internal paths so they are never exposed", () => {
    expect(publicPathForInternal("/fr/box/fill")).toBe("/fr/coffret/composer");
    expect(publicPathForInternal("/de/box/confirmation/VC-2026-0142")).toBe(
      "/de/geschenkbox/bestaetigung/VC-2026-0142",
    );
    expect(publicPathForInternal("/fr/unknown")).toBeNull();
  });
});

describe("route table", () => {
  it("has no translated path that collides with an internal one", () => {
    const internals = routeKeys
      .map((key) => localizedRoutes[key].internal)
      .filter(Boolean);
    for (const locale of locales) {
      for (const key of routeKeys) {
        expect(internals).not.toContain(localizedRoutes[key][locale]);
      }
    }
  });
});

describe("team routes", () => {
  it("serves the French team paths from their internal routes", () => {
    expect(teamPath("order", { orderId: "VC-2026-0001" })).toBe(
      "/equipe/commandes/VC-2026-0001",
    );
    expect(matchTeamPath("/equipe")).toBe("/team");
    expect(matchTeamPath("/equipe/commandes/VC-2026-0001/carte")).toBe(
      "/team/orders/VC-2026-0001/card",
    );
    expect(matchTeamPath("/equipe/inconnu")).toBeNull();
  });

  it("never exposes the internal team paths", () => {
    expect(publicTeamPathForInternal("/team/orders/VC-2026-0001")).toBe(
      "/equipe/commandes/VC-2026-0001",
    );
    expect(publicTeamPathForInternal("/fr/coffret")).toBeNull();
  });

  it("recognises every page of the team space", () => {
    expect(isTeamPath("/equipe")).toBe(true);
    expect(isTeamPath("/equipe/commandes/VC-2026-0001")).toBe(true);
    expect(isTeamPath("/equipes")).toBe(false);
    expect(isTeamPath("/fr")).toBe(false);
  });
});
