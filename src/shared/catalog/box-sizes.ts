export const boxSizeIds = ["small", "classic", "large"] as const;

export type BoxSizeId = (typeof boxSizeIds)[number];

export type BoxSize = {
  id: BoxSizeId;
  itemCount: number;
  /** Box, insulated packing, card and shipping: no other fee is added. */
  packagingCents: number;
  /** Shown as « Le plus offert ». */
  featured: boolean;
};

export const boxSizes: Record<BoxSizeId, BoxSize> = {
  small: { id: "small", itemCount: 4, packagingCents: 900, featured: false },
  classic: {
    id: "classic",
    itemCount: 6,
    packagingCents: 1200,
    featured: true,
  },
  large: { id: "large", itemCount: 9, packagingCents: 1500, featured: false },
};

export function isBoxSizeId(value: unknown): value is BoxSizeId {
  return (
    typeof value === "string" &&
    (boxSizeIds as readonly string[]).includes(value)
  );
}
