import { eq } from "drizzle-orm";
import { OrderEntity } from "../../../domain/entities/order";
import type { IOrderRepository } from "../../../domain/repositories/iorder.repository";
import { ordersTable } from "../schema/orders";
import { injectable, inject } from "tsyringe";
import type { Database } from "../schema";
import { EntityConverter } from "../utils/entity-converter";
import type { QueryOptions } from "../middlewares/queryParser";
import { runQuery } from "../utils/queryEngine";

@injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @inject("Database") private db: Database,
  ) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const result = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    return result.length > 0 ? EntityConverter.fromRow(OrderEntity, result[0]) : null;
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const results = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId));
    return results.map(row => EntityConverter.fromRow(OrderEntity, row));
  }

  async findAll(): Promise<OrderEntity[]> {
    const results = await this.db.select().from(ordersTable);
    return results.map(row => EntityConverter.fromRow(OrderEntity, row));
  }

  async findWithPagination(options: QueryOptions): Promise<any> {
    // Use the new global query engine
    const baseQuery = this.db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        items: ordersTable.items,
        status: ordersTable.status,
        total: ordersTable.total,
        createdAt: ordersTable.createdAt,
        updatedAt: ordersTable.updatedAt,
      })
      .from(ordersTable);

    const result = await runQuery(this.db, baseQuery, options);
    
    // Convert the raw database rows to OrderEntity objects
    const data = result.data.map((row: any) => EntityConverter.fromRow(OrderEntity, row));
    
    return {
      data,
      pagination: result.pagination
    };
  }

  async createOrder(order: OrderEntity): Promise<void> {
    await this.db
      .insert(ordersTable)
      .values({
        id: order.id,
        userId: order.userId,
        items: order.items,
        status: order.status,
        total: order.total.toString(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
  }

  async updateOrder(order: OrderEntity): Promise<void> {
    await this.db
      .update(ordersTable)
      .set({
        items: order.items,
        status: order.status,
        total: order.total.toString(),
        updatedAt: order.updatedAt
      })
      .where(eq(ordersTable.id, order.id));
  }

  async deleteOrder(id: string): Promise<void> {
    await this.db.delete(ordersTable).where(eq(ordersTable.id, id));
  }

  async save(order: OrderEntity): Promise<void> {
    const existingOrder = await this.findById(order.id);
    if (existingOrder) {
      await this.updateOrder(order);
    } else {
      await this.createOrder(order);
    }
  }
}
