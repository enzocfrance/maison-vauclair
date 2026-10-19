import { z } from "zod";
import { boxSizeIds } from "@/shared/catalog/box-sizes";
import { productSchema } from "@/shared/catalog/product";
import { locales } from "@/shared/i18n/locales";
import { buyerSchema, isoDateSchema, recipientSchema } from "./order-request";

/** VC-2026-0142: one sequence per year. */
export const orderIdPattern = /^VC-\d{4}-\d{4,}$/;

const centsSchema = z.number().int().nonnegative();

/** A stored order. Products are copied so the sheet never changes with the catalog. */
export const orderSchema = z.object({
  id: z.string().regex(orderIdPattern),
  /** Unguessable key of the customer's confirmation page. */
  accessToken: z.string().regex(/^[a-f0-9]{32}$/),
  createdAt: z.iso.datetime(),
  /** Business date of the order: today in Zurich, or the simulated date of a demo. */
  orderDate: isoDateSchema,
  simulatedDate: z.boolean(),
  locale: z.enum(locales),
  sizeId: z.enum(boxSizeIds),
  items: z.array(productSchema).min(1),
  price: z.object({
    productsCents: centsSchema,
    packagingCents: centsSchema,
    totalCents: centsSchema,
  }),
  delivery: z.object({
    shipDate: isoDateSchema,
    deliveryDate: isoDateSchema,
    profile: z.enum(["fresh", "ambient"]),
  }),
  expectedDeliveryDate: isoDateSchema,
  recipient: recipientSchema,
  cardLanguage: z.enum(locales),
  message: z.string(),
  welcomeCode: z.string().nullable(),
  buyer: buyerSchema,
});

export type Order = z.infer<typeof orderSchema>;

export type OrderDraft = Omit<Order, "id">;

export function formatOrderId(year: string, sequence: number): string {
  return `VC-${year}-${String(sequence).padStart(4, "0")}`;
}
