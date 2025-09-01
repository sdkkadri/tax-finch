import { eq, like, gte, lte, desc, asc, sql } from "drizzle-orm";
import type { QueryOptions } from "../middlewares/queryParser";

export async function runQuery(db: any, baseQuery: any, options: QueryOptions) {
  const { resourceConfig, ordering, filters, fromPage, toPage, limit } = options;

  let query = baseQuery;

  if (resourceConfig?.filterConfig) {
    query = applyFilters(query, filters, resourceConfig.filterConfig);
  }

  if (resourceConfig?.sortConfig) {
    query = applySorting(query, ordering, resourceConfig.sortConfig, resourceConfig.defaultOrdering);
  }

  return await simplePaginate(db, query, { fromPage, toPage, limit }, "id");
}

function applyFilters(query: any, filters: Record<string, string>, filterConfig: any) {
  for (const [key, value] of Object.entries(filters)) {
    const config = filterConfig[key];
    if (config) {
      const { table, field, operator } = config;
      
      switch (operator) {
        case "eq":
          query = query.where(eq(table[field], value));
          break;
        case "like":
          query = query.where(like(table[field], `%${value}%`));
          break;
        case "gte":
          query = query.where(gte(table[field], Number(value)));
          break;
        case "lte":
          query = query.where(lte(table[field], Number(value)));
          break;
      }
    }
  }
  return query;
}

function applySorting(query: any, ordering: string, sortConfig: any, defaultOrdering: string) {
  const orderBy = ordering || defaultOrdering;
  const [field, direction] = orderBy.startsWith("-") 
    ? [orderBy.slice(1), "desc"] 
    : [orderBy, "asc"];

  const sortField = sortConfig[field];
  if (sortField) {
    query = query.orderBy(direction === "desc" ? desc(sortField) : asc(sortField));
  }
  
  return query;
}

async function simplePaginate(db: any, query: any, pagination: { fromPage: number; toPage: number; limit: number }, cursorField: string) {
  const { fromPage, toPage, limit } = pagination;
  
  // Calculate offset for pagination
  const offset = (fromPage - 1) * limit;
  
  // Execute query with pagination
  const results = await query.limit(limit).offset(offset);
  
  // Get total count for pagination info
  const countQuery = query.limit(1).offset(0);
  const totalCount = await db.select({ count: sql`count(*)` }).from(countQuery.as("count_query"));
  
  return {
    data: results,
    pagination: {
      fromPage,
      toPage,
      limit,
      total: totalCount[0]?.count || 0,
      hasNextPage: results.length === limit,
      hasPrevPage: fromPage > 1,
    },
  };
}

