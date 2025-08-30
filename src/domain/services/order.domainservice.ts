import { OrderEntity } from "entities";
import type { OrderItem } from "vo";

export class OrderDomainService {
  static validateOrderItems(items: OrderItem[]): boolean {
    return (
      items.length > 0 &&
      items.every(
        (item) =>
          item.quantity > 0 &&
          item.price > 0 &&
          item.productId.trim() !== "" &&
          item.productName.trim() !== "",
      )
    );
  }

  static calculateDiscount(order: OrderEntity): number {
    if (order.total > 1000) return 0.1; // 10% discount for orders over $1000
    if (order.total > 500) return 0.05; // 5% discount for orders over $500
    return 0;
  }

  static calculateTotalWithDiscount(order: OrderEntity): number {
    const discount = this.calculateDiscount(order);
    return order.total * (1 - discount);
  }
}
