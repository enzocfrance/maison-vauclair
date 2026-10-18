import { isLocale, locales, type Locale } from "./locales";

/**
 * Every public page: its internal route (the folder under `src/app/[locale]`)
 * and its translated path in each language. `:name` marks a parameter.
 */
export const localizedRoutes = {
  home: { internal: "", fr: "", de: "" },
  boxFill: {
    internal: "box/fill",
    fr: "coffret/composer",
    de: "geschenkbox/zusammenstellen",
  },
  boxDelivery: {
    internal: "box/delivery",
    fr: "coffret/livraison",
    de: "geschenkbox/lieferung",
  },
  boxConfirmation: {
    internal: "box/confirmation/:orderId",
    fr: "coffret/confirmation/:orderId",
    de: "geschenkbox/bestaetigung/:orderId",
  },
  welcome: { internal: "welcome", fr: "bienvenue", de: "willkommen" },
  privacy: {
    internal: "privacy",
    fr: "donnees-personnelles",
    de: "datenschutz",
  },
} as const satisfies Record<string, Record<"internal" | Locale, string>>;

export type RouteKey = keyof typeof localizedRoutes;

const routeKeys = Object.keys(localizedRoutes) as RouteKey[];

type ParamNames<Pattern extends string> =
  Pattern extends `${string}:${infer Name}/${infer Rest}`
    ? Name | ParamNames<Rest>
    : Pattern extends `${string}:${infer Name}`
      ? Name
      : never;

type RouteParamNames<Key extends RouteKey> = ParamNames<
  (typeof localizedRoutes)[Key]["internal"]
>;

/** Routes without parameters take no extra argument; the others require them. */
type ParamsArgument<Key extends RouteKey> = [RouteParamNames<Key>] extends [
  never,
]
  ? []
  : [params: Record<RouteParamNames<Key>, string>];

export type RouteMatch = {
  locale: Locale;
  key: RouteKey;
  params: Readonly<Record<string, string>>;
  internalPath: string;
};

/** The translated public path of a page, e.g. `/de/geschenkbox/lieferung`. */
export function localizedPath<Key extends RouteKey>(
  locale: Locale,
  key: Key,
  ...args: ParamsArgument<Key>
): string {
  const [params] = args as readonly [Readonly<Record<string, string>>?];
  return joinPath(locale, fillPattern(localizedRoutes[key][locale], params));
}

/** The same page in every language, for the language switcher and hreflang. */
export function alternatePaths<Key extends RouteKey>(
  key: Key,
  ...args: ParamsArgument<Key>
): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedPath(locale, key, ...args)]),
  ) as Record<Locale, string>;
}

/** Resolves a translated public path to its page and internal route. */
export function matchLocalizedPath(pathname: string): RouteMatch | null {
  const [locale, ...segments] = splitPath(pathname);
  if (!isLocale(locale)) return null;

  for (const key of routeKeys) {
    const params = matchPattern(localizedRoutes[key][locale], segments);
    if (params) {
      const internal = fillPattern(localizedRoutes[key].internal, params);
      return { locale, key, params, internalPath: joinPath(locale, internal) };
    }
  }
  return null;
}

/** The translated path of an internal one, which is never exposed as is. */
export function publicPathForInternal(pathname: string): string | null {
  const [locale, ...segments] = splitPath(pathname);
  if (!isLocale(locale)) return null;

  for (const key of routeKeys) {
    const params = matchPattern(localizedRoutes[key].internal, segments);
    if (params) {
      return joinPath(
        locale,
        fillPattern(localizedRoutes[key][locale], params),
      );
    }
  }
  return null;
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function joinPath(locale: Locale, rest: string): string {
  return rest ? `/${locale}/${rest}` : `/${locale}`;
}

function fillPattern(
  pattern: string,
  params: Readonly<Record<string, string>> = {},
): string {
  return splitPath(pattern)
    .map((part) => {
      if (!part.startsWith(":")) return part;
      const value = params[part.slice(1)];
      if (value === undefined) {
        throw new Error(`Missing route parameter "${part.slice(1)}"`);
      }
      return encodeURIComponent(value);
    })
    .join("/");
}

function matchPattern(
  pattern: string,
  segments: readonly string[],
): Record<string, string> | null {
  const parts = splitPath(pattern);
  if (parts.length !== segments.length) return null;

  const params: Record<string, string> = {};
  for (const [index, part] of parts.entries()) {
    const segment = segments[index] ?? "";
    if (part.startsWith(":")) {
      const value = safeDecode(segment);
      if (value === null) return null;
      params[part.slice(1)] = value;
    } else if (part !== segment) {
      return null;
    }
  }
  return params;
}

function safeDecode(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}
