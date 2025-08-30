import { eq } from "drizzle-orm";
import { OrderEntity } from "../../../domain/entities/order";
import type { IOrderRepository } from "../../../domain/repositories/iorder.repository";
import { OrderStatus } from "../../../domain/vo/OrderStatus";
import { ordersTable } from "../schema/orders";
import type { Database } from "../schema";

export class OrderRepository implements IOrderRepository {
  constructor(
    private db: Database,
  ) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const result = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    return result[0] ? this.toDomain(result[0]) : null;
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const results = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId));
    return results.map((row) => this.toDomain(row));
  }

  async findAll(): Promise<OrderEntity[]> {
    const results = await this.db.select().from(ordersTable);
    return results.map((row) => this.toDomain(row));
  }

  async save(order: OrderEntity): Promise<void> {
    await this.db
      .insert(ordersTable)
      .values(this.fromDomain(order))
      .onConflictDoUpdate({
        target: ordersTable.id,
        set: {
          items: order.items,
          status: order.status,
          total: order.total.toString(),
          updatedAt: order.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(ordersTable).where(eq(ordersTable.id, id));
  }

  private toDomain(row: any): OrderEntity {
    return new OrderEntity(
      row.id,
      row.userId,
      row.items, // PostgreSQL JSONB returns parsed objects
      row.status as OrderStatus,
      parseFloat(row.total), // Convert decimal string back to number
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }

  private fromDomain(order: OrderEntity) {
    return {
      id: order.id,
      userId: order.userId,
      items: order.items, // PostgreSQL JSONB can handle objects directly
      status: order.status,
      total: order.total.toString(), // Convert number to string for decimal field
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
