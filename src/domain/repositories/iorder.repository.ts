import { OrderEntity } from "../entities/order";

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findAll(): Promise<OrderEntity[]>;
  createOrder(order: OrderEntity): Promise<void>;
  updateOrder(order: OrderEntity): Promise<void>;
  deleteOrder(id: string): Promise<void>;
}
