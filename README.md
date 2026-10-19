**English** · [Français](README.fr.md)

# Maison Vauclair · Build your gift box

> Demonstration project · fictitious company. Built in 3 hours for the CS Digital exercise of 21 October 2026.

**Live demo:** <https://maison-vauclair.enzo-chamanier.fr>

## The problem

Almost half of Maison Vauclair's online sales happen at Christmas, from customers who order once a year to give a gift. Yet:

- the gift box, the most profitable product, can only be put together in the shops;
- fresh products only ship from Monday to Wednesday and, in 2026, 24 December is a Thursday: nobody knows until when to order;
- every box reaches a recipient the shop never hears about.

## What the application does

1. **Build a box**, in French or German: choose 4, 6 or 9 products and see the complete price live (products plus a box fee that covers packing and shipping).
2. **Know when it arrives**: a delivery date that follows the fresh-product rule and the Vaud public holidays, and the Christmas deadline (Tuesday 22 December 2026).
3. **Write to the recipient**: address in Switzerland, card language, message. Wine requires a 16+ confirmation.
4. **Prepare without a new tool**: the team space lists orders by shipping day and prints an A4 preparation sheet.
5. **Turn the recipient into a customer**: a printable welcome card with a personal code and a QR code, measured without cookies.

There is no AI in the application: everything relies on explicit, tested rules.

## Try it

| What                              | Where                                             |
| --------------------------------- | ------------------------------------------------- |
| Customer journey                  | `/fr` or `/de` (`/` picks the browser's language) |
| Christmas deadline already passed | add `?date=2026-12-23` (demo mode)                |
| Team space                        | `/equipe` (password given separately)             |
| Personal data                     | `/fr/donnees-personnelles`, `/de/datenschutz`     |

In demo mode (`DEMO_MODE=true`), `?date=YYYY-MM-DD` simulates today's date through the whole journey, and a banner shows it on every page so nobody mistakes it for the real date.

## Run it locally

Requirements: Node.js 22.12 or later, npm.

```bash
npm ci
npm run dev   # http://localhost:3000
```

| Variable        | Purpose                             | Default                                   |
| --------------- | ----------------------------------- | ----------------------------------------- |
| `SITE_URL`      | Public address, used in the QR code | `http://localhost:3000`                   |
| `DEMO_MODE`     | Accepts a simulated date (`?date=`) | off                                       |
| `TEAM_PASSWORD` | Password of the team space          | open in development, closed in production |
| `ORDERS_DIR`    | Where orders are written            | `./data/orders`                           |

| Script                 | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Development server                              |
| `npm run build`        | Production build (standalone output for Docker) |
| `npm test`             | Tests (Vitest)                                  |
| `npm run typecheck`    | Route types and TypeScript                      |
| `npm run lint`         | ESLint, including the rules between layers      |
| `npm run format:check` | Prettier                                        |

## Architecture

One Next.js 15 application (App Router, strict TypeScript, Tailwind CSS v4, Zod), split into layers that ESLint keeps apart:

```
src/
├── app/           Routing only: pages, layouts, API routes. It wires the layers.
├── frontend/      Interface: components, box journey, team space, FR/DE dictionaries.
├── backend/       Server only: use cases, repositories, configuration, access control.
├── shared/        Pure, used on both sides: business rules, Zod schemas, route table.
└── middleware.ts  Language, translated URLs, team space password.
```

- `frontend` never imports `backend`: the browser sends orders to `POST /api/orders`.
- The catalogue and the orders sit behind `CatalogRepository` and `OrderRepository`: JSON files today, a WooCommerce connection tomorrow, swapped in `src/backend/container.ts` only.
- URLs are translated (`/fr/coffret/livraison`, `/de/geschenkbox/lieferung`) from one table, `src/shared/i18n/routes.ts`; the middleware serves them from internal English routes.

| Where to look                                    | File                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| Delivery rule and Christmas deadline             | `src/shared/delivery/delivery.ts`                  |
| Vaud public holidays (computed, Easter included) | `src/shared/delivery/holidays.ts`                  |
| Price and CHF format                             | `src/shared/pricing.ts`, `src/shared/money.ts`     |
| Order contract shared by browser and server      | `src/shared/order/order-request.ts`                |
| Order creation (prices and dates recomputed)     | `src/backend/orders/create-order.ts`               |
| Order storage and numbering                      | `src/backend/orders/json-file-order-repository.ts` |

The reasons behind each choice are in [docs/decisions.md](docs/decisions.md).

## Quality

- **93 tests**: delivery rule (written before the code), holidays, prices, CHF format, order contract, storage with simultaneous orders, order creation, team access, rate limit, routes.
- **CI on every push**: format, lint, types, tests, `npm audit` of production dependencies, build, then the Docker image is built, started and probed.
- **Security**: the server recomputes prices and dates and rejects unknown fields; the confirmation page needs the order's secret key; the team space has a password and stays closed without one; order numbers are checked before touching the file system; request size and order rate are limited; security headers (CSP, `nosniff`, no framing, referrer policy, HSTS).
- **Accessibility** (WCAG 2.2 AA target): native controls, visible focus, skip link, errors tied to their field with focus on the first one, live announcements of the box contents, `autocomplete`, `lang` attributes, focus never hidden by sticky bars, forced colours mode.
- **Privacy**: no cookie, fonts served by the site itself, no data sent to third parties or to any AI service.
- **Photos**: every product and category has a photo from Wikimedia Commons under a free licence (CC0, public domain, CC BY, CC BY-SA), cropped and compressed to WebP in `public/images`; authors and licences are credited on `/fr/credits-photos` and `/de/bildnachweis`.

## Deployment

- Docker image built from `Dockerfile`: Next.js standalone server, non-root user, health check on `/api/health`.
- On `main`, once every check has passed, the CI asks Dokploy to deploy through its API (GitHub secrets `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_APPLICATION_ID`).
- Orders are written to `/app/data/orders`: mount a persistent volume there.

## Known limits of v1

- **Public holidays of the recipient's canton are not handled**: Vaud holidays apply to both shipping and delivery.
- Orders are JSON files: one server instance, and the rate limit is kept in memory.
- The CSP allows inline scripts, which Next.js needs without a nonce system.
- No payment, no email sent, no customer account, no WooCommerce connection; the 10% welcome advantage is fictitious.
- German texts have not been proofread by a native speaker.
- Accessibility is built in and reviewed, but not yet tested with a screen reader.
- ESLint 9, required by `eslint-config-next` 15, is no longer maintained upstream.

## Documents

Each document exists in English and in French (`.fr.md`).

- [Client brief](docs/brief.md)
- [Analysis and plan](docs/analysis.md)
- [Approved mock-ups](docs/mockups/)
- [Decisions and trade-offs](docs/decisions.md)
- [One-page note for the director](docs/director-note.md)

## How AI was used

The analysis and the mock-ups were prepared with Claude (claude.ai), and the application was built with Claude Code under my direction: I set the plan, made every decision, and checked each step before moving on. The conversation exports are provided separately.
