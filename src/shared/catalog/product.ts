import { z } from "zod";

export const categories = ["cheese", "charcuterie", "wine", "grocery"] as const;

export type Category = (typeof categories)[number];

export const sizeUnits = ["g", "cl", "piece"] as const;

const localizedText = z.strictObject({
  fr: z.string().min(1),
  de: z.string().min(1),
});

export const productSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(categories),
  name: localizedText,
  size: z.strictObject({
    amount: z.number().int().positive(),
    unit: z.enum(sizeUnits),
  }),
  priceCents: z.number().int().positive(),
  /** Travels refrigerated and is stored in the cold zone: ships Monday to Wednesday only. */
  fresh: z.boolean(),
  /** Requires the 16+ confirmation. */
  alcohol: z.boolean(),
});

export type Product = z.infer<typeof productSchema>;

export const catalogSchema = z
  .array(productSchema)
  .refine(
    (products) =>
      new Set(products.map((product) => product.id)).size === products.length,
    { message: "Product ids must be unique" },
  );
