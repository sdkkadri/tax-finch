import { ordersTable, usersTable } from "../schema";
import { createFilterConfigs, createSortConfig } from "../../../application/utils/queryBuilder";

/**
 * Centralized filter configuration for orders
 * No need to re-declare in each repository
 */
export const orderFilterConfig = createFilterConfigs([
  // Order table filters
  { table: ordersTable, fields: ['status', 'userId'], operator: 'eq' },
  { table: ordersTable, fields: ['total'], operator: 'gte' },
  { table: ordersTable, fields: ['maxTotal'], operator: 'lte' },
  
  // User table filters (for related data)
  { table: usersTable, fields: ['userName', 'userEmail'], operator: 'like' },
  
  // Special filters
  { table: ordersTable, fields: ['minTotal'], operator: 'gte' },
  { table: ordersTable, fields: ['maxTotal'], operator: 'lte' },
]);

/**
 * Centralized sort configuration for orders
 * No need to re-declare in each repository
 */
export const orderSortConfig = createSortConfig(ordersTable, [
  'id', 'total', 'status', 'createdAt', 'updatedAt'
]);

/**
 * Extended sort config including user fields
 */
export const orderWithUserSortConfig = {
  ...orderSortConfig,
  // User fields for sorting
  userName: usersTable.name,
  userEmail: usersTable.email,
};

/**
 * Default sort field for orders
 */
export const orderDefaultSortField = ordersTable.createdAt;
