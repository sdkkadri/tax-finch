import { OrderEntity } from "../../domain/entities/order";
import type { IOrderRepository } from "../../domain/repositories/iorder.repository";
import type { IUserRepository } from "../../domain/repositories/iuser.repository";
import { OrderDomainService } from "../../domain/services/order.domainservice";
import type { CreateOrderDTOType } from "../dto";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";
import { injectable, inject } from "tsyringe";
import { IOrderRepository as IOrderRepositoryToken } from "../../domain/repositories/iorder.repository";
import { IUserRepository as IUserRepositoryToken } from "../../domain/repositories/iuser.repository";
import type { PaginatedResponse, OrderWithUserDetails, BaseOrder } from "../../domain/types";

@injectable()
export class OrderService {
  constructor(
    @inject(IOrderRepositoryToken) private orderRepository: IOrderRepository,
    @inject(IUserRepositoryToken) private userRepository: IUserRepository,
  ) {}

  async createOrder(dto: CreateOrderDTOType): Promise<OrderEntity> {
    // Verify user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate order items using domain service
    if (!OrderDomainService.validateOrderItems(dto.items)) {
      throw new Error("Invalid order items");
    }

    const order = OrderEntity.create(dto.userId, dto.items);
    await this.orderRepository.save(order);
    return order;
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getOrdersWithPagination(options: QueryOptions): Promise<PaginatedResponse<OrderWithUserDetails>> {
    return await this.orderRepository.findOrdersWithUserDetails(options);
  }

  async getUserOrdersWithPagination(userId: string, options: QueryOptions): Promise<PaginatedResponse<BaseOrder>> {
    return await this.orderRepository.findUserOrdersWithPagination(userId, options);
  }

  async confirmOrder(id: string): Promise<OrderEntity> {
    const order = await this.getOrderById(id);
    const confirmedOrder = order.confirm();
    await this.orderRepository.save(confirmedOrder);
    return confirmedOrder;
  }

  async shipOrder(id: string): Promise<OrderEntity> {
    const order = await this.getOrderById(id);
    const shippedOrder = order.ship();
    await this.orderRepository.save(shippedOrder);
    return shippedOrder;
  }

  async getUserOrders(userId: string): Promise<OrderEntity[]> {
    return await this.orderRepository.findByUserId(userId);
  }

  async getAllOrders(): Promise<OrderEntity[]> {
    return await this.orderRepository.findAll();
  }

  async getOrderWithDiscount(
    id: string,
  ): Promise<{ order: OrderEntity; discount: number; finalTotal: number }> {
    const order = await this.getOrderById(id);
    const discount = OrderDomainService.calculateDiscount(order);
    const finalTotal = OrderDomainService.calculateTotalWithDiscount(order);

    return {
      order,
      discount,
      finalTotal,
    };
  }
}
