import type { OrderItem } from "vo";
import { OrderStatus } from "vo";

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly status: OrderStatus,
    public readonly total: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(userId: string, items: OrderItem[]): OrderEntity {
    if (!items.length) {
      throw new Error("Order must have at least one item");
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return new OrderEntity(
      crypto.randomUUID(),
      userId,
      items,
      OrderStatus.PENDING,
      total,
      new Date(),
      new Date(),
    );
  }

  confirm(): OrderEntity {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be confirmed");
    }

    return new OrderEntity(
      this.id,
      this.userId,
      this.items,
      OrderStatus.CONFIRMED,
      this.total,
      this.createdAt,
      new Date(),
    );
  }

  ship(): OrderEntity {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error("Only confirmed orders can be shipped");
    }

    return new OrderEntity(
      this.id,
      this.userId,
      this.items,
      OrderStatus.SHIPPED,
      this.total,
      this.createdAt,
      new Date(),
    );
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      status: this.status,
      total: this.total,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
