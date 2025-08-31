import { OrderEntity } from "../entities/order";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findAll(): Promise<OrderEntity[]>;
  findWithPagination(options: QueryOptions): Promise<any>;
  createOrder(order: OrderEntity): Promise<void>;
  updateOrder(order: OrderEntity): Promise<void>;
  deleteOrder(id: string): Promise<void>;
  save(order: OrderEntity): Promise<void>;
}
