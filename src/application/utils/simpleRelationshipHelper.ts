import { sql, eq, like, desc, asc } from "drizzle-orm";
import type { QueryOptions, PaginatedResponse } from "./queryHelper";

/**
 * Simple relationship pagination - just build your Drizzle query and paginate it!
 * No metadata, no configuration, just pure Drizzle + QueryHelper
 */
export async function paginateQuery<T>(
  query: any,
  options: QueryOptions,
  cursorField: string = 'id'
): Promise<PaginatedResponse<T>> {
  const { limit, cursor, sort } = options;
  
  // Add cursor condition if provided
  if (cursor) {
    const sortOrder = sort?.order || 'desc';
    const cursorCondition = sortOrder === 'desc' 
      ? sql`${cursorField} < ${cursor}`
      : sql`${cursorField} > ${cursor}`;
    query = query.where(cursorCondition);
  }

  // Execute query with pagination
  const results = await query
    .limit(limit + 1); // Get one extra to check if there are more

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data,
    pagination: {
      limit,
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1][cursorField] : null,
      prevCursor: data.length > 0 ? data[0][cursorField] : null,
      hasNextPage: hasMore,
      hasPrevPage: !!cursor,
    },
  };
}

/**
 * Even simpler: just paginate any Drizzle query with automatic cursor handling
 */
export async function simplePaginate<T>(
  db: any,
  baseQuery: any,
  options: QueryOptions,
  cursorField: string = 'id'
): Promise<PaginatedResponse<T>> {
  const { limit, cursor, sort } = options;
  
  // Build the query
  let query = baseQuery;
  
  // Add cursor condition if provided
  if (cursor) {
    const sortOrder = sort?.order || 'desc';
    const cursorCondition = sortOrder === 'desc' 
      ? sql`${cursorField} < ${cursor}`
      : sql`${cursorField} > ${cursor}`;
    query = query.where(cursorCondition);
  }

  // Execute with pagination
  const results = await query
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data,
    pagination: {
      limit,
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1][cursorField] : null,
      prevCursor: data.length > 0 ? data[0][cursorField] : null,
      hasNextPage: hasMore,
      hasPrevPage: !!cursor,
    },
  };
}

/**
 * Dynamic filter builder - eliminates all the repetitive if statements!
 */
export function applyFilters(
  query: any,
  filters: Record<string, string | number>,
  filterConfig: Record<string, { table: any; field: string; operator: 'eq' | 'like' | 'gte' | 'lte' }>
): any {
  let filteredQuery = query;
  
  for (const [key, value] of Object.entries(filters)) {
    if (filterConfig[key] && value !== undefined && value !== '') {
      const { table, field, operator } = filterConfig[key];
      const tableField = table[field];
      
      switch (operator) {
        case 'eq':
          filteredQuery = filteredQuery.where(eq(tableField, value));
          break;
        case 'like':
          filteredQuery = filteredQuery.where(like(tableField, `%${value}%`));
          break;
        case 'gte':
          filteredQuery = filteredQuery.where(sql`${tableField} >= ${value}`);
          break;
        case 'lte':
          filteredQuery = filteredQuery.where(sql`${tableField} <= ${value}`);
          break;
      }
    }
  }
  
  return filteredQuery;
}

/**
 * Dynamic sorting - eliminates repetitive sorting logic!
 */
export function applySorting(
  query: any,
  sort: { field: string; order: "asc" | "desc" } | undefined,
  sortConfig: Record<string, any>,
  defaultSort: any
): any {
  if (sort && sortConfig[sort.field]) {
    const field = sortConfig[sort.field];
    const orderByClause = sort.order === 'desc' ? desc(field) : asc(field);
    return query.orderBy(orderByClause);
  }
  
  // Default sorting
  return query.orderBy(desc(defaultSort));
}
