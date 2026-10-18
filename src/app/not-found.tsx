import { SiteFooter } from "@/frontend/components/site-footer";
import { getDictionary } from "@/frontend/i18n";
import { localizedPath } from "@/shared/i18n/routes";

/** Outside any language, so the page speaks both. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main
        id="content"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pt-16"
      >
        <h1 className="text-4xl font-light tracking-[-0.03em]">
          Page introuvable
          <span lang="de" className="block text-muted">
            Seite nicht gefunden
          </span>
        </h1>
        <ul className="flex gap-6 text-sm underline underline-offset-4">
          <li>
            <a href={localizedPath("fr", "home")}>Retour à l&apos;accueil</a>
          </li>
          <li lang="de">
            <a href={localizedPath("de", "home")}>Zur Startseite</a>
          </li>
        </ul>
      </main>
      <SiteFooter demoNotice={getDictionary("fr").site.demoNotice} />
    </div>
  );
}
