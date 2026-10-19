**English** · [Français](analysis.fr.md)

# Analysis of the brief · Maison Vauclair

> **Origin of this document.** Sections 1 to 7 are a first analysis made with Claude (claude.ai) between 16 and 18 October 2026, which I read and discussed. The mock-ups in `docs/mockups/` were produced the same way, from my vision of a modern, stylised interface for Maison Vauclair. Section 8 is my personal opinion, written by me: what I keep, what I change and why. This is a translation of [analysis.fr.md](analysis.fr.md).

## 1. What the brief really tests *(done with Claude)*

- **The decisive point is the thinking**, and above all the ability to find a problem "the client had not thought of". The code comes second.
- **The hidden constraints**: no AI in the application, nobody technical in-house, a logistics team that does not want one more tool, and a management that expects a first version.
- **The false leads**: the chatbot and the mobile app requested by the marketing manager.
- **The audience**: a non-technical director. Everything must be understandable by looking at the interface.

## 2. What the figures say *(done with Claude)*

- The online shop makes 18% of revenue with CHF 1.1 million, so the company weighs about **CHF 6.1 million**.
- Almost half of online sales happen at Christmas, i.e. **about CHF 550,000 in a few weeks**.
- The CHF 1.6 million target means **+500,000 francs, i.e. +45% in two years**. With customers who order once a year, this requires new customers or a second order.
- **One visitor in five speaks German**, while the website only exists in French.
- **+25% B2B without administrative hiring** is impossible as long as every order is keyed in again by hand.

## 3. The hidden problems *(done with Claude)*

1. **Online customers are mostly people giving a gift.** They order once, at Christmas. Yet the gift box is only sold in the shops.
2. **The gift's recipient is a lost customer.** They taste the products, and Maison Vauclair does not know they exist.
3. **The fresh-product rule strikes at the worst moment.** Fresh products only ship from Monday to Wednesday, and in 2026, 24 December is a Thursday. The last order with fresh products for delivery before Christmas is therefore **Tuesday 22 December**. An order placed on Wednesday 23 will only arrive on Tuesday 29. Today, the customer has no way of knowing this, and the mistake falls in the period that weighs half of online sales.
4. **In B2B, restaurants often order the same thing every week.** The real gain would be renewing an order in one click.

## 4. Comparing the options *(done with Claude)*

| Option | Impact on the goals | Hidden problem | Doable in 3 h | Telling demo |
|---|---|---|---|---|
| **Gift box configurator** | Strong on online sales and Christmas | Yes, points 1 to 3 | Yes, if well scoped | Excellent |
| B2B ordering portal | Strong on B2B | Partly, point 4 | Yes | Fair |
| Sales dashboard | Indirect | No, obvious problem | Yes | Average |
| Chatbot | Weak | No | Excluded: it needs AI | — |
| Mobile app | Weak | No | Off topic | — |

Nobody will install an app for one order a year: that is the argument against the mobile app.

## 5. Proposal: "Build your gift box" *(done with Claude)*

Customers build their gift box online, in French or in German, and immediately know when it will be delivered.

**The core of v1**
- Three box sizes (4, 6 or 9 products), a fictitious catalogue of about 24 products, the total updated live.
- A reliable delivery date, computed with the fresh-product rule and the Vaud public holidays, with the deadline for Christmas.
- The recipient, the language of their card and a message.
- The order stored on the server, and a printable preparation sheet for the team: no extra tool for logistics.
- French and German.

**The growth lever:** a welcome card slipped into the box, with a QR code and a code for the recipient, so that they become a customer. The tracking parameters of the link measure how many do.

**Deliberately left out:** payment, customer accounts, the real WooCommerce connection, catalogue administration.

**No AI:** everything relies on simple rules. No usage cost, no data leaving the company, predictable behaviour.

**Alternative:** a B2B portal where restaurants renew their order in one click, with the fresh-product deadline and a preparation sheet for logistics.

## 6. Technical choices *(done with Claude)*

- Next.js 15 and strict TypeScript, Tailwind CSS, Zod for validation shared between the browser and the server, Vitest for tests.
- No database in v1: catalogue in JSON, orders in JSON files behind an interface that a WooCommerce connection can replace.
- The delivery rule isolated in a pure function, written test first.
- The server always recomputes prices and dates: it never trusts the browser.
- Docker image, continuous integration on GitHub, hosting on my server with Dokploy and Cloudflare, at maison-vauclair.enzo-chamanier.fr. Vercel as a fallback.
- Mobile first, polished on desktop, accessible (WCAG 2.2 AA).
- Swiss details: prices written CHF 79.–, 4-digit postcodes, German without "ß", Vaud public holidays, legal age of 16 for wine, a "Personal data" page in the spirit of the nLPD (Swiss data protection act), no tracking cookie.

## 7. The 3-hour plan *(done with Claude)*

| Step | Ends at |
|---|---|
| Framing and plan, no code | 0:10 |
| Foundations and design system | 0:30 |
| Immediate deployment | 0:45 |
| Catalogue and data | 0:55 |
| Delivery rule, tests first | 1:15 |
| Steps 1 and 2 of the journey | 1:45 |
| Step 3 and server-side storage | 2:10 |
| Team space and preparation sheet | 2:25 |
| Welcome card with QR code | 2:35 |
| Finishing touches and critical review | 2:48 |
| README, decisions, note for management | 3:00 |

If I fall behind, I cut in this order: the style page, the team space figures, the welcome card, the two-column layout. I never cut the delivery rule and its tests, the complete journey, the deployment and the deliverables.

## 8. My opinion *(written up with Claude from the positions I took during preparation, read and approved by me)*

**What I keep.** The gift box. Half of online sales happen at Christmas, from customers who order once a year: they are people giving a gift. It is the problem that most directly serves the goal of growing from 1.1 to 1.6 million in two years.

**What I decided.** I prioritised. The chatbot is not the most urgent need, and management does not want AI in the application. I also chose a web application rather than a mobile app: designed for the phone first, but polished on desktop. For the visual identity, I rejected a first proposal that looked like what you see everywhere, and asked for a Swiss luxury direction: restraint, fine rules and a single accent colour.

**How I used AI.** To produce fast: analysis, mock-ups, code. The decisions remain mine, and I must be able to justify each of them out loud.

**What my experience brings.** With Beement, I learned to deliver on my own all the way to production, and not to underestimate infrastructure: so I deploy from the start. At Sanofi, I delivered five business applications for non-technical users. The preparation sheet exists for people like them.

**The next steps I would propose.** First, connect the configurator to the WooCommerce shop with payment, so that it is live before Christmas. Then have it tested by a few customers. Then move to the second goal with a B2B ordering portal for restaurants.
