import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./users";
import { ordersTable } from "./orders";
import { orderStatusesTable } from "./order_statuses";
import { itemsTable } from "./items";



export const schema = {
  users: usersTable,
  orders: ordersTable,
  orderStatuses: orderStatusesTable,
  items: itemsTable,
};

// Define the Database type using Drizzle's infer functionality
export type Database = ReturnType<typeof drizzle<typeof schema>>;
