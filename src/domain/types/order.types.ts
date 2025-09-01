import type { OrderItem } from "../vo/OrderItem";

// Base order type (what we get from the database)
export interface BaseOrder {
  id: string;
  userId: string;
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type for joined order and user data from database
export interface OrderWithUserRow {
  // Order fields
  id: string;
  userId: string;
  items: OrderItem[]; // JSONB field with proper typing
  status: string;
  total: string;
  createdAt: Date;
  updatedAt: Date;
  // User fields
  userName: string;
  userEmail: string;
}

// Type for the final result with user details
export interface OrderWithUserDetails extends BaseOrder {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Pagination response type
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    fromPage: number;
    toPage: number;
    limit: number;
    total: string | number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
