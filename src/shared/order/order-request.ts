import { z } from "zod";
import { boxSizeIds, boxSizes } from "@/shared/catalog/box-sizes";
import type { Product } from "@/shared/catalog/product";
import { isIsoDate } from "@/shared/delivery/calendar";
import { locales } from "@/shared/i18n/locales";

export const orderApiPath = "/api/orders";
export const messageMaxLength = 300;

export const isoDateSchema = z.string().refine(isIsoDate);

export const recipientSchema = z.strictObject({
  name: z.string().trim().min(2).max(80),
  street: z.string().trim().min(3).max(100),
  /** Swiss postal codes: four digits, never starting with 0. */
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{3}$/),
  city: z.string().trim().min(2).max(60),
});

export const buyerSchema = z.strictObject({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().pipe(z.email().max(120)),
});

/** What the browser sends. Prices and dates are never trusted: the server recomputes them. */
export const orderRequestSchema = z.strictObject({
  locale: z.enum(locales),
  sizeId: z.enum(boxSizeIds),
  productIds: z.array(z.string().min(1).max(60)).min(1).max(9),
  recipient: recipientSchema,
  cardLanguage: z.enum(locales),
  message: z.string().trim().max(messageMaxLength),
  welcomeCard: z.boolean(),
  buyer: buyerSchema,
  ageConfirmed: z.boolean(),
  /** The date the customer saw, to tell them if the server's differs. */
  expectedDeliveryDate: isoDateSchema,
  demoDate: isoDateSchema.optional(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;

export const orderFields = [
  "recipient.name",
  "recipient.street",
  "recipient.postalCode",
  "recipient.city",
  "message",
  "buyer.name",
  "buyer.email",
  "ageConfirmed",
  "box",
] as const;

export type OrderField = (typeof orderFields)[number];

/** Invalid fields; the messages live in the dictionaries. */
export type OrderErrors = Partial<Record<OrderField, true>>;

export const createdOrderResponseSchema = z.object({
  orderId: z.string(),
  accessToken: z.string(),
});

export const orderErrorsResponseSchema = z.object({
  errors: z.partialRecord(z.enum(orderFields), z.literal(true)),
});

export function collectErrors(error: z.ZodError): OrderErrors {
  const errors: OrderErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const field = (orderFields as readonly string[]).includes(path)
      ? (path as OrderField)
      : "box";
    errors[field] = true;
  }
  return errors;
}

export type BoxContents =
  { ok: true; items: Product[] } | { ok: false; errors: OrderErrors };

/** The box must be exactly full of known products, and wine requires the 16+ confirmation. */
export function checkBoxContents(
  request: Pick<OrderRequest, "sizeId" | "productIds" | "ageConfirmed">,
  catalog: readonly Product[],
): BoxContents {
  const { productIds } = request;
  const items = productIds.flatMap(
    (id) => catalog.find((product) => product.id === id) ?? [],
  );
  const isExactlyFull =
    new Set(productIds).size === productIds.length &&
    items.length === productIds.length &&
    items.length === boxSizes[request.sizeId].itemCount;

  if (!isExactlyFull) return { ok: false, errors: { box: true } };
  if (items.some((item) => item.alcohol) && !request.ageConfirmed) {
    return { ok: false, errors: { ageConfirmed: true } };
  }
  return { ok: true, items };
}
