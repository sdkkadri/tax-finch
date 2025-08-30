import { pgTable, varchar, timestamp, text, boolean, integer } from "drizzle-orm/pg-core";

export const orderStatusesTable = pgTable("order_statuses", {
 id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
