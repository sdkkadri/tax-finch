import { sql } from 'drizzle-orm';

export interface QueryOptions {
  limit: number;
  cursor?: string;
  sort?: { field: string; order: "asc" | "desc" };
  filters: Record<string, string | number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    prevCursor: string | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function parseQueryParams(query: URLSearchParams): QueryOptions {
  const limit = Math.min(Math.max(parseInt(query.get("limit") || "10", 10), 1), 100); // default 10, max 100
  const cursor = query.get("cursor") || undefined;
  
  // Sorting
  const sortField = query.get("sortBy");
  const sortOrder = query.get("order")?.toLowerCase() === "desc" ? "desc" : "asc";
  let sort;
  if (sortField) {
    sort = { field: sortField, order: sortOrder as "asc" | "desc" };
  }

  // Filtering - collect all non-pagination/sorting query params as filters
  const filters: Record<string, string | number> = {};
  for (const [key, value] of query.entries()) {
    if (!["limit", "cursor", "sortBy", "order"].includes(key) && value) {
      filters[key] = isNaN(Number(value)) ? value : Number(value);
    }
  }

  return { limit, cursor, sort, filters };
}

export function buildPaginatedResponse<T>(
  data: T[],
  limit: number,
  cursorField: string,
  hasMore: boolean,
  direction: "forward" | "backward" = "forward"
): PaginatedResponse<T> {
  const firstRow = data[0] as any;
  const lastRow = data[data.length - 1] as any;

  const nextCursor = hasMore && direction === "forward" && lastRow ? String(lastRow[cursorField]) : null;
  const prevCursor = direction === "backward" ? 
    (hasMore && firstRow ? String(firstRow[cursorField]) : null) : 
    (firstRow ? String(firstRow[cursorField]) : null);

  return {
    data,
    pagination: {
      limit,
      nextCursor,
      prevCursor,
      hasNextPage: direction === "forward" ? hasMore : true,
      hasPrevPage: direction === "backward" ? hasMore : !!firstRow,
    },
  };
}

/**
 * Simple cursor-based pagination helper for Drizzle ORM
 * Handles all the complexity of building queries with filters, sorting, and pagination
 * 
 * @param db - Database connection
 * @param table - Table schema from Drizzle
 * @param cursorField - Field name to use as cursor (usually 'id' or 'createdAt')
 * @param options - Query options including filters, sorting, and pagination
 * @returns PaginatedResponse with data and navigation cursors
 * 
 * @example
 * // Simple usage - just pass the options
 * const result = await paginate(db, usersTable, 'id', options);
 * 
 * // The options come from parseQueryParams automatically
 * const options = parseQueryParams(new URLSearchParams(req.query));
 * const users = await paginate(db, usersTable, 'id', options);
 * 
 * // Supports automatic filtering, sorting, and pagination
 * // URL: /users?limit=20&cursor=abc123&sortBy=name&order=desc&name=john
 */
export async function paginate<T>(
  db: any,
  table: any,
  cursorField: string,
  options: QueryOptions
): Promise<PaginatedResponse<T>> {
  const { limit, cursor, sort, filters } = options;
  
  // Build where conditions for filters
  const whereConditions = [];
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'string') {
      whereConditions.push(sql`${table[key]} LIKE ${`%${value}%`}`);
    } else if (typeof value === 'number') {
      whereConditions.push(sql`${table[key]} = ${value}`);
    }
  }

  // Add cursor condition if provided
  if (cursor) {
    const sortOrder = sort?.order || 'asc';
    const cursorCondition = sortOrder === 'desc' 
      ? sql`${table[cursorField]} < ${cursor}`
      : sql`${table[cursorField]} > ${cursor}`;
    whereConditions.push(cursorCondition);
  }

  // Build order by clause
  const orderByField = sort?.field || cursorField;
  const orderByDirection = sort?.order || 'asc';
  const orderByClause = orderByDirection === 'desc' 
    ? sql`${table[orderByField]} DESC` 
    : sql`${table[orderByField]} ASC`;

  // Execute query
  let query = db.select().from(table);
  
  if (whereConditions.length > 0) {
    query = query.where(sql`(${sql.join(whereConditions, sql` AND `)})`);
  }

  const results = await query
    .orderBy(orderByClause)
    .limit(limit + 1); // Get one extra to check if there are more

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return buildPaginatedResponse(data, limit, cursorField, hasMore, 'forward');
}
