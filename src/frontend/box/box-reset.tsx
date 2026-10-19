"use client";

import { useEffect } from "react";
import { boxActions } from "./box-store";

/** Once the order is stored, the next visit starts with an empty box. */
export function BoxReset() {
  useEffect(() => {
    boxActions.clear();
  }, []);
  return null;
}
