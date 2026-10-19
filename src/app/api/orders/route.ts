import { orderRateLimiter, placeOrder } from "@/backend/container";
import { clientAddress } from "@/backend/rate-limit";
import type { OrderErrors } from "@/shared/order/order-request";

/** A full order weighs about 1 KB: anything much larger is not one. */
const maxBodyLength = 16_384;

export async function POST(request: Request) {
  // Refused before reading, so a huge body never reaches the server's memory.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBodyLength) return refuse({ box: true }, 413);

  if (!orderRateLimiter.allow(clientAddress(request.headers))) {
    return Response.json({ error: "too_many_orders" }, { status: 429 });
  }

  const body = await request.text();
  if (body.length > maxBodyLength) return refuse({ box: true }, 413);

  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return refuse({ box: true }, 400);
  }

  const result = await placeOrder(input);
  if (!result.ok) return refuse(result.errors, 422);

  return Response.json(
    { orderId: result.order.id, accessToken: result.order.accessToken },
    { status: 201 },
  );
}

function refuse(errors: OrderErrors, status: number) {
  return Response.json({ errors }, { status });
}
