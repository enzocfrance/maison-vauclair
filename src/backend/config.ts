import path from "node:path";

/** Read at call time: Dokploy injects these when the container starts, not at build time. */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

/** In the container: /app/data/orders, where the Dokploy volume is mounted. */
export function ordersDirectory(): string {
  return process.env.ORDERS_DIR ?? path.join(process.cwd(), "data", "orders");
}
