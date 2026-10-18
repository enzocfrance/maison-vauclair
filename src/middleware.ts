import { NextResponse, type NextRequest } from "next/server";
import { localeHeader, type Locale } from "@/shared/i18n/locales";
import { negotiateLocale } from "@/shared/i18n/negotiate-locale";
import {
  matchLocalizedPath,
  publicPathForInternal,
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

  // Internal path typed by hand: sent to its translated path.
  const publicPath = publicPathForInternal(pathname);
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

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
