import type { Context } from "hono";
import { OrderService } from "../service/order.service";
import { inject, injectable } from "tsyringe";
import { AppError } from "../utils/app-error";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";

@injectable()
export class OrderController {
  constructor(@inject(OrderService) private orderService: OrderService){}

  async getAll(c: Context) {
    // Get query options from middleware (set by queryParser)
    const queryOptions = c.get("queryOptions") as QueryOptions;
    
    if (!queryOptions) {
      throw new AppError("Query options not found. Make sure queryParser middleware is configured.", 500);
    }
    
    // Get paginated results using the new query engine
    const result = await this.orderService.getOrdersWithPagination(queryOptions);
    
    return c.json(result);
  }

  async create(c: Context) {
    const body = await c.req.json();
    const order = await this.orderService.createOrder(body);
    return c.json({ message: "Order created", order }, 201);
  }

  async getById(c: Context) {
    const id = c.req.param("id");
    const order = await this.orderService.getOrderById(id);
    return c.json({ order });
  }

  async confirm(c: Context) {
    const id = c.req.param("id");
    const order = await this.orderService.confirmOrder(id);
    return c.json({ message: "Order confirmed", order });
  }

  async ship(c: Context) {
    const id = c.req.param("id");
    const order = await this.orderService.shipOrder(id);
    return c.json({ message: "Order shipped", order });
  }

  async getUserOrders(c: Context) {
    const userId = c.req.param("userId");
    const orders = await this.orderService.getUserOrders(userId);
    return c.json({ orders });
  }

  async getOrderWithDiscount(c: Context) {
    const id = c.req.param("id");
    const result = await this.orderService.getOrderWithDiscount(id);
    return c.json(result);
  }
}
