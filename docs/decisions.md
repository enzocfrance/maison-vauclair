**English** · [Français](decisions.fr.md)

# Decisions and trade-offs

Each decision below was taken during the exercise; the trade-off is what it costs and why that is acceptable for a first version.

## Product

| Decision | Why | Trade-off |
|---|---|---|
| A gift box configurator, rather than a chatbot, a mobile app or a B2B portal | It answers the problem that weighs most on the goal: half of online sales at Christmas, from one-time gift buyers ([analysis](analysis.md)) | B2B, the second goal, waits for a next step |
| A web application, mobile first | Nobody installs an app for one order a year; the demo is shown on a big screen, so desktop gets two columns | No offline mode |
| Complete price: products + a box fee per size (CHF 9.–, 12.–, 15.–) on its own line | The director's first question will be "and shipping?": the fee covers box, insulated packing, card and shipping | The shop must check the fee covers its real costs |
| Delivery date shown before ordering, with the Christmas deadline | The fresh-product rule (Monday to Wednesday) plus a Thursday 24 December make the deadline impossible to guess | — |
| A welcome card with a personal code and a QR code | Every box reaches someone who is not a customer yet | The 10% advantage is fictitious; the shop has to decide the real one |
| A printed preparation sheet, not a back office | The logistics manager does not want one more tool | Orders are read on screen, prepared on paper |

## Rules

| Decision | Why | Trade-off |
|---|---|---|
| The delivery rule is a pure function, written test first | It is the promise made to the customer: it has to be provable | — |
| A fresh box only ships if the next-day delivery falls on a working day | A cheese must not wait in a depot over a public holiday (Ascension 2026) | Some weeks offer fewer shipping days |
| Vaud public holidays are computed, Easter included, not listed | A hard-coded list would silently expire | Holidays of the recipient's canton are not handled in v1 |
| "Today" is computed in Europe/Zurich and passed as a parameter | The server runs in UTC: around midnight, the date would be wrong by a day | — |
| The server recomputes prices and dates; the schema refuses unknown fields | The browser is never trusted | If the date changed in between, the confirmation says so |
| Amounts in integer cents, dates as `YYYY-MM-DD` | No rounding errors, no time zone surprises | — |

## Architecture

| Decision | Why | Trade-off |
|---|---|---|
| One Next.js application split into `app`, `frontend`, `backend`, `shared`, enforced by ESLint | A clean separation without two services, two images and CORS to run in 3 hours | The separation relies on lint rules, not on separate deployments |
| The browser only reaches the backend through `POST /api/orders` | An explicit contract that a separate backend could take over | — |
| No database: JSON catalogue, one JSON file per order, behind `CatalogRepository` and `OrderRepository` | Required for v1; WooCommerce can replace them in one file | One server instance only |
| Order numbers claimed by hard-linking a complete temporary file | Two simultaneous orders never share a number, nobody reads a half-written file | — |
| Translated URLs (`/fr/coffret/…`, `/de/geschenkbox/…`) served from internal English routes | German-speaking visitors read German URLs; the code stays in English | A middleware and a route table to maintain |
| The box being built is kept in `sessionStorage` | Survives a reload, no cookie, nothing sent anywhere | Lost when the tab is closed |
| Demo mode: a simulated date in the URL, accepted only when `DEMO_MODE=true`, with a banner | Shows the Christmas deadline in October, without anyone mistaking it for the real date | Must be switched off for real use |

## Security and privacy

| Decision | Why | Trade-off |
|---|---|---|
| Confirmation page protected by a secret key | Order numbers follow each other: nobody may read another customer's address by guessing one | The link must be kept |
| Team space behind an HTTP password, closed when none is configured | Orders contain addresses; a forgotten variable must not open them | One shared password, no individual accounts |
| Request size and order rate limits | A script could fill the disk and the team space | The rate limit lives in memory |
| Security headers, with a CSP that allows inline scripts | Blocks foreign sources, framing and foreign form targets | Inline scripts stay allowed: Next.js needs them without nonces |
| Fonts self-hosted, no cookie, no third party, no AI | Management's requirement on cost and data control, and the spirit of the nLPD | — |

## Tooling and delivery

| Decision | Why | Trade-off |
|---|---|---|
| Next.js 15.5.28, TypeScript 5.9, ESLint 9 with `@eslint/eslintrc` | The chosen stack; TypeScript 7 and ESLint 10 are not supported by Next 15 | ESLint 9 is no longer maintained upstream |
| PostCSS forced to 8.5.30 through `overrides` | The version bundled with Next 15 has known vulnerabilities | An override to watch when upgrading Next |
| Few dependencies: no i18n, date, UI or testing library | Intl and typed dictionaries are enough; tests target the business logic | Interface behaviour is checked by hand, not by automated tests |
| Deployment triggered by the CI through the Dokploy API, only when every check passed | Dokploy's webhook was not firing; production now only receives verified versions | Three GitHub secrets to manage |
| Docker image: standalone server, non-root, health check, built and probed in the CI | The image tested is the image deployed | — |
