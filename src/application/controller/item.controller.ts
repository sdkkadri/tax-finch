import type { Context } from "hono";
import { inject, injectable } from "tsyringe";

@injectable()
export class ItemController {
  async getAll(c: Context) {
    return c.json({ items: ["Item 1", "Item 2", "Item 3"] });
  }

  async create(c: Context) {
    const body = await c.req.json();
    return c.json({ message: "Item created", item: body }, 201);
  }
}
