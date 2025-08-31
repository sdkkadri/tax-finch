import { queryEngineConfig } from "../configs/queryEngine.config";
import type { Context, Next } from "hono";

export interface QueryOptions {
  fromPage: number;
  toPage: number;
  limit: number;
  ordering: string;
  filters: Record<string, string>;
  resourceConfig?: any;
}

export const queryParser = () => {
  return async (c: Context, next: Next) => {
    const url = new URL(c.req.url);

    // pagination (cursor-based with from_page/to_page)
    const fromPage = Number(url.searchParams.get("from_page") ?? 1);
    const toPage = Number(url.searchParams.get("to_page") ?? fromPage);
    const limit = Math.min(
      Number(url.searchParams.get("limit") ?? queryEngineConfig.defaultLimit),
      queryEngineConfig.maxLimit
    );

    // sorting
    const ordering = url.searchParams.get("ordering") ?? queryEngineConfig.defaultOrdering;

    // filters
    const filters: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (!["from_page", "to_page", "limit", "ordering"].includes(key)) {
        filters[key] = value;
      }
    });

    // figure out resource (ex: /orders, /users)
    const [_, resource] = c.req.path.split("/"); // crude but works
    const resourceConfig = queryEngineConfig.resources[resource as keyof typeof queryEngineConfig.resources];

    c.set("queryOptions", {
      fromPage,
      toPage,
      limit,
      ordering,
      filters,
      resourceConfig,
    });

    await next();
  };
};
