import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  boxSizeIds,
  boxSizes,
  type BoxSizeId,
} from "@/shared/catalog/box-sizes";

export type BoxState = {
  sizeId: BoxSizeId | null;
  productIds: readonly string[];
};

/** Per tab, cleared when it closes: no cookie, nothing sent anywhere. */
const storageKey = "maison-vauclair:box";
const emptyBox: BoxState = { sizeId: null, productIds: [] };
const storedBoxSchema = z.object({
  sizeId: z.enum(boxSizeIds).nullable(),
  productIds: z.array(z.string()).max(20),
});

let current: BoxState | null = null;
const listeners = new Set<() => void>();

function load(): BoxState {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return emptyBox;
    const parsed = storedBoxSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyBox;
  } catch {
    return emptyBox;
  }
}

function snapshot(): BoxState {
  current ??= load();
  return current;
}

function commit(next: BoxState): void {
  current = next;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): the box lives in memory only.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const boxActions = {
  selectSize(sizeId: BoxSizeId): void {
    commit({ ...snapshot(), sizeId });
  },

  /** Adds the product if there is room, removes it if chosen. False when the box is full. */
  toggleProduct(productId: string): boolean {
    const box = snapshot();
    if (box.productIds.includes(productId)) {
      commit({
        ...box,
        productIds: box.productIds.filter((id) => id !== productId),
      });
      return true;
    }
    const capacity = box.sizeId ? boxSizes[box.sizeId].itemCount : 0;
    if (box.productIds.length >= capacity) return false;
    commit({ ...box, productIds: [...box.productIds, productId] });
    return true;
  },

  clear(): void {
    commit(emptyBox);
  },
};

export function useBox(): BoxState {
  return useSyncExternalStore(subscribe, snapshot, () => emptyBox);
}

const subscribeNever = () => () => {};

/** False while rendering on the server and hydrating, true once the stored box is read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
