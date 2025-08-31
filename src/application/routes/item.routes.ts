import { Hono } from "hono";
import { ItemController } from "../controller/item.controller";
import { container } from "tsyringe";

const itemRoutes = new Hono();
const itemController = container.resolve(ItemController);

// GET /items - Get all items
itemRoutes.get("/", (c) => {
  return itemController.getAll(c);
});

// POST /items - Create a new item
itemRoutes.post("/", (c) => {
  return itemController.create(c);
});

export default itemRoutes;
