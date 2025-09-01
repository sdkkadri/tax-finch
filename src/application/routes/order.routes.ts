import { Hono } from "hono";
import { OrderController } from "../controller/order.controller";
import { zValidator } from "@hono/zod-validator";
import { container } from "tsyringe";
import { z } from "zod";

const orderRoutes = new Hono();
const orderController = container.resolve(OrderController);
const idParamSchema = z.object({ id: z.string().min(1) });
const userIdParamSchema = z.object({ userId: z.string().min(1) });

// GET /orders - Get all orders with pagination, sorting, and filtering
orderRoutes.get("/", (c) => {
  return orderController.getAll(c);
});

// POST /orders - Create a new order
orderRoutes.post("/", (c) => {
  return orderController.create(c);
});

// GET /orders/:id - Get order by ID
orderRoutes.get("/:id", zValidator("param", idParamSchema), (c) => {
  return orderController.getById(c);
});

// POST /orders/:id/confirm - Confirm an order
orderRoutes.post("/:id/confirm", zValidator("param", idParamSchema), (c) => {
  return orderController.confirm(c);
});

// POST /orders/:id/ship - Ship an order
orderRoutes.post("/:id/ship", zValidator("param", idParamSchema), (c) => {
  return orderController.ship(c);
});

// GET /orders/user/:userId - Get orders for a specific user (no pagination)
orderRoutes.get("/user/:userId", zValidator("param", userIdParamSchema), (c) => {
  return orderController.getUserOrders(c);
});

// GET /orders/user/:userId/paginated - Get paginated orders for a specific user with query engine
orderRoutes.get("/user/:userId/paginated", zValidator("param", userIdParamSchema), (c) => {
  return orderController.getUserOrdersWithPagination(c);
});

// GET /orders/:id/discount - Get order with discount calculation
orderRoutes.get("/:id/discount", zValidator("param", idParamSchema), (c) => {
  return orderController.getOrderWithDiscount(c);
});

export default orderRoutes;
