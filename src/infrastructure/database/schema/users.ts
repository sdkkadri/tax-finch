import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const usersTable = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => nanoid()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
