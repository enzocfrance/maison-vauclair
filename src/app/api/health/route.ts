export const dynamic = "force-dynamic";

/** Probe for the Docker healthcheck and Dokploy. */
export function GET() {
  return Response.json({ status: "ok" });
}
