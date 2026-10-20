import { todayInZurich } from "@/shared/delivery/calendar";
import { estimateDelivery, shippingProfile } from "@/shared/delivery/delivery";
import type { OrderRequest } from "@/shared/order/order-request";
import type { CatalogRepository } from "../catalog/catalog-repository";
import { createOrder } from "./create-order";
import type { OrderRepository } from "./order-repository";

/** What the customer filled in, and when: UTC, Zurich is two hours ahead in October. */
type DemoOrder = { placedAt: string } & Pick<
  OrderRequest,
  | "locale"
  | "sizeId"
  | "productIds"
  | "recipient"
  | "cardLanguage"
  | "message"
  | "welcomeCard"
  | "buyer"
>;

/**
 * Fictitious orders for the presentation of Wednesday 21 October 2026, placed
 * on the 20th and early on the 21st. The team space opens on 7 boxes to ship
 * that day, 2 on Thursday 22 and 3 on Monday 26 (fresh boxes leave Monday to
 * Wednesday only). People, addresses and messages are invented.
 */
export const demoOrders: readonly DemoOrder[] = [
  {
    placedAt: "2026-10-20T06:14:00.000Z",
    locale: "fr",
    sizeId: "classic",
    productIds: [
      "gruyere-aop-18-months",
      "vaud-tomme",
      "broye-cured-ham",
      "chasselas-lavaux-aoc",
      "vaud-bricelets",
      "mountain-honey",
    ],
    recipient: {
      name: "Hélène Rochat",
      street: "Chemin des Vignes 8",
      postalCode: "1820",
      city: "Montreux",
    },
    cardLanguage: "fr",
    message:
      "Bon anniversaire, maman ! Un petit tour du canton sans quitter la maison. Je t'embrasse, Camille",
    welcomeCard: true,
    buyer: { name: "Camille Rochat", email: "camille.rochat@example.com" },
  },
  {
    placedAt: "2026-10-20T07:02:00.000Z",
    locale: "de",
    sizeId: "large",
    productIds: [
      "vacherin-mont-d-or-aop",
      "etivaz-aop",
      "tete-de-moine-aop",
      "valais-dried-beef-igp",
      "vaud-sausage-igp",
      "pinot-noir-chablais-aoc",
      "vaud-vin-cuit",
      "benichon-mustard",
      "dark-chocolate-70",
    ],
    recipient: {
      name: "Familie Keller",
      street: "Lindenweg 14",
      postalCode: "8032",
      city: "Zürich",
    },
    cardLanguage: "de",
    message:
      "Vielen Dank für eure Gastfreundschaft! Ein kleiner Gruss vom Genfersee. Thomas und Sandra",
    welcomeCard: true,
    buyer: { name: "Thomas Brunner", email: "thomas.brunner@example.com" },
  },
  {
    placedAt: "2026-10-20T09:37:00.000Z",
    locale: "fr",
    sizeId: "small",
    productIds: [
      "vaud-sausage-igp",
      "boutefas-aop",
      "gamay-la-cote-aoc",
      "plum-jam",
    ],
    recipient: {
      name: "Julien Pittet",
      street: "Rue de Lausanne 25",
      postalCode: "1950",
      city: "Sion",
    },
    cardLanguage: "fr",
    message:
      "Félicitations pour ton nouveau poste ! À fêter ensemble très vite. Marc",
    welcomeCard: false,
    buyer: { name: "Marc Pittet", email: "marc.pittet@example.com" },
  },
  {
    placedAt: "2026-10-20T10:55:00.000Z",
    locale: "de",
    sizeId: "small",
    productIds: [
      "tete-de-moine-aop",
      "valais-dried-beef-igp",
      "mountain-honey",
      "dark-chocolate-70",
    ],
    recipient: {
      name: "Jonas Frei",
      street: "Bergstrasse 22",
      postalCode: "9000",
      city: "St. Gallen",
    },
    cardLanguage: "de",
    message: "Viel Erfolg für die Prüfungen! Ich denke an dich. Nina",
    welcomeCard: true,
    buyer: { name: "Nina Frei", email: "nina.frei@example.com" },
  },
  {
    placedAt: "2026-10-20T12:20:00.000Z",
    locale: "de",
    sizeId: "classic",
    productIds: [
      "gruyere-aop-18-months",
      "vacherin-fribourgeois-aop",
      "smoked-country-bacon",
      "vaud-cabbage-sausage-igp",
      "vaud-bricelets",
      "mountain-honey",
    ],
    recipient: {
      name: "Ruth Schmid",
      street: "Kirchgasse 3",
      postalCode: "3011",
      city: "Bern",
    },
    cardLanguage: "de",
    message:
      "Liebe Grosi, alles Gute zum 80. Geburtstag! Ein Stück Waadt für dich. Deine Lea",
    welcomeCard: true,
    buyer: { name: "Lea Schmid", email: "lea.schmid@example.com" },
  },
  {
    placedAt: "2026-10-20T15:48:00.000Z",
    locale: "fr",
    sizeId: "classic",
    productIds: [
      "etivaz-aop",
      "tete-de-moine-aop",
      "broye-cured-ham",
      "saint-saphorin-aoc",
      "benichon-mustard",
      "dark-chocolate-70",
    ],
    recipient: {
      name: "Daniel Huber",
      street: "Rosenweg 7",
      postalCode: "4052",
      city: "Basel",
    },
    cardLanguage: "de",
    message:
      "Danke für alles, lieber Daniel. Herzliche Grüsse aus Lausanne, Sophie",
    welcomeCard: true,
    buyer: { name: "Sophie Favre", email: "sophie.favre@example.com" },
  },
  {
    placedAt: "2026-10-20T19:05:00.000Z",
    locale: "fr",
    sizeId: "large",
    productIds: [
      "gruyere-aop-18-months",
      "vacherin-mont-d-or-aop",
      "vaud-tomme",
      "etivaz-aop",
      "valais-dried-beef-igp",
      "boutefas-aop",
      "dezaley-grand-cru-aoc",
      "vaud-sparkling-brut",
      "vaud-vin-cuit",
    ],
    recipient: {
      name: "Pierre Monnier",
      street: "Rue de la Côte 12",
      postalCode: "2000",
      city: "Neuchâtel",
    },
    cardLanguage: "fr",
    message:
      "Merci pour ces vingt années à nos côtés. Belle retraite, Pierre ! Toute l'équipe de l'atelier",
    welcomeCard: true,
    buyer: { name: "Nathalie Girard", email: "nathalie.girard@example.com" },
  },
  {
    placedAt: "2026-10-21T04:45:00.000Z",
    locale: "fr",
    sizeId: "small",
    productIds: [
      "vacherin-mont-d-or-aop",
      "vaud-tomme",
      "plum-jam",
      "vaud-bricelets",
    ],
    recipient: {
      name: "Anne Bovet",
      street: "Chemin des Pâquerettes 3",
      postalCode: "1260",
      city: "Nyon",
    },
    cardLanguage: "fr",
    message:
      "Pour fêter ta nouvelle maison ! Plein de bonheur à vous trois. Léa",
    welcomeCard: true,
    buyer: { name: "Léa Bovet", email: "lea.bovet@example.com" },
  },
  {
    placedAt: "2026-10-21T05:05:00.000Z",
    locale: "fr",
    sizeId: "large",
    productIds: [
      "gruyere-aop-18-months",
      "etivaz-aop",
      "vacherin-fribourgeois-aop",
      "vaud-tomme",
      "broye-cured-ham",
      "vaud-sausage-igp",
      "saint-saphorin-aoc",
      "plum-jam",
      "vaud-bricelets",
    ],
    recipient: {
      name: "Valérie Monod",
      street: "Avenue de Rumine 40",
      postalCode: "1005",
      city: "Lausanne",
    },
    cardLanguage: "fr",
    message:
      "Avec nos remerciements pour cette belle année de collaboration. Romain Délèze et l'équipe",
    welcomeCard: true,
    buyer: { name: "Romain Délèze", email: "romain.deleze@example.com" },
  },
  {
    placedAt: "2026-10-21T05:30:00.000Z",
    locale: "de",
    sizeId: "classic",
    productIds: [
      "vaud-sausage-igp",
      "vaud-cabbage-sausage-igp",
      "chasselas-lavaux-aoc",
      "pinot-noir-chablais-aoc",
      "mountain-honey",
      "vaud-vin-cuit",
    ],
    recipient: {
      name: "Beat Zürcher",
      street: "Seeweg 9",
      postalCode: "6006",
      city: "Luzern",
    },
    cardLanguage: "de",
    message:
      "Alles Gute zum Geburtstag, Bruder! Auf ein Glas am Samstag. Martin",
    welcomeCard: true,
    buyer: { name: "Martin Zürcher", email: "martin.zuercher@example.com" },
  },
  {
    placedAt: "2026-10-21T06:12:00.000Z",
    locale: "fr",
    sizeId: "classic",
    productIds: [
      "gruyere-aop-18-months",
      "vacherin-fribourgeois-aop",
      "broye-cured-ham",
      "smoked-country-bacon",
      "gamay-la-cote-aoc",
      "benichon-mustard",
    ],
    recipient: {
      name: "Famille Jaquet",
      street: "Rue des Alpes 9",
      postalCode: "1700",
      city: "Fribourg",
    },
    cardLanguage: "fr",
    message: "Merci de nous avoir si bien accueillis cet été. Isabelle et Jean",
    welcomeCard: true,
    buyer: { name: "Isabelle Mercier", email: "isabelle.mercier@example.com" },
  },
  {
    placedAt: "2026-10-21T06:40:00.000Z",
    locale: "fr",
    sizeId: "small",
    productIds: [
      "boutefas-aop",
      "vaud-sparkling-brut",
      "dark-chocolate-70",
      "vaud-bricelets",
    ],
    recipient: {
      name: "Claire Cuendet",
      street: "Route de Florissant 18",
      postalCode: "1206",
      city: "Genève",
    },
    cardLanguage: "fr",
    message: "Pour toi, avec tout mon amour. Olivier",
    welcomeCard: false,
    buyer: { name: "Olivier Cuendet", email: "olivier.cuendet@example.com" },
  },
];

export type DemoOrderDependencies = {
  catalog: CatalogRepository;
  orders: OrderRepository;
};

/**
 * Fills an empty order store with the demo orders, through createOrder like
 * any order: prices, dates and numbers come from the real rules. A store that
 * already holds orders is left untouched. Returns how many were added.
 */
export async function seedDemoOrders({
  catalog,
  orders,
}: DemoOrderDependencies): Promise<number> {
  if ((await orders.list()).length > 0) return 0;

  const products = await catalog.listProducts();
  for (const { placedAt, ...request } of demoOrders) {
    const items = products.filter((product) =>
      request.productIds.includes(product.id),
    );
    const placed = new Date(placedAt);
    // The date the customer saw on the delivery step, as the browser computes it.
    const seen = estimateDelivery(
      todayInZurich(placed),
      shippingProfile(items),
    );
    const result = await createOrder(
      {
        ...request,
        ageConfirmed: items.some((item) => item.alcohol),
        expectedDeliveryDate: seen.deliveryDate,
      },
      { catalog, orders, now: () => placed },
    );
    if (!result.ok) {
      throw new Error(
        `Demo order of ${placedAt} refused: ${Object.keys(result.errors).join(", ")}`,
      );
    }
  }
  return demoOrders.length;
}
