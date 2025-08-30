import { pgTable, varchar, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const ordersTable = pgTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => usersTable.id),
  items: jsonb("items").notNull(), // Array of OrderItem objects
  status: varchar("status", { length: 50 }).notNull(), // OrderStatus enum values
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
