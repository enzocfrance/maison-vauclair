import QRCode from "qrcode";
import type { Order } from "@/shared/order/order";
import { welcomeLink, type WelcomeCard } from "@/shared/welcome";
import { siteUrl } from "../config";

/** The QR code as one SVG path: the interface draws it, no markup is injected. */
export function qrMatrix(text: string): WelcomeCard["qr"] {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  const commands: string[] = [];
  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (modules.get(row, column)) commands.push(`M${column} ${row}h1v1h-1z`);
    }
  }
  return { size: modules.size, path: commands.join("") };
}

/** Everything the printed card needs; nothing when the buyer declined it. */
export function welcomeCardFor(order: Order): WelcomeCard | null {
  if (!order.welcomeCode) return null;
  const url = new URL(
    welcomeLink(
      order.cardLanguage,
      order.welcomeCode,
      order.orderDate.slice(0, 4),
    ),
    siteUrl(),
  );
  return {
    code: order.welcomeCode,
    locale: order.cardLanguage,
    url: url.toString(),
    displayUrl: `${url.host}${url.pathname}`,
    qr: qrMatrix(url.toString()),
  };
}
