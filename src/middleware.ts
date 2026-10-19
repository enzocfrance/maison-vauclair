import { NextResponse, type NextRequest } from "next/server";
import { checkTeamAccess } from "@/backend/team-access";
import { localeHeader, type Locale } from "@/shared/i18n/locales";
import { negotiateLocale } from "@/shared/i18n/negotiate-locale";
import {
  isTeamPath,
  matchLocalizedPath,
  matchTeamPath,
  publicPathForInternal,
  publicTeamPathForInternal,
} from "@/shared/i18n/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // "/" picks the visitor's language. The query string (demo date) is kept.
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${negotiateLocale(request.headers.get("accept-language"))}`;
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  // Team space: password first, then the French paths.
  if (isTeamPath(pathname)) {
    const access = checkTeamAccess(request.headers.get("authorization"));
    if (access === "closed") {
      return new NextResponse(
        "Espace équipe fermé : aucun mot de passe n'est configuré.",
        { status: 503, headers: privateHeaders() },
      );
    }
    if (access === "denied") {
      return new NextResponse("Mot de passe requis.", {
        status: 401,
        headers: {
          ...privateHeaders(),
          "WWW-Authenticate":
            'Basic realm="Maison Vauclair, equipe", charset="UTF-8"',
        },
      });
    }
    const internalPath = matchTeamPath(pathname);
    const headers = withLocale(request, "fr");
    if (!internalPath) return NextResponse.next({ request: { headers } });
    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    const response = NextResponse.rewrite(url, { request: { headers } });
    for (const [name, value] of Object.entries(privateHeaders())) {
      response.headers.set(name, value);
    }
    return response;
  }

  // Translated path: served by its internal route, the URL stays translated.
  const match = matchLocalizedPath(pathname);
  if (match) {
    const headers = withLocale(request, match.locale);
    if (match.internalPath === pathname) {
      return NextResponse.next({ request: { headers } });
    }
    const url = request.nextUrl.clone();
    url.pathname = match.internalPath;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  // Internal path typed by hand: sent to its public path.
  const publicPath =
    publicPathForInternal(pathname) ?? publicTeamPathForInternal(pathname);
  if (publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = publicPath;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

function withLocale(request: NextRequest, locale: Locale): Headers {
  const headers = new Headers(request.headers);
  headers.set(localeHeader, locale);
  return headers;
}

/** Orders hold addresses: never cached, never indexed. */
function privateHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
