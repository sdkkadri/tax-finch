import { eq, like, gte, lte, desc, asc, sql } from "drizzle-orm";
import type { QueryOptions } from "../middlewares/queryParser";

export async function runQuery(db: any, baseQuery: any, options: QueryOptions) {
  const { resourceConfig, ordering, filters, fromPage, toPage, limit } = options;

  // Build two queries: one for results (with sorting), one for count (without pagination)
  let queryForResults = baseQuery;
  let queryForCount = baseQuery;

  if (resourceConfig?.filterConfig) {
    queryForResults = applyFilters(queryForResults, filters, resourceConfig.filterConfig);
    queryForCount = applyFilters(queryForCount, filters, resourceConfig.filterConfig);
  }

  if (resourceConfig?.sortConfig) {
    queryForResults = applySorting(
      queryForResults,
      ordering,
      resourceConfig.sortConfig,
      resourceConfig.defaultOrdering
    );
  }

  return await simplePaginate(db, queryForResults, queryForCount, { fromPage, toPage, limit }, "id");
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

async function simplePaginate(
  db: any,
  resultsQuery: any,
  countQuery: any,
  pagination: { fromPage: number; toPage: number; limit: number },
  cursorField: string
) {
  const { fromPage, toPage, limit } = pagination;
  
  // Get total count for pagination info (count over the full filtered/sorted query)
  // IMPORTANT: do this BEFORE applying limit/offset to avoid mutating underlying builders
  const countRows = await db.select({ count: sql`count(*)` }).from(countQuery.as("count_query"));
  const total = Number(countRows[0]?.count ?? 0);

  // Calculate offset for pagination
  const offset = (fromPage - 1) * limit;
  
  // Execute query with pagination
  const results = await resultsQuery.limit(limit).offset(offset);

  return {
    data: results,
    pagination: {
      fromPage,
      toPage,
      limit,
      total,
      hasNextPage: (offset + results.length) < total,
      hasPrevPage: fromPage > 1,
    },
  };
}
