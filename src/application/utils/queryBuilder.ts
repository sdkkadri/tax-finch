import { SQLWrapper, eq, like, gte, lte, desc, asc } from "drizzle-orm";

/**
 * Generic filter configuration type
 */
export interface FilterConfig {
  table: any;
  field: string;
  operator: "eq" | "like" | "gte" | "lte" | "in" | "between";
}

/**
 * Generic sort configuration type
 */
export interface SortConfig {
  [key: string]: any; // Field reference from table
}

/**
 * Generic query builder that eliminates repetitive filter/sort logic
 */
export class QueryBuilder<T> {
  private query: any;
  private filterConfig: Record<string, FilterConfig>;
  private sortConfig: SortConfig;
  private defaultSortField: any;

  constructor(
    baseQuery: any,
    filterConfig: Record<string, FilterConfig>,
    sortConfig: SortConfig,
    defaultSortField: any
  ) {
    this.query = baseQuery;
    this.filterConfig = filterConfig;
    this.sortConfig = sortConfig;
    this.defaultSortField = defaultSortField;
  }

  /**
   * Apply filters dynamically based on configuration
   */
  applyFilters(filters: Record<string, any>): this {
    for (const [key, value] of Object.entries(filters)) {
      if (!this.filterConfig[key] || value == null || value === '') continue;
      
      const { table, field, operator } = this.filterConfig[key];
      const tableField = table[field];

      switch (operator) {
        case "eq":
          this.query = this.query.where(eq(tableField, value));
          break;
        case "like":
          this.query = this.query.where(like(tableField, `%${value}%`));
          break;
        case "gte":
          this.query = this.query.where(gte(tableField, value));
          break;
        case "lte":
          this.query = this.query.where(lte(tableField, value));
          break;
        case "in":
          if (Array.isArray(value)) {
            this.query = this.query.where(sql`${tableField} = ANY(${value})`);
          }
          break;
        case "between":
          if (Array.isArray(value) && value.length === 2) {
            this.query = this.query.where(sql`${tableField} BETWEEN ${value[0]} AND ${value[1]}`);
          }
          break;
      }
    }
    return this;
  }

  /**
   * Apply sorting dynamically based on configuration
   */
  applySorting(sort?: { field: string; order: "asc" | "desc" }): this {
    if (sort && this.sortConfig[sort.field]) {
      const field = this.sortConfig[sort.field];
      const orderByClause = sort.order === 'desc' ? desc(field) : asc(field);
      this.query = this.query.orderBy(orderByClause);
    } else {
      this.query = this.query.orderBy(desc(this.defaultSortField));
    }
    return this;
  }

  /**
   * Get the built query
   */
  build(): any {
    return this.query;
  }

  /**
   * Chain methods for fluent API
   */
  static from<T>(
    baseQuery: any,
    filterConfig: Record<string, FilterConfig>,
    sortConfig: SortConfig,
    defaultSortField: any
  ): QueryBuilder<T> {
    return new QueryBuilder(baseQuery, filterConfig, sortConfig, defaultSortField);
  }
}

/**
 * Utility function to create filter configs for common patterns
 */
export function createFilterConfigs(
  configs: Array<{ table: any; fields: string[]; operator: FilterConfig['operator'] }>
): Record<string, FilterConfig> {
  const result: Record<string, FilterConfig> = {};
  
  for (const { table, fields, operator } of configs) {
    for (const field of fields) {
      result[field] = { table, field, operator };
    }
  }
  
  return result;
}

/**
 * Utility function to create sort configs
 */
export function createSortConfig(table: any, fields: string[]): SortConfig {
  return Object.fromEntries(
    fields.map(field => [field, table[field]])
  );
}
