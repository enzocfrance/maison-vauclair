import { randomUUID } from "node:crypto";
import {
  link,
  mkdir,
  readdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  formatOrderId,
  orderIdPattern,
  orderSchema,
  type Order,
  type OrderDraft,
} from "@/shared/order/order";
import type { OrderRepository } from "./order-repository";

const orderFilePattern = /^VC-(\d{4})-(\d+)\.json$/;
const maxAttempts = 50;

/**
 * One JSON file per order. A number is claimed by hard-linking a complete
 * temporary file: the link fails if the number is taken, so two simultaneous
 * orders never share a number and no reader ever sees a half-written file.
 */
export class JsonFileOrderRepository implements OrderRepository {
  constructor(private readonly directory: string) {}

  async create(draft: OrderDraft): Promise<Order> {
    await mkdir(this.directory, { recursive: true });
    const year = draft.orderDate.slice(0, 4);
    const temporaryFile = path.join(this.directory, `.${randomUUID()}.tmp`);

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const order: Order = {
          ...draft,
          id: formatOrderId(year, (await this.lastSequence(year)) + 1),
        };
        await writeFile(temporaryFile, JSON.stringify(order, null, 2));
        try {
          await link(temporaryFile, this.fileOf(order.id));
          return order;
        } catch (error) {
          if (!hasCode(error, "EEXIST")) throw error;
        }
      }
      throw new Error("Could not allocate an order number");
    } finally {
      await unlink(temporaryFile).catch(() => undefined);
    }
  }

  async findById(id: string): Promise<Order | null> {
    // The id becomes a file name: anything else than VC-AAAA-NNNN is refused.
    if (!orderIdPattern.test(id)) return null;
    try {
      const content = await readFile(this.fileOf(id), "utf8");
      return orderSchema.parse(JSON.parse(content));
    } catch (error) {
      if (hasCode(error, "ENOENT")) return null;
      throw error;
    }
  }

  async list(): Promise<Order[]> {
    const files = await this.orderFiles();
    const orders = await Promise.all(
      files.map((file) =>
        this.findById(file.replace(/\.json$/, "")).catch(() => null),
      ),
    );
    return orders
      .filter((order): order is Order => order !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private async lastSequence(year: string): Promise<number> {
    const sequences = (await this.orderFiles()).flatMap((file) => {
      const match = orderFilePattern.exec(file);
      return match && match[1] === year ? [Number(match[2])] : [];
    });
    return Math.max(0, ...sequences);
  }

  private async orderFiles(): Promise<string[]> {
    try {
      return (await readdir(this.directory)).filter((file) =>
        orderFilePattern.test(file),
      );
    } catch (error) {
      if (hasCode(error, "ENOENT")) return [];
      throw error;
    }
  }

  private fileOf(id: string): string {
    return path.join(this.directory, `${id}.json`);
  }
}

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}
