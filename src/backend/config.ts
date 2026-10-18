/** Read at call time: Dokploy injects these when the container starts, not at build time. */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}
