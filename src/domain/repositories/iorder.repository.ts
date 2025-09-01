import { OrderEntity } from "../entities/order";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";
import type { PaginatedResponse, BaseOrder } from "../types";

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findAll(): Promise<OrderEntity[]>;
  findWithPagination(options: QueryOptions): Promise<PaginatedResponse<OrderEntity>>;
  findUserOrdersWithPagination(userId: string, options: QueryOptions): Promise<PaginatedResponse<BaseOrder>>;
  createOrder(order: OrderEntity): Promise<void>;
  updateOrder(order: OrderEntity): Promise<void>;
  deleteOrder(id: string): Promise<void>;
  save(order: OrderEntity): Promise<void>;
}
