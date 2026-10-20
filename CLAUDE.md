# CLAUDE.md · Maison Vauclair, "Build your gift box"

## Context

Role-play exercise for CS Digital (interview on 21 October 2026): deliver in 3 hours the first version of a mini-application for Maison Vauclair, a **fictitious** cheese shop and delicatessen from the canton of Vaud. Enzo leads, checks and decides.

References in `docs/` (English by default, French in `*.fr.md`):

- `brief.md`: the client's brief (the French original, reproduced as is, is `brief.fr.md`);
- `analysis.md`: the analysis, the 3-hour plan and the cutting order;
- `mockups/`: 4 approved HTML mock-ups (mobile journey at 390 px, A4 preparation sheet);
- `decisions.md`: decisions and trade-offs; `director-note.md`: the one-page note for the director.

## The problem

Almost half of online sales happen at Christmas, from customers who order once a year to give a gift, while the gift box is only sold in the shops. Fresh products only ship from Monday to Wednesday and, in 2026, 24 December is a Thursday: nobody knows until when to order. Finally, every box introduces the shop to a recipient who is not a customer yet.

## v1 scope

1. Build a box online: choose a size (4, 6 or 9 products), fill it, see the total.
2. Show a reliable delivery date that respects the fresh-product rule, and the Christmas deadline.
3. Enter the recipient, the language of their card and a message.
4. Store the order on the server and produce a printable preparation sheet for the team, with no new tool to learn.
5. Produce a welcome card with a QR code to turn the recipient into a customer.
6. Work in French and German.

**Deliberately out of scope**: payment, customer accounts, real WooCommerce connection, chatbot, native mobile app.

## Non-negotiable constraints

- No AI and no call to a model in the application (management requirement).
- No database in v1: catalogue in JSON, orders as JSON files in `data/orders/` (never versioned), behind an interface a WooCommerce connection can replace.
- Mobile first, but flawless on desktop: the demo is shown on a big screen.
- Accessible: WCAG 2.2 AA.
- Invented data, with the notice « Projet de démonstration · entreprise fictive » on every page, printouts included.

## Stack

- Next.js 15 (App Router) and strict TypeScript
- Tailwind CSS v4
- Zod for validation shared between client and server
- Vitest for tests
- Docker image, deployed to the VPS with Dokploy at `maison-vauclair.enzo-chamanier.fr`

Pinned versions: `next` and `eslint-config-next` 15.5.28, `typescript` 5.x (7 is not supported by Next 15), `eslint` 9.x (`eslint-config-next` 15 refuses 10), `postcss` forced to 8.5.30 through `overrides` (the version bundled with Next 15 is vulnerable).

## Commands

```bash
npm run dev           # development server, http://localhost:3000
npm run build         # production build (standalone output)
npm test              # Vitest
npm run typecheck     # route types + tsc
npm run lint          # ESLint, including the layer rules
npm run format:check  # Prettier
```

## Conventions

- Code, names, file names, comments, commit messages and project documents in English.
- Deliverables and documents in English by default, with a French version next to them (`name.fr.md`) and a language link at the top of each.
- Interface texts in French and German, never hard-coded in components (dictionaries in `src/frontend/i18n/`). The team space is French only (`src/frontend/team/team-texts.ts`).
- Strict TypeScript, no `any`.
- Amounts in cents, as integers (`priceCents: 1450`); formatting to CHF only happens on display.
- Business dates as `YYYY-MM-DD` strings.
- Commits follow Conventional Commits, in English.
- **Ask Enzo before adding a dependency.**

## Working rules

- The server always recomputes prices and dates: it never trusts the browser.
- The delivery rule is isolated in a pure function, written test first.
- Never read a `.env` file; never write a secret in the repository.
- Environment variables: `TEAM_PASSWORD`, `DEMO_MODE`, `SITE_URL`, `ORDERS_DIR` (optional). Deployment secrets live in GitHub Actions: `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_APPLICATION_ID`.

## Architecture

One Next.js application, split into layers:

```
src/
├── app/           Next.js routing only: pages, layouts, API routes. Thin: it wires the layers.
├── frontend/      Interface: components, box journey, team space, FR/DE dictionaries.
├── backend/       Server only: use cases, repositories (catalogue, orders), configuration, access.
├── shared/        Pure, used on both sides: business rules, Zod schemas, localised route table.
└── middleware.ts  Language, localised URLs, team space password.
```

Import rules, enforced by ESLint:

- `shared` imports neither `frontend`, `backend`, React nor Next;
- `frontend` never imports `backend`: client components go through the HTTP API (`/api/orders`);
- `backend` never imports `frontend`;
- only `app` wires things together: a server page may call a backend service and pass the result to a frontend component.

The catalogue and the orders sit behind interfaces (`CatalogRepository`, `OrderRepository`): JSON files in v1, WooCommerce later. `src/backend/container.ts` is the only place where implementations are chosen.

## URLs and languages

- The language is the first URL segment (`/fr/...`, `/de/...`). `/` redirects according to the browser's language, French by default.
- Paths are translated. One table in `src/shared/i18n/routes.ts` maps each page to its FR and DE path; the middleware rewrites to the internal English routes, and links are generated from that table. Internal paths are never exposed.
- The language switcher leads to the same page in the other language (links with `hreflang`), `<html lang>` follows the language.

| Page                | FR                                                                  | DE                                        |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| Step 1: size        | `/fr`                                                               | `/de`                                     |
| Step 2: fill        | `/fr/coffret/composer`                                              | `/de/geschenkbox/zusammenstellen`         |
| Step 3: delivery    | `/fr/coffret/livraison`                                             | `/de/geschenkbox/lieferung`               |
| Confirmation        | `/fr/coffret/confirmation/{id}?key=…`                               | `/de/geschenkbox/bestaetigung/{id}?key=…` |
| Welcome (QR target) | `/fr/bienvenue`                                                     | `/de/willkommen`                          |
| Personal data       | `/fr/donnees-personnelles`                                          | `/de/datenschutz`                         |
| Team space (French) | `/equipe`, `/equipe/commandes/{id}`, `/equipe/commandes/{id}/carte` | —                                         |

## Approved decisions

**Price**

- Total = sum of the products + a box fee shown on its own line: Small (4) CHF 9.–, Classic (6) CHF 12.–, Large (9) CHF 15.–. The fee covers the box, insulated packing, card and shipping: no other fee.
- Step 1: « dès CHF … » = cheapest products of the catalogue for the size + the fee.
- At most one of each product; the journey only continues with a full box.

**Delivery** (pure function, test first)

- Working day: Monday to Friday, outside Vaud public holidays.
- Shipping at the earliest the day after the order, no cut-off time.
- Box with at least one fresh product: ships Monday to Wednesday, and only if the next-day delivery falls on a working day (test: Wednesday 13 May 2026, eve of Ascension).
- Box without fresh products: ships on any working day, delivered on the next working day.
- Delivered on 24 December = in time for Christmas. 2026 deadline: Tuesday 22 December; an order on Wednesday 23 is delivered on Tuesday 29.
- "Today" is the date in Europe/Zurich, passed as a parameter.
- v1 limit (in the README): the public holidays of the recipient's canton are not handled.

**Step 3: the form**

- Recipient: name, street, 4-digit postcode, town, with « Livraison en Suisse uniquement ».
- Card language (FR or DE), defaulting to the interface language; message of limited length; welcome card.
- Buyer: name and email.
- If the box contains wine, mandatory box: « L'acheteur et le destinataire ont 16 ans ou plus. »

**After validation**

- The customer sees a confirmation page protected by the order's secret key. The preparation sheet is only in the team space.
- If the date recomputed by the server differs from the one shown, the confirmation says so clearly.

**Team space**

- Protected by an HTTP password handled by the middleware, value in `TEAM_PASSWORD`. Missing variable in production: the space stays closed.
- In French. Printable A4 preparation sheet and A6 welcome card.

**Welcome card**: one random code per order, a QR code to the Welcome page in the card's language with `utm_*` parameters, no cookie, a fictitious 10% advantage on the first order.

**Demo mode**

- A simulated date passed as a URL parameter (`?date=2026-12-23`), no cookie, accepted by the server only when `DEMO_MODE=true`.
- It stays active through the whole journey, with a visible banner « Mode démonstration · date simulée : … ».
- The order keeps its real creation date next to the simulated date, and the sheet flags the simulation.
- Demo orders: when the server starts on an empty order store (`src/instrumentation.ts`), 12 fictitious orders for the presentation of 21 October 2026 are placed through `createOrder` (`src/backend/orders/demo-orders.ts`), in development and in production.

**Deployment**: the CI deploys to Dokploy through its API, only after every check passed (Dokploy autodeploy is off).

## Swiss rules and details

Prices written `CHF 79.–` and `CHF 14.50`, 4-digit postcodes, German without "ß", Vaud public holidays, legal age of 16 for wine, a « Données personnelles » page in the spirit of the nLPD, no tracking cookie.

## Visual direction (from the mock-ups)

Swiss luxury: restraint, fine rules, a single accent colour.

- Colours: ink `#111111`, secondary text `#6E6E6A`, rules `#E3E2DE`, product background `#F4F3F0`, single accent `#D52B1E`, kept for signals (delivery date, fresh products, « le plus offert »).
- Archivo typeface (300 to 600): light headings with tight tracking, labels in spaced small capitals, prices in tabular figures.
- 1 px rules, no rounded corners except dots, touch targets of at least 44 px.
- The mock-ups are 390 px wide: on desktop, two columns from 1024 px on steps 2 and 3 (catalogue, sticky summary).

## Priorities when running late

Cut in this order: the style page, the team space figures, the welcome card, the two-column layout.
Never cut: the delivery rule and its tests, the complete journey, the deployment, the deliverables.
