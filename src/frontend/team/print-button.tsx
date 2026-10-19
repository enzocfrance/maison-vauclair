"use client";

import { primaryAction } from "@/frontend/components/action-styles";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={primaryAction}
    >
      {label}
    </button>
  );
}
