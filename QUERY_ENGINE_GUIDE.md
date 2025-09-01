# Global Query Engine Guide

This guide explains how to use the new global query engine system that provides automatic pagination, sorting, and filtering across all resources.

## Overview

The global query engine system consists of three main components:

1. **Global Configuration** (`queryEngine.config.ts`) - Defines defaults and per-resource configurations
2. **Query Parser Middleware** (`queryParser.ts`) - Automatically parses query parameters
3. **Generic Query Engine** (`queryEngine.ts`) - Executes queries with the parsed options

## Setup

### 1. Configure the Middleware

Add the `queryParser` middleware to your routes:

```typescript
import { queryParser } from "@/infrastructure/database/middlewares";

// Apply to all routes or specific route groups
app.use("*", queryParser());
// OR
app.use("/users/*", queryParser());
app.use("/orders/*", queryParser());
```

### 2. Use in Controllers

Controllers now automatically receive parsed query options:

```typescript
async getAll(c: Context) {
  // Get query options from middleware (set by queryParser)
  const queryOptions = c.get("queryOptions") as QueryOptions;

  if (!queryOptions) {
    throw new AppError("Query options not found. Make sure queryParser middleware is configured.", 500);
  }

  // Get paginated results using the new query engine
  const result = await this.userService.getUsersWithPagination(queryOptions);

  return c.json(result);
}
```

### 3. Use in Repositories

Repositories use the `runQuery` function with a base query:

```typescript
async findWithPagination(options: QueryOptions): Promise<any> {
  // Use the new global query engine
  const baseQuery = this.db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable);

  const result = await runQuery(this.db, baseQuery, options);

  // Convert the raw database rows to UserEntity objects
  const data = result.data.map((row: any) => EntityConverter.fromRow(UserEntity, row));

  return {
    data,
    pagination: result.pagination
  };
}
```

## Query Parameters

The system automatically handles these query parameters:

### Pagination

- `from_page` - Starting page (default: 1)
- `to_page` - Ending page (default: same as from_page)
- `limit` - Items per page (default: 20, max: 100)

### Sorting

- `ordering` - Sort field with optional direction prefix
  - `name` - Sort by name ascending
  - `-name` - Sort by name descending
  - `createdAt` - Sort by creation date ascending
  - `-createdAt` - Sort by creation date descending

### Filtering

- Any other query parameter is treated as a filter
- Filters are automatically applied based on the resource configuration

## Example URLs

```
# Basic pagination
GET /users?from_page=1&limit=10

# Sorting
GET /users?ordering=-createdAt&limit=20

# Filtering
GET /users?name=john&email=gmail

# Combined
GET /users?from_page=2&limit=15&ordering=name&name=john
```

## Configuration

### Global Defaults

```typescript
export const queryEngineConfig = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOrdering: "-createdAt",
  // ... resource configurations
};
```

### Per-Resource Configuration

```typescript
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
}
```

### Supported Filter Operators

- `eq` - Equals
- `like` - LIKE with wildcards
- `gte` - Greater than or equal
- `lte` - Less than or equal

## Response Format

The query engine returns a standardized response:

```typescript
{
  data: UserEntity[],
  pagination: {
    fromPage: number,
    toPage: number,
    limit: number,
    total: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

## Benefits

1. **Consistent API** - All resources use the same pagination, sorting, and filtering patterns
2. **Automatic Parsing** - No need to manually parse query parameters in each controller
3. **Type Safety** - Full TypeScript support with proper typing
4. **Flexible Configuration** - Easy to customize per-resource behavior
5. **Performance** - Efficient database queries with proper indexing support

## Migration from Old System

### Before (Old Query Helper)

```typescript
const queryParams = new URLSearchParams(
  c.req.query() as Record<string, string>
);
const queryOptions = parseQueryParams(queryParams);
const result = await paginate(db, usersTable, "id", queryOptions);
```

### After (New Query Engine)

```typescript
const queryOptions = c.get("queryOptions") as QueryOptions;
const baseQuery = db.select().from(usersTable);
const result = await runQuery(db, baseQuery, queryOptions);
```

The new system is more declarative and requires less boilerplate code while providing more functionality.
