import { usersTable } from "../schema/users";
import { ordersTable } from "../schema/orders";

export const queryEngineConfig = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOrdering: "-createdAt",

  // Per-resource defaults
  resources: {
    users: {
      sortConfig: {
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      },
      filterConfig: {
        name: { table: usersTable, field: "name", operator: "like" as const },
        email: { table: usersTable, field: "email", operator: "like" as const },
      },
      defaultOrdering: "name",
    },

    orders: {
      sortConfig: {
        id: ordersTable.id,
        total: ordersTable.total,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
      },
      filterConfig: {
        status: { table: ordersTable, field: "status", operator: "eq" as const },
        minTotal: { table: ordersTable, field: "total", operator: "gte" as const },
      },
      defaultOrdering: "-createdAt",
    },
  },
};

export type QueryEngineConfig = typeof queryEngineConfig;
export type ResourceConfig = QueryEngineConfig["resources"][keyof QueryEngineConfig["resources"]];
